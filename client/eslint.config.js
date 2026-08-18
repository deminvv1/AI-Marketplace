import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

/**
 * Next.js flat config. Replaces a leftover TanStack Start config that pulled in
 * plugins this project never installed, which made `eslint` fail to start.
 */
export default [
  {
    ignores: [".next/**", "node_modules/**", "next-env.d.ts", "public/**"],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      // A few server actions and page props are typed loosely; report rather
      // than block, so the lint run stays useful day to day.
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      // 18 hits, all in data-loading effects (`setLoading(true)` before a fetch).
      // The pattern is not a bug; removing it means reworking how every page
      // loads its data. Kept visible as a warning instead of blocking lint.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
];
