import type { Configuration } from "lint-staged";

const config: Configuration = {
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,css,md,html,yml,yaml}": ["prettier --write"],
};

export default config;
