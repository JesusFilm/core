import { Parameters } from '@storybook/react'
import { ReactElement, ReactNode } from 'react'
import type { EmotionCache } from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { createEmotionCache } from '../../../src/libs/createEmotionCache'
import { ThemeProvider } from '../../components/ThemeProvider'
import {
  ThemeMode,
  ThemeName
} from '../../components/ThemeProvider/ThemeProvider'
import { globalTypes } from '../../../../../../.storybook/preview'
import { themes } from '../../libs/themes'

const themeMode = globalTypes.theme.toolbar.items

interface ThemeDecoratorProps extends Pick<Parameters, 'layout'> {
  mode: typeof themeMode[number]
  children: ReactNode,
  emotionCache?: EmotionCache
}

const clientSideEmotionCache = (isRTL: boolean): EmotionCache =>
  createEmotionCache(isRTL)

const ThemeContainer = ({
  mode,
  layout = 'padded',
  children,
  emotionCache = clientSideEmotionCache(true)
}: ThemeDecoratorProps): ReactElement => {
  return (
    <CacheProvider value={emotionCache}>
      <div
        style={{
          width: '100%',
          height: 'auto',
          minHeight: '50vh',
          overflow: 'auto',
          padding: layout === 'padded' ? '1.5rem' : '0px',
          background: themes.base[mode as ThemeMode].palette.background.default,
          color: themes.base[mode as ThemeMode].palette.text.primary
        }}
      >
        <ThemeProvider
          themeName={ThemeName.base}
          themeMode={ThemeMode[mode as ThemeMode]}
          rtl
        >
          {children}
        </ThemeProvider>
      </div>
    </CacheProvider>
  )
}

export const ThemeDecorator = ({
  mode,
  layout,
  children,
  emotionCache = clientSideEmotionCache(true)
}: ThemeDecoratorProps): ReactElement => {
  switch (mode) {
    case 'all':
      return (
        <CacheProvider value={emotionCache}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              maxWidth: '100vw',
              margin: layout === 'fullscreen' ? '0px' : '-16px',
              overflowX: 'hidden'
            }}
          >
            <ThemeContainer mode="light" layout={layout} emotionCache={emotionCache}>
              {children}
            </ThemeContainer>
            <ThemeContainer mode="dark" layout={layout} emotionCache={emotionCache}>
              {children}
            </ThemeContainer>
          </div>
        </CacheProvider>
      )
    default:
      return (
        <CacheProvider value={emotionCache}>
          <div
            style={{
              height: 'calc(100vh - 2rem)'
            }}
          >
            <ThemeProvider
              themeName={ThemeName.base}
              themeMode={ThemeMode[mode as ThemeMode]}
              rtl
            >
              {children}
            </ThemeProvider>
          </div>
        </CacheProvider>
      )
  }
}
