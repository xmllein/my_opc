import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  turbopack: { root: process.cwd() },
  transpilePackages: ['@ant-design/web3', '@ant-design/web3-wagmi', '@ant-design/web3-common', '@ant-design/web3-assets'],
  devIndicators: false,
};
export default nextConfig;
