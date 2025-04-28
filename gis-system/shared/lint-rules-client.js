import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import boundaries from 'eslint-plugin-boundaries'
import sonarjs from 'eslint-plugin-sonarjs'

export default [
  react.configs.recommended,
  reactHooks.configs.recommended,
  jsxA11y.configs.recommended,
  {
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      boundaries,
      sonarjs,
    },
    rules: {
      'react/no-array-index-key': 'warn',
      'react/display-name': 'off',
      'react/function-component-definition': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/require-default-props': 'off',
      'react/jsx-filename-extension': [
        'error',
        { extensions: ['.jsx', '.tsx'] },
      ],
      'react/jsx-props-no-spreading': 'off',
      'react/prop-types': 'off',
      'jsx-a11y/click-events-have-key-events': 'off',
      'jsx-a11y/no-noninteractive-element-interactions': 'off',
      'react/no-access-state-in-setstate': 'error',
      'react/no-unescaped-entities': 'off',
      'react/no-danger': 'error',
      'react/no-multi-comp': 'error',
      'react/no-this-in-sfc': 'error',
      'react/prefer-stateless-function': [
        'error',
        { ignorePureComponents: true },
      ],
      'react/jsx-no-bind': ['error', { allowArrowFunctions: true }],
      'react/jsx-no-literals': 'off',
      'react/jsx-no-useless-fragment': 'error',
      'react/jsx-pascal-case': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react/jsx-uses-react': 'off',
      'boundaries/element-types': [
        'warn',
        {
          default: 'disallow',
          rules: [
            {
              from: 'app',
              allow: [
                'processes',
                'pages',
                'widgets',
                'features',
                'entities',
                'shared',
              ],
            },
            {
              from: 'processes',
              allow: ['pages', 'widgets', 'features', 'entities', 'shared'],
            },
            {
              from: 'pages',
              allow: ['widgets', 'features', 'entities', 'shared'],
            },
            { from: 'widgets', allow: ['features', 'entities', 'shared'] },
            { from: 'features', allow: ['entities', 'shared'] },
            { from: 'entities', allow: ['shared'] },
            { from: 'shared', allow: ['shared'] },
          ],
        },
      ],
    },
    ignores: ['node_modules/', 'dist/', 'build/'],
  },
]
