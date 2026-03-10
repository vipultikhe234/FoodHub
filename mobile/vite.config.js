import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    build: {
        rollupOptions: {
            output: {
                // Split vendor chunks for faster repeat loads
                manualChunks: {
                    'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                    'stripe-vendor': ['@stripe/react-stripe-js', '@stripe/stripe-js'],
                    'axios': ['axios'],
                }
            }
        },
        // Increase chunk warning threshold
        chunkSizeWarningLimit: 1000,
    },
    server: {
        // Faster HMR
        hmr: { overlay: true },
        // Pre-bundle heavy deps
        warmup: {
            clientFiles: [
                './src/pages/Home.jsx',
                './src/pages/Cart.jsx',
                './src/pages/Checkout.jsx',
            ]
        }
    },
    optimizeDeps: {
        // Force pre-bundle on startup for faster first load
        include: [
            'react',
            'react-dom',
            'react-router-dom',
            'axios',
            '@stripe/react-stripe-js',
            '@stripe/stripe-js',
        ]
    }
})
