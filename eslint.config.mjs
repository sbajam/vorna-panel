module.exports = {
  parser: 'vue-eslint-parser', // استفاده از vue-eslint-parser
  parserOptions: {
    parser: '@babel/eslint-parser',
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-essential',
  ],
  rules: {
    // قوانین خاص برای Vue
  },
};
