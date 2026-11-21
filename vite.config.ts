import { defineConfig } from "vite";
export default defineConfig({
  base: "./",
  build: { rollupOptions: { input: "postcard.html" } },
  plugins: [{
    name: "postcard-dev-home",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url?.split("?")[0] === "/" || req.url?.split("?")[0] === "/index.html") req.url = "/postcard.html";
        next();
      });
    },
  }],
});
