import { ThemeProvider } from '../../index'
import { ThemeMode, ThemeName } from '../../../__generated__/globalTypes'
import { globalTypes } from '../../../../../../.storybook/preview'
import { ReactElement, ReactNode } from 'react'

const themeMode = globalTypes.theme.toolbar.items

interface ThemeDecoratorProps {
  mode: typeof themeMode[number]
  children: ReactNode
}

const ThemeContainer = ({
  mode,
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
        background: mode === 'light' ? 'rgb(246, 249, 252)' : 'rgb(47, 47, 47)',
        color: mode === 'light' ? 'rgb(51, 51, 51)' : 'rgb(255, 255, 255)'
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
          <ThemeContainer mode="light" children={children} />
          <ThemeContainer mode="dark" children={children} />
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
