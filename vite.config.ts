import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
     VitePWA({
       registerType: "autoUpdate",
       includeAssets: [
         "funcharity-favicon.png",
         "funcharity-icon-192.png",
         "funcharity-icon-512.png",
         "funcharity-apple-touch-icon.png",
       ],
       manifest: {
         name: "FUN Charity - Web3 Social Charity",
         short_name: "FUN Charity",
         description: "Web3 Social Charity Platform - Transparent Giving",
         theme_color: "#7c3aed",
         background_color: "#0a0a0f",
         display: "standalone",
         orientation: "portrait",
         scope: "/",
         start_url: "/",
         icons: [
           {
             src: "/funcharity-icon-192.png",
             sizes: "192x192",
             type: "image/png",
             purpose: "any",
           },
           {
             src: "/funcharity-icon-512.png",
             sizes: "512x512",
             type: "image/png",
             purpose: "any",
           },
           {
             src: "/funcharity-apple-touch-icon.png",
             sizes: "180x180",
             type: "image/png",
             purpose: "any",
           },
           {
             src: "/funcharity-icon-512.png",
             sizes: "512x512",
             type: "image/png",
             purpose: "maskable",
           },
         ],
       },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        maximumFileSizeToCacheInBytes: 7 * 1024 * 1024, // 7 MiB - increased for mapbox-gl
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
