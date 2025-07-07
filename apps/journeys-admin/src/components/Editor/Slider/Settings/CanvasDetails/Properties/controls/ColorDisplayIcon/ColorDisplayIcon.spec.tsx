import { render } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { getTheme } from '@core/shared/ui/themes'

import { BlockFields_StepBlock as StepBlock } from '../../../../../../../../../__generated__/BlockFields'
import {
  ThemeMode,
  ThemeName,
  TypographyColor
} from '../../../../../../../../../__generated__/globalTypes'

import { ColorDisplayIcon } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('ColorDisplayIcon', () => {
  const createMockStep = (): TreeBlock<StepBlock> => ({
    id: 'step.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 0,
    locked: false,
    nextBlockId: null,
    slug: null,
    children: [
      {
        id: 'card1.id',
        __typename: 'CardBlock',
        parentBlockId: 'step1.id',
        coverBlockId: null,
        parentOrder: 0,
        backgroundColor: null,
        themeMode: ThemeMode.dark,
        themeName: ThemeName.base,
        fullscreen: false,
        backdropBlur: null,
        children: []
      }
    ]
  })

  const theme = getTheme({
    themeName: ThemeName.base,
    themeMode: ThemeMode.dark
  })

  it('should display hex colors directly', () => {
    const step = createMockStep()
    const { getByTestId } = render(
      <EditorProvider initialState={{ selectedStep: step }}>
        <ColorDisplayIcon color="#C52D3A" />
      </EditorProvider>
    )
    expect(getByTestId('#C52D3A-display-icon')).toHaveStyle(
      'background-color: #C52D3A'
    )
  })

  it('should use enum mapping for non-hex colors', () => {
    const step = createMockStep()
    const { getByTestId } = render(
      <EditorProvider initialState={{ selectedStep: step }}>
        <ColorDisplayIcon color={TypographyColor.secondary} />
      </EditorProvider>
    )
    expect(getByTestId('secondary-display-icon')).toHaveStyle(
      `background-color: ${theme.palette.secondary.main}`
    )
  })

  it('should default to primary when color is null', () => {
    const step = createMockStep()
    const { getByTestId } = render(
      <EditorProvider initialState={{ selectedStep: step }}>
        <ColorDisplayIcon color={null} />
      </EditorProvider>
    )
    expect(getByTestId('primary-display-icon')).toHaveStyle(
      `background-color: ${theme.palette.primary.main}`
    )
  })
})
