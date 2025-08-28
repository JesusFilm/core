import nextConfig from '../../libs/shared/eslint/next.mjs'

export default [...nextConfig, { ignores: ['apps/docs/.docusaurus/*'] }]
