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
       manifestFilename: "manifest-v4.webmanifest",
       includeAssets: [
         "funcharity-favicon-v4.png",
         "funcharity-icon-192-v4.png",
         "funcharity-icon-512-v4.png",
         "funcharity-apple-touch-icon-v4.png",
       ],
       manifest: {
         id: "/?pwa=v4",
         name: "FUN Charity",
         short_name: "FUN Charity",
         description: "Web3 Social Charity Platform - Transparent Giving",
         theme_color: "#7c3aed",
         background_color: "#0a0a0f",
         display: "standalone",
         orientation: "portrait",
         scope: "/",
         start_url: "/?pwa=v4",
         icons: [
           {
             src: "/funcharity-icon-192-v4.png",
             sizes: "192x192",
             type: "image/png",
             purpose: "any",
           },
           {
             src: "/funcharity-icon-512-v4.png",
             sizes: "512x512",
             type: "image/png",
             purpose: "any",
           },
           {
             src: "/funcharity-apple-touch-icon-v4.png",
             sizes: "180x180",
             type: "image/png",
             purpose: "any",
           },
           {
             src: "/funcharity-icon-512-v4.png",
             sizes: "512x512",
             type: "image/png",
             purpose: "maskable",
           },
         ],
         related_applications: [],
         prefer_related_applications: false,
       },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        maximumFileSizeToCacheInBytes: 7 * 1024 * 1024,
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
        enabled: mode === "development",
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
