export interface FeatureBaseUserInfo {
  email?: string
  userId?: string
  createdAt?: string
  theme?: 'light' | 'dark'
  language?: string
}

export interface FeatureBaseBootConfig {
  appId: string
  email?: string
  userId?: string
  createdAt?: string
  theme?: 'light' | 'dark'
  language?: string
}

declare global {
  interface Window {
    Featurebase?: ((fn: 'boot', config: FeatureBaseBootConfig) => void) & {
      q?: Array<[string, FeatureBaseBootConfig]>
    }
  }
}
