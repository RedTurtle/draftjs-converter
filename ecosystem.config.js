module.exports = {
  apps: [
    {
      name: "draftjs-converter",
      script: "./index.js",
      watch: true,
      env: {
        PORT: 9000,
      },
    },
  ],
};
