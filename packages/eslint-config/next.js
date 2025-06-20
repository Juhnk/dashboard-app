/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: [
    './react.js',
    'next/core-web-vitals'
  ],
  env: {
    browser: true,
    node: true
  },
  rules: {
    // Next.js specific rules
    '@next/next/no-html-link-for-pages': 'error',
    '@next/next/no-img-element': 'error',
    '@next/next/no-page-custom-font': 'warn',
    '@next/next/no-sync-scripts': 'error',
    '@next/next/no-title-in-document-head': 'error',
    '@next/next/no-unwanted-polyfillio': 'error',
    
    // Performance rules
    '@next/next/no-css-tags': 'error',
    '@next/next/no-head-element': 'error',
    '@next/next/no-script-component-in-head': 'error',
    '@next/next/no-styled-jsx-in-document': 'error',
    '@next/next/no-document-import-in-page': 'error',
    '@next/next/no-head-import-in-document': 'error',
    
    // App Router specific (Next.js 13+)
    '@next/next/no-async-client-component': 'error',
    '@next/next/no-assign-module-variable': 'error'
  },
  overrides: [
    {
      files: ['**/app/**/*.tsx', '**/app/**/*.ts'],
      rules: {
        // App Router specific overrides
        'import/no-default-export': 'off' // App Router uses default exports for pages
      }
    },
    {
      files: ['**/pages/**/*.tsx', '**/pages/**/*.ts'],
      rules: {
        // Pages Router specific overrides
        'import/no-default-export': 'off' // Pages Router uses default exports for pages
      }
    }
  ]
};