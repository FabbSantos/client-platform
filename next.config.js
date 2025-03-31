/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Permitir uso do sistema de arquivos para armazenar dados (apenas para desenvolvimento)
  serverRuntimeConfig: {
    PROJECT_ROOT: __dirname
  }
}

module.exports = nextConfig
