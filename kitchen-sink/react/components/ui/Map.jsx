import React, { useEffect, useRef, useState, createContext, useContext, useMemo, useCallback } from 'react';
import MapLibreGL from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { createPortal } from 'react-dom';

const MapContext = createContext(null);

export function useMap() {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMap must be used within a Map component');
  }
  return context;
}

const defaultStyles = {
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
};

export const Map = React.forwardRef(function Map(
  { children, center = [0, 0], zoom = 12, theme = 'light', ...props },
  ref
) {
  const containerRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const styleUrl = theme === 'dark' ? defaultStyles.dark : defaultStyles.light;

    const map = new MapLibreGL.Map({
      container: containerRef.current,
      style: styleUrl,
      center: center,
      zoom: zoom,
      renderWorldCopies: false,
      attributionControl: {
        compact: true,
      },
      ...props,
    });

    const loadHandler = () => setIsLoaded(true);
    map.on('load', loadHandler);

    setMapInstance(map);

    if (ref) {
      if (typeof ref === 'function') {
        ref(map);
      } else {
        ref.current = map;
      }
    }

    return () => {
      map.off('load', loadHandler);
      map.remove();
      setIsLoaded(false);
      setMapInstance(null);
    };
  }, []);

  useEffect(() => {
    if (!mapInstance || !theme) return;

    const newStyle = theme === 'dark' ? defaultStyles.dark : defaultStyles.light;
    mapInstance.setStyle(newStyle, { diff: true });
  }, [mapInstance, theme]);

  const contextValue = useMemo(
    () => ({
      map: mapInstance,
      isLoaded: isLoaded,
    }),
    [mapInstance, isLoaded]
  );

  return (
    <MapContext.Provider value={contextValue}>
      <div ref={containerRef} className="relative w-full h-full">
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse [animation-delay:150ms]" />
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse [animation-delay:300ms]" />
            </div>
          </div>
        )}
        {mapInstance && children}
      </div>
    </MapContext.Provider>
  );
});

const MarkerContext = createContext(null);

function useMarkerContext() {
  const context = useContext(MarkerContext);
  if (!context) {
    throw new Error('Marker components must be used within MapMarker');
  }
  return context;
}

export function MapMarker({
  longitude,
  latitude,
  children,
  onClick,
  onMouseEnter,
  onMouseLeave,
  draggable = false,
  ...markerOptions
}) {
  const { map } = useMap();

  // Validate coordinates
  const isValidCoordinate = (value) => {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
  };

  // Don't render if coordinates are invalid
  if (!isValidCoordinate(longitude) || !isValidCoordinate(latitude)) {
    console.warn('Invalid marker coordinates:', { longitude, latitude });
    return null;
  }

  const marker = useMemo(() => {
    const markerInstance = new MapLibreGL.Marker({
      ...markerOptions,
      element: document.createElement('div'),
      draggable,
    }).setLngLat([longitude, latitude]);

    const handleClick = (e) => onClick?.(e);
    const handleMouseEnter = (e) => onMouseEnter?.(e);
    const handleMouseLeave = (e) => onMouseLeave?.(e);

    markerInstance.getElement()?.addEventListener('click', handleClick);
    markerInstance.getElement()?.addEventListener('mouseenter', handleMouseEnter);
    markerInstance.getElement()?.addEventListener('mouseleave', handleMouseLeave);

    return markerInstance;
  }, []);

  useEffect(() => {
    if (!map) return;

    marker.addTo(map);

    return () => {
      marker.remove();
    };
  }, [map]);

  if (
    marker.getLngLat().lng !== longitude ||
    marker.getLngLat().lat !== latitude
  ) {
    marker.setLngLat([longitude, latitude]);
  }

  return (
    <MarkerContext.Provider value={{ marker, map }}>
      {children}
    </MarkerContext.Provider>
  );
}

export function MarkerContent({ children, className = '' }) {
  const { marker } = useMarkerContext();

  return createPortal(
    <div className={`relative cursor-pointer ${className}`}>
      {children || <div className="relative h-4 w-4 rounded-full border-2 border-white bg-blue-500 shadow-lg" />}
    </div>,
    marker.getElement()
  );
}

export function MarkerTooltip({ children, className = '' }) {
  const { marker, map } = useMarkerContext();
  const container = useMemo(() => document.createElement('div'), []);

  const tooltip = useMemo(() => {
    const tooltipInstance = new MapLibreGL.Popup({
      offset: 16,
      closeOnClick: true,
      closeButton: false,
    }).setMaxWidth('none');

    return tooltipInstance;
  }, []);

  useEffect(() => {
    if (!map) return;

    tooltip.setDOMContent(container);

    const handleMouseEnter = () => {
      tooltip.setLngLat(marker.getLngLat()).addTo(map);
    };
    const handleMouseLeave = () => tooltip.remove();

    marker.getElement()?.addEventListener('mouseenter', handleMouseEnter);
    marker.getElement()?.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      marker.getElement()?.removeEventListener('mouseenter', handleMouseEnter);
      marker.getElement()?.removeEventListener('mouseleave', handleMouseLeave);
      tooltip.remove();
    };
  }, [map]);

  return createPortal(
    <div className={`rounded-md bg-black dark:bg-white px-2 py-1 text-xs text-white dark:text-black shadow-md ${className}`}>
      {children}
    </div>,
    container
  );
}

export function MapControls({
  position = 'bottom-right',
  showZoom = true,
  showLocate = false,
  onLocate,
  className = '',
}) {
  const { map } = useMap();
  const [waitingForLocation, setWaitingForLocation] = useState(false);

  const positionClasses = {
    'top-left': 'top-2 left-2',
    'top-right': 'top-2 right-2',
    'bottom-left': 'bottom-24 left-2',
    'bottom-right': 'bottom-24 right-2',
  };

  const handleZoomIn = useCallback(() => {
    map?.zoomTo(map.getZoom() + 1, { duration: 300 });
  }, [map]);

  const handleZoomOut = useCallback(() => {
    map?.zoomTo(map.getZoom() - 1, { duration: 300 });
  }, [map]);

  const handleLocate = useCallback(() => {
    setWaitingForLocation(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            longitude: pos.coords.longitude,
            latitude: pos.coords.latitude,
          };
          map?.flyTo({
            center: [coords.longitude, coords.latitude],
            zoom: 14,
            duration: 1500,
          });
          onLocate?.(coords);
          setWaitingForLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setWaitingForLocation(false);
        }
      );
    }
  }, [map, onLocate]);

  return (
    <div className={`absolute z-10 flex flex-col gap-1.5 ${positionClasses[position]} ${className}`}>
      {showZoom && (
        <div className="flex flex-col rounded-lg border border-white/20 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg overflow-hidden">
          <button
            onClick={handleZoomIn}
            aria-label="Zoom in"
            type="button"
            className="flex items-center justify-center w-10 h-10 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <span className="text-xl font-medium">+</span>
          </button>
          <div className="border-t border-white/20 dark:border-gray-700/50" />
          <button
            onClick={handleZoomOut}
            aria-label="Zoom out"
            type="button"
            className="flex items-center justify-center w-10 h-10 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <span className="text-xl font-medium">−</span>
          </button>
        </div>
      )}
      {showLocate && (
        <div className="flex flex-col rounded-lg border border-white/20 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg overflow-hidden">
          <button
            onClick={handleLocate}
            aria-label="Find my location"
            type="button"
            disabled={waitingForLocation}
            className="flex items-center justify-center w-10 h-10 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {waitingForLocation ? (
              <span className="text-xl animate-spin">⟳</span>
            ) : (
              <span className="text-xl">⊙</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
