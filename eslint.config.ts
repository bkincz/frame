import type { Linter } from 'eslint'
import { baseConfig } from './eslint.config.base.js'

const config: Linter.Config[] = [
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

export default config
