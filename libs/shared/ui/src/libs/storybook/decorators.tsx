import { Parameters } from '@storybook/react'
import { ThemeProvider } from '../../index'
import { ThemeMode, ThemeName } from '../../../__generated__/globalTypes'
import { globalTypes } from '../../../../../../.storybook/preview'
import { ReactElement, ReactNode } from 'react'
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
        position: 'absolute',
        inset: mode === 'light' ? '0px 50vw 0px 0px' : '0px 0px 0px 50vw',
        width: '50vw',
        height: '100vh',
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
            flexDirection: 'row'
          }}
        >
          <ThemeContainer mode="light" children={children} layout={layout} />
          <ThemeContainer mode="dark" children={children} layout={layout} />
        </div>
      )
    default:
      return (
        <ThemeProvider
          themeName={ThemeName.base}
          themeMode={ThemeMode[mode as ThemeMode]}
        >
          {children}
        </ThemeProvider>
      )
  }
}
