import { MockedProvider } from '@apollo/client/testing'
import { DndContext } from '@dnd-kit/core'
import { fireEvent, render, screen } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { Typography } from '@core/journeys/ui/Typography'

import { TypographyVariant } from '../../../../../../../__generated__/globalTypes'
import { StepFields } from '../../../../../../../__generated__/StepFields'
import { TypographyFields } from '../../../../../../../__generated__/TypographyFields'

import { DragItemWrapper } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('DragItemWrapper', () => {
  const typographyBlock: TreeBlock<TypographyFields> = {
    __typename: 'TypographyBlock',
    id: 'typography.id',
    parentBlockId: 'parent.id',
    parentOrder: 0,
    variant: TypographyVariant.body1,
    content: 'typography content',
    color: null,
    align: null,
    children: []
  ,
  settings: {
    __typename: 'TypographyBlockSettings',
    color: null
  }
}

  const step = (blocks: TreeBlock[]): TreeBlock<StepFields> => {
    return {
      __typename: 'StepBlock',
      id: 'typography.id',
      parentBlockId: null,
      parentOrder: 0,
      locked: true,
      nextBlockId: null,
      slug: null,
      children: blocks
    }
  }

  it('should show drag handle on block hover', () => {
    render(
      <MockedProvider>
        <SnackbarProvider>
          <EditorProvider
            initialState={{
              steps: [step([typographyBlock])]
            }}
          >
            <DndContext>
              <DragItemWrapper block={typographyBlock}>
                <Typography {...typographyBlock} />
              </DragItemWrapper>
            </DndContext>
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(screen.getByTestId('DragIcon')).not.toBeVisible()

    const typography = screen.getByTestId('DragItemWrapper-typography.id')
    fireEvent.mouseOver(typography)

    expect(screen.getByTestId('DragIcon')).toBeVisible()
  })
})
