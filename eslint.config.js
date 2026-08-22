import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist', 'node_modules', '.vite'] },
  { files: ['**/*.{js,jsx}'], languageOptions: { ecmaVersion: 2022, globals: { ...globals.browser, ...globals.node }, parserOptions: { ecmaFeatures: { jsx: true }, sourceType: 'module' } }, plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh }, rules: { ...js.configs.recommended.rules, 'no-unused-vars': ['error', { varsIgnorePattern: '^(Icon|IconComponent)$' }], 'react-hooks/rules-of-hooks': 'error', 'react-hooks/exhaustive-deps': 'warn', 'react-refresh/only-export-components': 'off' } },
  { files: ['src/App.jsx', 'src/main.jsx'], rules: { 'no-unused-vars': 'off' } },
]
