import { TreeBlock, EditorProvider } from '@core/journeys/ui'
import { render, fireEvent } from '@testing-library/react'
import { GetJourneyForEdit_journey_blocks_StepBlock as StepBlock } from '../../../../../../../__generated__/GetJourneyForEdit'
import { Drawer } from '../../../../Drawer'
import { ThemeProvider } from '../../../../../ThemeProvider'
import { Step } from '.'

describe('Step', () => {
  it('shows default messages', () => {
    const step: TreeBlock<StepBlock> = {
      id: 'step1.id',
      __typename: 'StepBlock',
      parentBlockId: 'step1.id',
      locked: false,
      nextBlockId: null,
      children: []
    }
    const { getByText } = render(<Step {...step} />)
    expect(getByText('None')).toBeInTheDocument()
    expect(getByText('Unlocked Card')).toBeInTheDocument()
  })

  describe('nextCard', () => {
    it('shows next card drawer', () => {
      const step: TreeBlock<StepBlock> = {
        id: 'step1.id',
        __typename: 'StepBlock',
        parentBlockId: 'step1.id',
        locked: true,
        nextBlockId: null,
        children: []
      }
      const { getByText } = render(
        <ThemeProvider>
          <EditorProvider>
            <Drawer />
            <Step {...step} />
          </EditorProvider>
        </ThemeProvider>
      )
      fireEvent.click(getByText('Next Card'))
      expect(getByText('Next Card Properties')).toBeInTheDocument()
      expect(getByText('Cards')).toBeInTheDocument()
    })

    it('shows locked', () => {
      const step: TreeBlock<StepBlock> = {
        id: 'step1.id',
        __typename: 'StepBlock',
        parentBlockId: 'step1.id',
        locked: true,
        nextBlockId: null,
        children: []
      }
      const { getByText } = render(<Step {...step} />)
      expect(getByText('Locked With Interaction')).toBeInTheDocument()
    })

    it('shows untitled', () => {
      const step1: TreeBlock<StepBlock> = {
        id: 'step1.id',
        __typename: 'StepBlock',
        parentBlockId: null,
        locked: false,
        nextBlockId: 'step2.id',
        children: []
      }
      const step2: TreeBlock<StepBlock> = {
        id: 'step2.id',
        __typename: 'StepBlock',
        parentBlockId: null,
        locked: false,
        nextBlockId: null,
        children: []
      }
      const { getByText } = render(
        <EditorProvider initialState={{ steps: [step1, step2] }}>
          <Step {...step1} />
        </EditorProvider>
      )
      expect(getByText('Untitled')).toBeInTheDocument()
    })

    it('shows first typography text', () => {
      const step1: TreeBlock<StepBlock> = {
        id: 'step1.id',
        __typename: 'StepBlock',
        parentBlockId: null,
        locked: false,
        nextBlockId: 'step2.id',
        children: []
      }
      const step2: TreeBlock<StepBlock> = {
        id: 'step2.id',
        __typename: 'StepBlock',
        parentBlockId: null,
        locked: false,
        nextBlockId: null,
        children: [
          {
            __typename: 'CardBlock',
            id: 'card1.id',
            parentBlockId: 'step2.id',
            backgroundColor: null,
            coverBlockId: null,
            themeMode: null,
            themeName: null,
            fullscreen: false,
            children: [
              {
                __typename: 'TypographyBlock',
                id: 'typography',
                content: 'my Title',
                parentBlockId: 'card1.id',
                align: null,
                color: null,
                variant: null,
                children: []
              }
            ]
          }
        ]
      }
      const { getByText } = render(
        <EditorProvider initialState={{ steps: [step1, step2] }}>
          <Step {...step1} />
        </EditorProvider>
      )
      expect(getByText('my Title')).toBeInTheDocument()
    })
  })
})
