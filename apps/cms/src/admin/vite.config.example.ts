import { type UserConfig, mergeConfig } from 'vite'

const viteConfig = (config: UserConfig) => {
  // Important: always return the modified config
  return mergeConfig(config, {
    resolve: {
      alias: {
        '@': '/src'
      }
    }
  })
}

export default viteConfig
