import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // This tells Vite’s dev optimizer to skip bundling jsPDF
  optimizeDeps: {
    exclude: ['jspdf']
  },

  // And this tells Rollup (which Vite uses under the hood for building)
  // to treat jsPDF as an external library, not bundling it
  build: {
    rollupOptions: {
      external: ['jspdf']
    }
  }
})
