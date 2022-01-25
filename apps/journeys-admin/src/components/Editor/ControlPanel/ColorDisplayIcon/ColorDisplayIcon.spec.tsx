import { render } from '@testing-library/react'
import { EditorProvider, TreeBlock } from '@core/journeys/ui'
import { themes } from '@core/shared/ui'
import {
  TypographyColor,
  TypographyAlign,
  TypographyVariant,
  ThemeMode,
  ThemeName
} from '../../../../../__generated__/globalTypes'
import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../../../__generated__/GetJourney'
import { ColorDisplayIcon } from '.'

describe('ColorDisplayIcon', () => {
  it('should show the color', () => {
    const step: TreeBlock<StepBlock> = {
      id: 'step.id',
      __typename: 'StepBlock',
      parentBlockId: null,
      locked: false,
      nextBlockId: null,
      children: [
        {
          id: 'card1.id',
          __typename: 'CardBlock',
          parentBlockId: 'step1.id',
          coverBlockId: null,
          backgroundColor: null,
          themeMode: ThemeMode.dark,
          themeName: ThemeName.base,
          fullscreen: false,
          children: [
            {
              __typename: 'TypographyBlock',
              id: '1',
              parentBlockId: 'step.id',
              content: 'text block',
              variant: TypographyVariant.subtitle1,
              color: TypographyColor.primary,
              align: TypographyAlign.left,
              children: []
            }
          ]
        }
      ]
    }
    const { getByTestId } = render(
      <EditorProvider initialState={{ selectedStep: step }}>
        <ColorDisplayIcon color={TypographyColor.primary} />
      </EditorProvider>
    )
    expect(getByTestId('color-display-icon')).toHaveStyle(
      `background-color: ${themes.base.dark.palette.primary.main}`
    )
  })
})
