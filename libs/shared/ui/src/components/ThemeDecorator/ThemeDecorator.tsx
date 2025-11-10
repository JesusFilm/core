import { CacheProvider } from '@emotion/react'
import { Parameters } from '@storybook/nextjs'
import { ReactElement, ReactNode } from 'react'

// eslint-disable-next-line @nx/enforce-module-boundaries
import { globalTypes } from '../../../../../../.storybook/preview'
import { createEmotionCache } from '../../libs/createEmotionCache'
import { ThemeMode, ThemeName, getTheme } from '../../libs/themes'
import { ThemeProvider } from '../ThemeProvider'

const storybookMode = globalTypes.theme.toolbar.items
type StorybookThemeMode = (typeof storybookMode)[number]

interface ThemeDecoratorProps extends Pick<Parameters, 'layout'> {
  name?: ThemeName
  mode: StorybookThemeMode
  children: ReactNode
  rtl?: boolean
  locale?: string
}

const ThemeContainer = ({
  name = ThemeName.base,
  mode,
  layout = 'padded',
  children,
  rtl = false,
  locale = ''
}: ThemeDecoratorProps): ReactElement => {
  const theme = getTheme({
    themeName: ThemeName[name],
    themeMode: ThemeMode[mode as ThemeMode]
  })

  return (
    <div
      style={{
        width: '100%',
        height: 'auto',
        minHeight: '50vh',
        overflow: 'auto',
        padding: layout === 'padded' ? '1.5rem' : '0px',
        background: `${theme.palette.background.default}`,
        color: `${theme.palette.text.primary}`
      }}
    >
      <ThemeProvider
        themeName={ThemeName[name]}
        themeMode={ThemeMode[mode as ThemeMode]}
        rtl={rtl}
        locale={locale}
      >
        {children}
      </ThemeProvider>
    </div>
  )
}

export const ThemeDecorator = ({
  name = ThemeName.base,
  mode,
  layout,
  children,
  rtl = false,
  locale = ''
}: ThemeDecoratorProps): ReactElement => {
  const storybookEmotionCache = createEmotionCache({ rtl })

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
            <ThemeContainer
              name={name}
              mode="light"
              layout={layout}
              rtl={rtl}
              locale={locale}
            >
              {children}
            </ThemeContainer>
            <ThemeContainer
              name={name}
              mode="dark"
              layout={layout}
              rtl={rtl}
              locale={locale}
            >
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
              themeName={ThemeName[name]}
              themeMode={ThemeMode[mode as ThemeMode]}
              rtl={rtl}
              locale={locale}
            >
              {children}
            </ThemeProvider>
          </CacheProvider>
        </div>
      )
  }
}
