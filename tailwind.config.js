module.exports = {
  content: ["./dist/*/*.{html,js}", "./dist/*.{html,js}"],
  theme: {
    extend: {
      fontFamily: {
        body: [
          "Martel Sans",
          "Gotham",
          "Roboto",
          "Noto Sans",
          "Helvetica",
          "Calibri",
        ],
      },
      colors: {
        "deep-teal": "#093c44",
        "dark-teal": "#115e6e",
        "light-teal": "#2f8d98",
        green: "#b5cd34",
        orange: "#f7941e",
        "dark-gray": "#414042",
        "light-gray": "#6d6e71",
        "ada-green": "#6a7f17",
        "ada-orange": "#ac6610",
        "mp-teal": "#4796AA",
        "mp-blue": "#14A0C6",
        "mp-azure": "#D6E7EB",
      },
    },
  },
  plugins: [],
};
