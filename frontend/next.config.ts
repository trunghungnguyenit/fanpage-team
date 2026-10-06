import path from "node:path";
import type { NextConfig } from "next";

// Gốc monorepo (npm workspaces): node_modules được hoist lên thư mục gốc.
const monorepoRoot = path.join(__dirname, "..");

const nextConfig: NextConfig = {
  outputFileTracingRoot: monorepoRoot,
  turbopack: {
    root: monorepoRoot,
  },
};

export default nextConfig;
