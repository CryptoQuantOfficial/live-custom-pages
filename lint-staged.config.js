// lint-staged.config.js
module.exports = {
  // Lint then format HTML files
  '*.(html)': (filenames) => [`npx prettier --write ${filenames.join(' ')}`],
};
