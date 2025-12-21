import { baseConfig } from './eslint.config.base.js'

export default [
	...baseConfig,
	{
		ignores: ['node_modules', 'dist', '**/__tests__/**'],
	},
	{
		files: ['scripts/**/*.js'],
		rules: {
			'no-console': 'off',
		},
	},
]
