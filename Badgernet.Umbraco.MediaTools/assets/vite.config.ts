import { defineConfig } from "vite";

export default defineConfig({
    build: {
        minify: true,
        lib: {
            entry: "src/index.ts", 
            formats: ["es"],
        },
        outDir: "../wwwroot/App_Plugins/Badgernet.Umbraco.MediaTools", 
        emptyOutDir: true,
        sourcemap: false,
        rollupOptions: {
            external: [/^@umbraco/],
        },
    },
});