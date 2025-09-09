import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Türkçe karakter desteği için
  serverExternalPackages: [],
  
  // Turbopack kullanırken webpack config'i kaldırıldı
  // UTF-8 encoding Next.js tarafından otomatik desteklenir
};

export default nextConfig;