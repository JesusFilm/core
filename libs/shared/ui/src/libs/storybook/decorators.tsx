import { Parameters } from '@storybook/react'
import { ReactElement, ReactNode } from 'react'
import { ThemeProvider } from '../../index'
import {
  ThemeMode,
  ThemeName
} from '../../components/ThemeProvider/ThemeProvider'
import { globalTypes } from '../../../../../../.storybook/preview'
import { themes } from '../themes'

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
          <ThemeContainer mode="light" children={children} layout={layout} />
          <ThemeContainer mode="dark" children={children} layout={layout} />
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
