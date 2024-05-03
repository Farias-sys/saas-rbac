/**@type {import('eslint').Linter.Config} */
module.exports = {
    extends: ['@rocketseat/eslint-config/node'],
    plugins: ['simple-import-sort'],
    rules: {
      'simple-impot-sort/imports':'error'
    } 
  }