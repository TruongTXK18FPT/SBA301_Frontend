import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    assetsInclude: ['**/*.mp4'],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        }
    },
    build: {
        rollupOptions: {
            output: {
                assetFileNames: 'assets/[name].[ext]'
            }
        }
    }
});
