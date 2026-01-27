import { type UserConfig, mergeConfig } from 'vite'

const viteConfig = (config: UserConfig) => {
  return mergeConfig(config, {
    resolve: {
      alias: {
        '@': '/src'
      }
    }
  })
}

export default viteConfig
