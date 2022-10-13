import { Parameters } from '@storybook/react'
import { ReactElement, ReactNode } from 'react'
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
  children: ReactNode
  rtl?: boolean
}

const ThemeContainer = ({
  mode,
  layout = 'padded',
  children,
  rtl
}: ThemeDecoratorProps): ReactElement => {
  return (
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
  console.log('window', window.document, document)
  document.dir = rtl ? 'rtl' : ''
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
