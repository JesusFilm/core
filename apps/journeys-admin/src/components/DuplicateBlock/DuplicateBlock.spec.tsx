import { render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { EditorProvider, TreeBlock } from '@core/journeys/ui'
import {
  GetJourney_journey_blocks_TypographyBlock as TypographyBlock,
  GetJourney_journey_blocks_StepBlock as StepBlock
} from '../../../__generated__/GetJourney'
import {
  TypographyVariant,
  TypographyAlign,
  TypographyColor
} from '../../../__generated__/globalTypes'
import { DuplicateBlock } from './DuplicateBlock'

const block: TreeBlock<TypographyBlock> = {
  id: 'typography0.id',
  __typename: 'TypographyBlock',
  parentBlockId: 'card1.id',
  parentOrder: 0,
  content: 'Title',
  variant: TypographyVariant.h1,
  color: TypographyColor.primary,
  align: TypographyAlign.center,
  children: []
}

const step: TreeBlock<StepBlock> = {
  __typename: 'StepBlock',
  id: 'stepId',
  parentBlockId: 'journeyId',
  parentOrder: 0,
  locked: true,
  nextBlockId: null,
  children: [
    {
      id: 'card1.id',
      __typename: 'CardBlock',
      parentBlockId: 'stepId',
      parentOrder: 0,
      coverBlockId: null,
      backgroundColor: null,
      themeMode: null,
      themeName: null,
      fullscreen: false,
      children: [block]
    }
  ]
}

// update tests when duplication apis are working
describe('DuplicateBlock', () => {
  it('should duplicate a block on button click', () => {
    const { getByRole, getByTestId } = render(
      <SnackbarProvider>
        <EditorProvider initialState={{ selectedBlock: block }}>
          <DuplicateBlock variant="button" />
        </EditorProvider>
      </SnackbarProvider>
    )
    expect(getByRole('button')).toContainElement(
      getByTestId('ContentCopyRoundedIcon')
    )
  })

  it('should duplicate a block on menu click', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <EditorProvider initialState={{ selectedBlock: block }}>
          <DuplicateBlock variant="list-item" />
        </EditorProvider>
      </SnackbarProvider>
    )
    expect(
      getByRole('menuitem', { name: 'Duplicate Block' })
    ).toBeInTheDocument()
  })

  it('should duplicate a card on button click', () => {
    const { getByRole, getByTestId } = render(
      <SnackbarProvider>
        <EditorProvider initialState={{ selectedBlock: step }}>
          <DuplicateBlock variant="button" />
        </EditorProvider>
      </SnackbarProvider>
    )
    expect(getByRole('button')).toContainElement(
      getByTestId('ContentCopyRoundedIcon')
    )
  })

  it('should duplicate a card on menu click', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <EditorProvider initialState={{ selectedBlock: step }}>
          <DuplicateBlock variant="list-item" />
        </EditorProvider>
      </SnackbarProvider>
    )
    expect(
      getByRole('menuitem', { name: 'Duplicate Card' })
    ).toBeInTheDocument()
  })

  it('should duplicate a journey on menu click', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <EditorProvider>
          <DuplicateBlock variant="list-item" journeyId="journeyId" />
        </EditorProvider>
      </SnackbarProvider>
    )
    expect(getByRole('menuitem', { name: 'Duplicate' })).toBeInTheDocument()
  })
})
