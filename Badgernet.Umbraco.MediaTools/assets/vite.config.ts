import { defineConfig } from "vite";

export default defineConfig(({ mode, command }) => {
    const isProduction = mode === 'production';
    const isBuild = command === 'build';

    console.log('=== VITE CONFIG DEBUG ===');
    console.log('Mode:', mode);
    console.log('Command:', command);
    console.log('isProduction:', isProduction);
    console.log('isBuild:', isBuild);
    console.log('Minify:', isProduction ? 'terser' : false);
    console.log('======================');

    return {
        assetsInclude: ["**/*.wasm"],
        build: {
            minify: isProduction ? 'terser' : false,
            lib: {
                entry: "src/index.ts",
                formats: ["es"],
            },
            outDir: "../wwwroot/App_Plugins/Badgernet.Umbraco.MediaTools",
            emptyOutDir: isBuild,
            sourcemap: !isProduction, // Sourcemaps only in development
            rollupOptions: {
                external: [/^@umbraco/],
            },
            ...(isProduction && {
                terserOptions: {
                    compress: {
                        drop_console: true,
                        drop_debugger: true,
                        booleans_as_integers: true,
                        pure_funcs: ['console.log', 'console.info', 'console.warn', 'console.error'],
                    },
                    format: {
                        comments: false,
                        beutify: false,
                        preamble: '/* minified */',
                    }
                }
            })
        }
    };
});