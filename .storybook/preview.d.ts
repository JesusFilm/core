import { ComponentType } from 'react'
import { Loader, Parameters } from 'storybook/internal/csf'

export declare const parameters: {
  backgrounds: {
    grid: { disable: boolean }
    disabled: boolean
  }
  chromatic: { viewports: number[] }
  controls: { disable: boolean }
  viewport: { options: Record<string, unknown> }
  apolloClient: { MockedProvider: ComponentType<Record<string, unknown>> }
}

export declare const globalTypes: {
  theme: {
    name: string
    description: string
    toolbar: {
      title: string
      icon: string
      items: ['light', 'dark', 'all']
    }
  }
}

export declare const initialGlobals: {
  theme: string
}

declare const preview: {
  loaders: Loader[]
  parameters: Parameters
  globalTypes: typeof globalTypes
  initialGlobals: typeof initialGlobals
  tags: string[]
}

export default preview
