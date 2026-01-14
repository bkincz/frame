import type { Linter } from 'eslint'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'
import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import prettier from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'

export const baseConfig: Linter.Config[] = [
	js.configs.recommended,
	prettierConfig,
	{
		languageOptions: {
			ecmaVersion: 2020,
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
		plugins: {
			prettier,
		},
		rules: {
			'no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
				},
			],
			'no-console': 'warn',
			'prettier/prettier': 'warn',
		},
	},
	// TypeScript files
	{
		files: ['**/*.ts', '**/*.tsx'],
		languageOptions: {
			parser: tsparser,
			globals: {
				...globals.browser,
				...globals.node,
			},
			parserOptions: {
				ecmaVersion: 2020,
				sourceType: 'module',
				ecmaFeatures: {
					jsx: true,
				},
			},
		},
		plugins: {
			'@typescript-eslint': tseslint,
			react,
			'react-hooks': reactHooks,
			'react-refresh': reactRefresh,
		},
		settings: {
			react: {
				version: 'detect',
			},
		},
		rules: {
			'no-unused-vars': 'off',
			'no-undef': 'off', // TypeScript handles this
			'no-console': 'off',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
				},
			],
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-non-null-assertion': 'warn',
			// React rules
			'react/react-in-jsx-scope': 'off',
			'react/prop-types': 'off',
			'react-hooks/rules-of-hooks': 'off',
			'react-hooks/exhaustive-deps': 'warn',
			'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
		},
	},
]
