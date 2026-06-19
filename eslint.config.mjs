import next from "eslint-config-next";
import prettier from "eslint-config-prettier";

export default [
  ...next,
  prettier,
  {
    rules: {
      quotes: ["error", "double"],
      semi: ["error", "always"],
    },
  },
];
