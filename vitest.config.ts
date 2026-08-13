/*
 *   IMPORTS
 ***************************************************************************************************/
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

/*
 *   VITEST CONFIG
 ***************************************************************************************************/
export default defineConfig({
	plugins: [react()],
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: './src/test/setup.ts',
		include: ['src/**/*.{test,spec}.{ts,tsx}'],
		clearMocks: true,
		restoreMocks: true,
		css: {
			modules: {
				classNameStrategy: 'non-scoped',
			},
		},
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html', 'lcov'],
			include: ['src/**/*.{ts,tsx}'],
			exclude: ['src/test/**', '**/*.d.ts', '**/*.config.*', '**/mockData/**'],
		},
	},
	resolve: {
		alias: {
			'@': resolve('./src'),
		},
	},
	css: {
		preprocessorOptions: {
			scss: {
				loadPaths: ['./src/styles'],
			},
		},
	},
})
