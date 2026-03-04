import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

/**
 * @title AOXC Neural OS - Build Engine Ultimate
 * @notice Maximum performance chunking & forensic code stripping.
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProd = mode === 'production';

  return {
    plugins: [react(), tailwindcss()],

    define: {
      'process.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
      'process.env.VITE_SYSTEM_MODE': JSON.stringify(env.VITE_SYSTEM_MODE || mode),
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    build: {
      chunkSizeWarningLimit: 800, // Daha disiplinli bir limit
      minify: isProd ? 'terser' : 'esbuild',
      
      terserOptions: {
        compress: {
          drop_console: isProd,
          drop_debugger: true,
          // Saf fonksiyonları işaretleyerek Terser'in daha iyi kod temizlemesini sağlarız.
          pure_funcs: isProd ? ['console.log', 'console.info', 'console.debug'] : [],
          passes: 2, // Kodu optimize etmek için üzerinden iki kez geçer.
        },
        format: {
          comments: false, // Üretim kodunda tek bir yorum satırı bile bırakmaz.
        },
      },

      rollupOptions: {
        output: {
          // STRATEJİK CHUNKING: 1MB'lık dev dosyayı küçük atomlara bölüyoruz.
          manualChunks(id) {
            // Node_modules içindeki kütüphaneleri işlevlerine göre ayır
            if (id.includes('node_modules')) {
              if (id.includes('@google/generative-ai')) return 'neural-ai';
              if (id.includes('ethers') || id.includes('viem') || id.includes('@adraffy/ens-normalize')) return 'neural-eth';
              if (id.includes('framer-motion')) return 'kernel-motion';
              if (id.includes('lucide-react')) return 'neural-viz';
              if (id.includes('i18next')) return 'neural-i18n';
              // Geri kalan büyük kütüphaneleri 'vendor' paketine at
              return 'vendor';
            }
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        },
      },
    },

    server: {
      port: 3000,
      strictPort: true,
      hmr: true,
      host: true,
    },

    esbuild: {
      // Esbuild, Terser'den önce hızlı bir temizlik yapar.
      drop: isProd ? ['console', 'debugger'] : [],
      legalComments: 'none',
    },
  };
});
