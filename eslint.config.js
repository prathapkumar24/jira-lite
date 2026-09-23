import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierPlugin from 'eslint-plugin-prettier';
import configPrettier from 'eslint-config-prettier';

export default tseslint.config(
  // Inherit native recommended baseline rulesets
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Define global monorepo rules
  {
    plugins: {
      prettier: prettierPlugin,
    },
    languageOptions: {
      parserOptions: {
        project: false,
        tsconfigRootDir: import.meta.dirname,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      // Execute prettier violations as explicit compilation lint errors
      'prettier/prettier': ['error', {}, { usePrettierrc: true }],

      // Strict senior-level quality parameters
      '@typescript-eslint/no-explicit-any': 'error', // Defends against escaping type safety
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ], // Flags decaying code variables
      'no-console': ['warn', { allow: ['warn', 'error'] }], // Prevents debugging statements reaching production
      'no-debugger': 'error', // Halts execution breakpoints leaks
      'prefer-const': 'error', // Enforces immutable assignment structures
      'no-duplicate-imports': 'error', // Keeps compilation package resolution lean
    },
  },

  {
    files: ['**/__tests__/**/*.[jt]s', '**/*.test.[jt]s', '**/*.spec.[jt]s'],
    rules: {
      'no-console': 'off', // Allows debugging logs while writing/running tests
      '@typescript-eslint/no-explicit-any': 'off', // Allows using 'any' when mocking complex structures
    },
  },

  // Integrate Prettier formatting conflict override configurations
  configPrettier,

  // Folders to target and folders to completely shield from analysis
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/coverage/**',
      '**/apps/backend/src/auth/__tests__/**',
    ],
  },
);
