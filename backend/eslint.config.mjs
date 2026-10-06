import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
  ...tseslint.configs.recommended,
  {
    rules: {
      // Cho phép tham số bắt đầu bằng "_" khi buộc phải khai báo mà không dùng (vd: next của Express).
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
  globalIgnores(["dist/**"]),
]);
