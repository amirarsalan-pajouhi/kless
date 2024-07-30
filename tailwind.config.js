const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    // Add any additional paths where Material Tailwind components might be used
  ],
  theme: {
    extend: {},
  },
  plugins: [],
});
