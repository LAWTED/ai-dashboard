import type { NextConfig } from "next";
import { codeInspectorPlugin } from "code-inspector-plugin";

const nextConfig: NextConfig = {
  webpack: (config, { dev, isServer }) => {
    config.plugins.push(codeInspectorPlugin({ bundler: "webpack" }));
    return config;
  },
};

export default nextConfig;
