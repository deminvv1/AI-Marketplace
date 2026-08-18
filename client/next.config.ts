import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // No extra config needed — next-intl plugin handles locale routing
};

export default withNextIntl(nextConfig);
