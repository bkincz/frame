import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
	plugins: [
		react(),
		dts({
			include: ['src/**/*'],
			exclude: [
				'src/**/__tests__/**',
				'src/**/*.test.ts',
				'src/**/*.test.tsx',
				'src/main.tsx',
				'src/flows/**',
			],
			rollupTypes: true,
			insertTypesEntry: true,
		}),
	],
	resolve: {
		alias: {
			'@': resolve(__dirname, './src'),
		},
	},
	css: {
		preprocessorOptions: {
			scss: {
				loadPaths: [resolve(__dirname, './src/styles')],
			},
		},
	},
	build: {
		lib: {
			entry: resolve(__dirname, 'src/index.ts'),
			name: 'Frame',
			formats: ['es', 'cjs'],
			fileName: format => `frame.${format === 'es' ? 'mjs' : 'cjs'}`,
		},
		rollupOptions: {
			// Externalize dependencies that shouldn't be bundled
			external: [
				'react',
				'react-dom',
				'react/jsx-runtime',
				'@bkincz/clutch',
				'gsap',
				'clsx',
				'@tabler/icons-react',
			],
			output: {
				// Provide global variables for UMD build
				globals: {
					react: 'React',
					'react-dom': 'ReactDOM',
					'react/jsx-runtime': 'jsxRuntime',
					'@bkincz/clutch': 'Clutch',
					gsap: 'gsap',
					clsx: 'clsx',
					'@tabler/icons-react': 'TablerIconsReact',
				},
				// Preserve CSS modules and inject them
				assetFileNames: assetInfo => {
					if (assetInfo.name === 'style.css') return 'frame.css'
					return assetInfo.name || 'assets/[name][extname]'
				},
			},
		},
		cssCodeSplit: false,
		sourcemap: true,
		// Ensure we're targeting modern browsers for better tree-shaking
		target: 'es2020',
	},
})
