module.exports = {
  plugins: ["jest"],
  extends: ["semistandard", "prettier"],
  env: {
    browser: true,
    "jest/globals": true,
  },
};
