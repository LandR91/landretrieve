import type { Config } from "tailwindcss";
import { tailwindConfig } from "@landretrieve/config/tailwind";

const config: Config = {
  ...tailwindConfig,
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "../../packages/config/src/**/*.{ts,tsx}",
  ],
};

export default config;
