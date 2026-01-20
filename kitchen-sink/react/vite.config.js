import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default {
  base: '',
  plugins: [
    react({
      // Enable Fast Refresh
      fastRefresh: true,
    }),
    tailwindcss(),
  ],
  server: {
    // HMR configuration
    hmr: {
      overlay: true, // Show errors as overlay
    },
    // Watch for changes in these files
    watch: {
      usePolling: false, // Use native file watchers (faster)
    },
  },
};
