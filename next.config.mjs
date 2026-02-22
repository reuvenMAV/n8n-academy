import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['tsx', 'ts', 'jsx', 'js', 'mdx'],
  experimental: {
    mdxRs: false,
  },
  // Production: ensure clean builds
  poweredByHeader: false,
};

export default withNextIntl(nextConfig);
