import { Parameters } from '@storybook/react'
import { ReactElement, ReactNode } from 'react'
import { ThemeProvider } from '../../components/ThemeProvider'
import { globalTypes } from '../../../../../../.storybook/preview'
import { getTheme, ThemeMode, ThemeName } from '../../libs/themes'

const themeMode = globalTypes.theme.toolbar.items

interface ThemeDecoratorProps extends Pick<Parameters, 'layout'> {
  mode: typeof themeMode[number]
  children: ReactNode
}

const ThemeContainer = ({
  mode,
  layout = 'padded',
  children
}: ThemeDecoratorProps): ReactElement => {
  const theme = getTheme({
    themeName: ThemeName.base,
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
        background: theme.palette.background.default,
        color: theme.palette.text.primary
      }}
    >
      <ThemeProvider
        themeName={ThemeName.base}
        themeMode={ThemeMode[mode as ThemeMode]}
      >
        {children}
      </ThemeProvider>
    </div>
  )
}

export const ThemeDecorator = ({
  mode,
  layout,
  children
}: ThemeDecoratorProps): ReactElement => {
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
        >
          <ThemeContainer mode="light" layout={layout}>
            {children}
          </ThemeContainer>
          <ThemeContainer mode="dark" layout={layout}>
            {children}
          </ThemeContainer>
        </div>
      )
    default:
      return (
        <div
          style={{
            height: 'calc(100vh - 2rem)'
          }}
        >
          <ThemeProvider
            themeName={ThemeName.base}
            themeMode={ThemeMode[mode as ThemeMode]}
          >
            {children}
          </ThemeProvider>
        </div>
      )
  }
}
