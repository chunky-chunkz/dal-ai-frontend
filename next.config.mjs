/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',            // statischer Export aktivieren
  images: { unoptimized: true },
  trailingSlash: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
