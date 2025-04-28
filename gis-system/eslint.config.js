// .eslint.config.js (новый формат для ESLint 9+)
import js from '@eslint/js'
import ts from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import importPlugin from 'eslint-plugin-import'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import sonarjs from 'eslint-plugin-sonarjs'
import boundaries from 'eslint-plugin-boundaries'
import unusedImports from 'eslint-plugin-unused-imports'

export default [
  js.configs.recommended,
  {
    // Основные настройки
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      '@typescript-eslint': ts,
      react,
      'react-hooks': reactHooks,
      import: importPlugin,
      'jsx-a11y': jsxA11y,
      sonarjs,
      boundaries,
      'unused-imports': unusedImports,
    },
    languageOptions: {
      globals: {
        module: 'readonly',
        process: 'readonly',
      },
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        project: './tsconfig.json',
      },
    },
    rules: {
      // Базовые правила
      'no-console': 'warn',
      'no-unused-vars': 'off',
      'no-undef': 'off',

      // TypeScript
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-var-requires': 'off',

      // React
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Доступность
      'jsx-a11y/alt-text': 'warn',
      'jsx-a11y/anchor-is-valid': 'warn',

      // Импорты
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
        },
      ],
      'unused-imports/no-unused-imports': 'error',

      // Качество кода
      'sonarjs/no-duplicate-string': 'warn',
      'sonarjs/no-identical-functions': 'warn',

      // FSD Architecture
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            {
              from: 'app',
              allow: [
                'app',
                'processes',
                'pages',
                'widgets',
                'features',
                'entities',
                'shared',
              ],
            },
            {
              from: 'pages',
              allow: ['widgets', 'features', 'entities', 'shared'],
            },
            {
              from: 'widgets',
              allow: ['features', 'entities', 'shared'],
            },
            {
              from: 'features',
              allow: ['entities', 'shared'],
            },
            {
              from: 'entities',
              allow: ['shared'],
            },
            {
              from: 'shared',
              allow: ['shared'],
            },
            {
              from: 'processes',
              allow: ['shared'],
            },
          ],
        },
      ],
    },
    settings: {
      'boundaries/elements': [
        {
          type: 'app',
          pattern: 'src/app/*',
        },
        {
          type: 'processes',
          pattern: 'src/processes/*',
        },
        {
          type: 'pages',
          pattern: 'src/pages/*',
        },
        {
          type: 'widgets',
          pattern: 'src/widgets/*',
        },
        {
          type: 'features',
          pattern: 'src/features/*',
        },
        {
          type: 'entities',
          pattern: 'src/entities/*',
        },
        {
          type: 'shared',
          pattern: 'src/shared/*',
        },
      ],
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      '*.d.ts', // Игнорируем .d.ts файлы
      'tailwind.config.js',
    ],
  },
]
