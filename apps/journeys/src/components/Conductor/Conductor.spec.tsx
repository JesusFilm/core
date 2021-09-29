import { Conductor } from '.'
import { fireEvent, renderWithApolloClient } from '../../../test/testingLibrary'
import { activeBlockVar, treeBlocksVar } from '../../libs/client/cache/blocks'
import { TreeBlock } from '../../libs/transformer/transformer'

describe('Conductor', () => {
  it('should show first block', () => {
    const blocks: TreeBlock[] = [
      {
        id: 'step1.id',
        __typename: 'StepBlock',
        parentBlockId: null,
        locked: false,
        nextBlockId: 'step2.id',
        children: [
          {
            id: 'radioQuestion1.id',
            __typename: 'RadioQuestionBlock',
            parentBlockId: 'step1.id',
            label: 'Step 1',
            description: 'Start',
            children: [
              {
                id: 'radioOption2.id',
                __typename: 'RadioOptionBlock',
                parentBlockId: 'radioQuestion1.id',
                label: '1. Step 2 (Locked)',
                action: {
                  __typename: 'NavigateToBlockAction',
                  gtmEventName: 'gtmEventName',
                  blockId: 'step2.id'
                },
                children: []
              },
              {
                id: 'radioOption3.id',
                __typename: 'RadioOptionBlock',
                parentBlockId: 'radioQuestion1.id',
                label: '1. Step 3 (No nextBlockId)',
                action: {
                  __typename: 'NavigateToBlockAction',
                  gtmEventName: 'gtmEventName',
                  blockId: 'step3.id'
                },
                children: []
              },
              {
                id: 'radioOption4.id',
                __typename: 'RadioOptionBlock',
                parentBlockId: 'radioQuestion1.id',
                label: '1. Step 4 (End)',
                action: {
                  __typename: 'NavigateToBlockAction',
                  gtmEventName: 'gtmEventName',
                  blockId: 'step4.id'
                },
                children: []
              }
            ]
          }
        ]
      },
      {
        id: 'step2.id',
        __typename: 'StepBlock',
        parentBlockId: null,
        locked: true,
        nextBlockId: 'step3.id',
        children: [
          {
            id: 'radioQuestion1.id',
            __typename: 'RadioQuestionBlock',
            parentBlockId: 'step2.id',
            label: 'Step 2',
            description: 'Locked',
            children: [
              {
                id: 'radioOption1.id',
                __typename: 'RadioOptionBlock',
                parentBlockId: 'radioQuestion1.id',
                label: '2. Step 1 (Start)',
                action: {
                  __typename: 'NavigateToBlockAction',
                  gtmEventName: 'gtmEventName',
                  blockId: 'step1.id'
                },
                children: []
              },
              {
                id: 'radioOption3.id',
                __typename: 'RadioOptionBlock',
                parentBlockId: 'radioQuestion1.id',
                label: '2. Step 3 (No nextBlockId)',
                action: {
                  __typename: 'NavigateToBlockAction',
                  gtmEventName: 'gtmEventName',
                  blockId: 'step3.id'
                },
                children: []
              },
              {
                id: 'radioOption4.id',
                __typename: 'RadioOptionBlock',
                parentBlockId: 'radioQuestion1.id',
                label: '2. Step 4 (End)',
                action: {
                  __typename: 'NavigateToBlockAction',
                  gtmEventName: 'gtmEventName',
                  blockId: 'step4.id'
                },
                children: []
              }
            ]
          }
        ]
      },
      {
        id: 'step3.id',
        __typename: 'StepBlock',
        parentBlockId: null,
        locked: false,
        nextBlockId: null,
        children: [
          {
            id: 'radioQuestion1.id',
            __typename: 'RadioQuestionBlock',
            parentBlockId: 'step1.id',
            label: 'Step 3',
            description: 'No nextBlockId',
            children: [
              {
                id: 'radioOption1.id',
                __typename: 'RadioOptionBlock',
                parentBlockId: 'radioQuestion1.id',
                label: '3. Step 1 (Start)',
                action: {
                  __typename: 'NavigateToBlockAction',
                  gtmEventName: 'gtmEventName',
                  blockId: 'step1.id'
                },
                children: []
              },
              {
                id: 'radioOption2.id',
                __typename: 'RadioOptionBlock',
                parentBlockId: 'radioQuestion1.id',
                label: '3. Step 2 (Locked)',
                action: {
                  __typename: 'NavigateToBlockAction',
                  gtmEventName: 'gtmEventName',
                  blockId: 'step2.id'
                },
                children: []
              },
              {
                id: 'radioOption4.id',
                __typename: 'RadioOptionBlock',
                parentBlockId: 'radioQuestion1.id',
                label: '3. Step 4 (End)',
                action: {
                  __typename: 'NavigateToBlockAction',
                  gtmEventName: 'gtmEventName',
                  blockId: 'step4.id'
                },
                children: []
              }
            ]
          }
        ]
      },
      {
        id: 'step4.id',
        __typename: 'StepBlock',
        parentBlockId: null,
        locked: false,
        nextBlockId: null,
        children: [
          {
            id: 'radioQuestion1.id',
            __typename: 'RadioQuestionBlock',
            parentBlockId: 'step4.id',
            label: 'Step 4',
            description: 'End',
            children: [
              {
                id: 'radioOption1.id',
                __typename: 'RadioOptionBlock',
                parentBlockId: 'radioQuestion1.id',
                label: '4. Step 1 (Start)',
                action: {
                  __typename: 'NavigateToBlockAction',
                  gtmEventName: 'gtmEventName',
                  blockId: 'step1.id'
                },
                children: []
              },
              {
                id: 'radioOption2.id',
                __typename: 'RadioOptionBlock',
                parentBlockId: 'radioQuestion1.id',
                label: '4. Step 2 (Locked)',
                action: {
                  __typename: 'NavigateToBlockAction',
                  gtmEventName: 'gtmEventName',
                  blockId: 'step2.id'
                },
                children: []
              },
              {
                id: 'radioOption3.id',
                __typename: 'RadioOptionBlock',
                parentBlockId: 'radioQuestion1.id',
                label: '4. Step 3 (No nextBlockId)',
                action: {
                  __typename: 'NavigateToBlockAction',
                  gtmEventName: 'gtmEventName',
                  blockId: 'step3.id'
                },
                children: []
              }
            ]
          }
        ]
      }
    ]
    const { getByRole, getByTestId } = renderWithApolloClient(
      <Conductor blocks={blocks} />
    )
    const conductorNextButton = getByTestId('conductorNextButton')
    expect(treeBlocksVar()).toBe(blocks)
    expect(activeBlockVar()?.id).toBe('step1.id')
    fireEvent.click(conductorNextButton)
    expect(activeBlockVar()?.id).toBe('step2.id')
    fireEvent.click(conductorNextButton)
    expect(activeBlockVar()?.id).toBe('step2.id')
    fireEvent.click(getByRole('button', { name: '2. Step 3 (No nextBlockId)' }))
    expect(activeBlockVar()?.id).toBe('step3.id')
    fireEvent.click(conductorNextButton)
    expect(activeBlockVar()?.id).toBe('step3.id')
    fireEvent.click(getByRole('button', { name: '3. Step 4 (End)' }))
    expect(activeBlockVar()?.id).toBe('step4.id')
  })

  it('should not throw error if no blocks', () => {
    const blocks: TreeBlock[] = []
    renderWithApolloClient(<Conductor blocks={blocks} />)
    expect(treeBlocksVar()).toBe(blocks)
    expect(activeBlockVar()).toBe(null)
  })
})
