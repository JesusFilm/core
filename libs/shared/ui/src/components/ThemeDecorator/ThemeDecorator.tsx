import { Parameters } from '@storybook/react'
import { ReactElement, ReactNode } from 'react'
import { CacheProvider } from '@emotion/react'
import { createEmotionCache } from '../../../src/libs/createEmotionCache'
import { ThemeProvider } from '../../components/ThemeProvider'
import { globalTypes } from '../../../../../../.storybook/preview'
import { getTheme, ThemeMode, ThemeName } from '../../libs/themes'

const storybookMode = globalTypes.theme.toolbar.items
type StorybookThemeMode = typeof storybookMode[number]

interface ThemeDecoratorProps extends Pick<Parameters, 'layout'> {
  mode: StorybookThemeMode
  children: ReactNode
  rtl?: boolean
}

const ThemeContainer = ({
  mode,
  layout = 'padded',
  children,
  rtl = false
}: ThemeDecoratorProps): ReactElement => {
  const theme = getTheme(ThemeName.base, ThemeMode[mode as ThemeMode], rtl)

  return (
    <div
      style={{
        width: '100%',
        height: 'auto',
        minHeight: '50vh',
        overflow: 'auto',
        padding: layout === 'padded' ? '1.5rem' : '0px',
        background: theme.palette.background.default,
        color: theme.palette.text.primary
      }}
    >
      <ThemeProvider
        themeName={ThemeName.base}
        themeMode={ThemeMode[mode as ThemeMode]}
        rtl={rtl}
      >
        {children}
      </ThemeProvider>
    </div>
  )
}

export const ThemeDecorator = ({
  mode,
  layout,
  children,
  rtl = false
}: ThemeDecoratorProps): ReactElement => {
  const storybookEmotionCache = createEmotionCache({ rtl, prepend: false })

  switch (mode) {
    case 'all':
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            maxWidth: '100vw',
            margin: layout === 'fullscreen' ? '0px' : '-16px',
            overflowX: 'hidden'
          }}
          dir={rtl ? 'rtl' : 'ltr'}
        >
          <CacheProvider value={storybookEmotionCache}>
            <ThemeContainer mode="light" layout={layout} rtl={rtl}>
              {children}
            </ThemeContainer>
            <ThemeContainer mode="dark" layout={layout} rtl={rtl}>
              {children}
            </ThemeContainer>
          </CacheProvider>
        </div>
      )
    default:
      return (
        <div
          style={{
            height: 'calc(100vh - 2rem)'
          }}
          dir={rtl ? 'rtl' : 'ltr'}
        >
          <CacheProvider value={storybookEmotionCache}>
            <ThemeProvider
              themeName={ThemeName.base}
              themeMode={ThemeMode[mode as ThemeMode]}
              rtl={rtl}
            >
              {children}
            </ThemeProvider>
          </CacheProvider>
        </div>
      )
  }
}
