import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Ignore legacy server file (uses CommonJS require)
    "server.js",
    // Ignore public workers (plain JS, no module system)
    "public/workers/**",
  ]),
  {
    rules: {
      // Disable rules that generate errors in this project's specific patterns
      // These are stylistic/performance recommendations, not correctness bugs
      "react/no-unescaped-entities": "off",
      "react-hooks/set-state-in-effect": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-require-imports": "off",
      "@next/next/no-img-element": "warn",
    },
  },
]);

export default eslintConfig;
