import { useBreakpoints } from '@core/shared/ui'
import { activeBlockVar, TreeBlock, treeBlocksVar } from '@core/journeys/ui'
import {
  fireEvent,
  renderWithApolloClient,
  waitFor
} from '../../../test/testingLibrary'
import { Conductor } from '.'

jest.mock('../../../../../libs/shared/ui/src/', () => ({
  __esModule: true,
  useBreakpoints: jest.fn()
}))

beforeEach(() => {
  const useBreakpointsMock = useBreakpoints as jest.Mock
  useBreakpointsMock.mockReturnValue({
    xs: true,
    sm: false,
    md: false,
    lg: false,
    xl: false
  })
})

describe('Conductor', () => {
  it('should show first block', () => {
    const blocks: TreeBlock[] = [
      {
        id: 'step1.id',
        __typename: 'StepBlock',
        parentBlockId: null,
        parentOrder: 0,
        locked: false,
        nextBlockId: 'step2.id',
        children: [
          {
            id: 'card1.id',
            __typename: 'CardBlock',
            parentBlockId: 'step1.id',
            coverBlockId: 'null',
            parentOrder: 0,
            backgroundColor: null,
            themeMode: null,
            themeName: null,
            fullscreen: false,
            children: [
              {
                id: 'radioQuestion1.id',
                __typename: 'RadioQuestionBlock',
                parentBlockId: 'card1.id',
                parentOrder: 0,
                label: 'Step 1',
                description: 'Start',
                children: [
                  {
                    id: 'radioOption2.id',
                    __typename: 'RadioOptionBlock',
                    parentBlockId: 'radioQuestion1.id',
                    parentOrder: 0,
                    label: '1. Step 2 (Locked)',
                    action: {
                      __typename: 'NavigateToBlockAction',
                      parentBlockId: 'radioOption2.id',
                      gtmEventName: 'gtmEventName',
                      blockId: 'step2.id'
                    },
                    children: []
                  },
                  {
                    id: 'radioOption3.id',
                    __typename: 'RadioOptionBlock',
                    parentBlockId: 'radioQuestion1.id',
                    parentOrder: 1,
                    label: '1. Step 3 (No nextBlockId)',
                    action: {
                      __typename: 'NavigateToBlockAction',
                      parentBlockId: 'radioOption3.id',
                      gtmEventName: 'gtmEventName',
                      blockId: 'step3.id'
                    },
                    children: []
                  },
                  {
                    id: 'radioOption4.id',
                    __typename: 'RadioOptionBlock',
                    parentBlockId: 'radioQuestion1.id',
                    parentOrder: 2,
                    label: '1. Step 4 (End)',
                    action: {
                      __typename: 'NavigateToBlockAction',
                      parentBlockId: 'radioOption4.id',
                      gtmEventName: 'gtmEventName',
                      blockId: 'step4.id'
                    },
                    children: []
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'step2.id',
        __typename: 'StepBlock',
        parentBlockId: null,
        parentOrder: 1,
        locked: true,
        nextBlockId: 'step3.id',
        children: [
          {
            id: 'card2.id',
            __typename: 'CardBlock',
            parentBlockId: 'step2.id',
            coverBlockId: 'null',
            parentOrder: 0,
            backgroundColor: null,
            themeMode: null,
            themeName: null,
            fullscreen: false,
            children: [
              {
                id: 'radioQuestion1.id',
                __typename: 'RadioQuestionBlock',
                parentBlockId: 'card2.id',
                parentOrder: 0,
                label: 'Step 2',
                description: 'Locked',
                children: [
                  {
                    id: 'radioOption1.id',
                    __typename: 'RadioOptionBlock',
                    parentBlockId: 'radioQuestion1.id',
                    parentOrder: 0,
                    label: '2. Step 1 (Start)',
                    action: {
                      __typename: 'NavigateToBlockAction',
                      parentBlockId: 'radioOption1.id',
                      gtmEventName: 'gtmEventName',
                      blockId: 'step1.id'
                    },
                    children: []
                  },
                  {
                    id: 'radioOption3.id',
                    __typename: 'RadioOptionBlock',
                    parentBlockId: 'radioQuestion1.id',
                    parentOrder: 1,
                    label: '2. Step 3 (No nextBlockId)',
                    action: {
                      __typename: 'NavigateToBlockAction',
                      parentBlockId: 'radioOption3.id',
                      gtmEventName: 'gtmEventName',
                      blockId: 'step3.id'
                    },
                    children: []
                  },
                  {
                    id: 'radioOption4.id',
                    __typename: 'RadioOptionBlock',
                    parentBlockId: 'radioQuestion1.id',
                    parentOrder: 2,
                    label: '2. Step 4 (End)',
                    action: {
                      __typename: 'NavigateToBlockAction',
                      parentBlockId: 'radioOption4.id',
                      gtmEventName: 'gtmEventName',
                      blockId: 'step4.id'
                    },
                    children: []
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'step3.id',
        __typename: 'StepBlock',
        parentBlockId: null,
        parentOrder: 2,
        locked: false,
        nextBlockId: null,
        children: [
          {
            id: 'card3.id',
            __typename: 'CardBlock',
            parentBlockId: 'step3.id',
            coverBlockId: 'null',
            parentOrder: 0,
            backgroundColor: null,
            themeMode: null,
            themeName: null,
            fullscreen: false,
            children: [
              {
                id: 'radioQuestion1.id',
                __typename: 'RadioQuestionBlock',
                parentBlockId: 'card3.id',
                parentOrder: 0,
                label: 'Step 3',
                description: 'No nextBlockId',
                children: [
                  {
                    id: 'radioOption1.id',
                    __typename: 'RadioOptionBlock',
                    parentBlockId: 'radioQuestion1.id',
                    parentOrder: 0,
                    label: '3. Step 1 (Start)',
                    action: {
                      __typename: 'NavigateToBlockAction',
                      parentBlockId: 'radioOption1.id',
                      gtmEventName: 'gtmEventName',
                      blockId: 'step1.id'
                    },
                    children: []
                  },
                  {
                    id: 'radioOption2.id',
                    __typename: 'RadioOptionBlock',
                    parentBlockId: 'radioQuestion1.id',
                    parentOrder: 1,
                    label: '3. Step 2 (Locked)',
                    action: {
                      __typename: 'NavigateToBlockAction',
                      parentBlockId: 'radioOption2.id',
                      gtmEventName: 'gtmEventName',
                      blockId: 'step2.id'
                    },
                    children: []
                  },
                  {
                    id: 'radioOption4.id',
                    __typename: 'RadioOptionBlock',
                    parentBlockId: 'radioQuestion1.id',
                    parentOrder: 2,
                    label: '3. Step 4 (End)',
                    action: {
                      __typename: 'NavigateToBlockAction',
                      parentBlockId: 'radioOption4.id',
                      gtmEventName: 'gtmEventName',
                      blockId: 'step4.id'
                    },
                    children: []
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'step4.id',
        __typename: 'StepBlock',
        parentBlockId: null,
        parentOrder: 3,
        locked: false,
        nextBlockId: null,
        children: [
          {
            id: 'card4.id',
            __typename: 'CardBlock',
            parentBlockId: 'step4.id',
            coverBlockId: 'null',
            parentOrder: 0,
            backgroundColor: null,
            themeMode: null,
            themeName: null,
            fullscreen: false,
            children: [
              {
                id: 'radioQuestion1.id',
                __typename: 'RadioQuestionBlock',
                parentBlockId: 'card4.id',
                parentOrder: 0,
                label: 'Step 4',
                description: 'End',
                children: [
                  {
                    id: 'radioOption1.id',
                    __typename: 'RadioOptionBlock',
                    parentBlockId: 'radioQuestion1.id',
                    parentOrder: 0,
                    label: '4. Step 1 (Start)',
                    action: {
                      __typename: 'NavigateToBlockAction',
                      parentBlockId: 'radioOption1.id',
                      gtmEventName: 'gtmEventName',
                      blockId: 'step1.id'
                    },
                    children: []
                  },
                  {
                    id: 'radioOption2.id',
                    __typename: 'RadioOptionBlock',
                    parentBlockId: 'radioQuestion1.id',
                    parentOrder: 1,
                    label: '4. Step 2 (Locked)',
                    action: {
                      __typename: 'NavigateToBlockAction',
                      parentBlockId: 'radioOption2.id',
                      gtmEventName: 'gtmEventName',
                      blockId: 'step2.id'
                    },
                    children: []
                  },
                  {
                    id: 'radioOption3.id',
                    __typename: 'RadioOptionBlock',
                    parentBlockId: 'radioQuestion1.id',
                    parentOrder: 2,
                    label: '4. Step 3 (No nextBlockId)',
                    action: {
                      __typename: 'NavigateToBlockAction',
                      parentBlockId: 'radioOption3.id',
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
      }
    ]
    const { getByRole, getByTestId } = renderWithApolloClient(
      <Conductor blocks={blocks} />
    )
    const conductorNextButton = getByTestId('conductorNextButton')
    expect(treeBlocksVar()).toBe(blocks)
    expect(activeBlockVar()?.id).toBe('step1.id')
    expect(conductorNextButton).toHaveStyle('cursor: pointer;')
    fireEvent.click(conductorNextButton)
    expect(activeBlockVar()?.id).toBe('step2.id')
    fireEvent.click(conductorNextButton)
    expect(activeBlockVar()?.id).toBe('step2.id')
    expect(conductorNextButton).toHaveStyle('cursor: default;')
    fireEvent.click(getByRole('button', { name: '2. Step 3 (No nextBlockId)' }))
    expect(activeBlockVar()?.id).toBe('step3.id')
    fireEvent.click(conductorNextButton)
    expect(activeBlockVar()?.id).toBe('step3.id')
    expect(conductorNextButton).toHaveStyle('cursor: default;')
    fireEvent.click(getByRole('button', { name: '3. Step 4 (End)' }))
    expect(activeBlockVar()?.id).toBe('step4.id')
    expect(conductorNextButton).toHaveStyle('cursor: default;')
  })

  it('should not throw error if no blocks', () => {
    const blocks: TreeBlock[] = []
    renderWithApolloClient(<Conductor blocks={blocks} />)
    expect(treeBlocksVar()).toBe(blocks)
    expect(activeBlockVar()).toBe(null)
  })

  it('should not show the journey progress if video block exists and not used as cover', async () => {
    const blocks: TreeBlock[] = [
      {
        id: 'step1.id',
        __typename: 'StepBlock',
        parentBlockId: null,
        parentOrder: 0,
        locked: false,
        nextBlockId: 'step2.id',
        children: [
          {
            id: 'card1.id',
            __typename: 'CardBlock',
            parentBlockId: 'step1.id',
            coverBlockId: 'null',
            parentOrder: 0,
            backgroundColor: null,
            themeMode: null,
            themeName: null,
            fullscreen: false,
            children: [
              {
                id: 'radioQuestion1.id',
                __typename: 'RadioQuestionBlock',
                parentBlockId: 'card1.id',
                parentOrder: 0,
                label: 'Step 1',
                description: 'Start',
                children: [
                  {
                    id: 'radioOption2.id',
                    __typename: 'RadioOptionBlock',
                    parentBlockId: 'radioQuestion1.id',
                    parentOrder: 0,
                    label: '1. Step 2 (Locked)',
                    action: {
                      __typename: 'NavigateToBlockAction',
                      parentBlockId: 'radioOption2.id',
                      gtmEventName: 'gtmEventName',
                      blockId: 'step2.id'
                    },
                    children: []
                  },
                  {
                    id: 'radioOption3.id',
                    __typename: 'RadioOptionBlock',
                    parentBlockId: 'radioQuestion1.id',
                    parentOrder: 1,
                    label: '1. Step 3 (No nextBlockId)',
                    action: {
                      __typename: 'NavigateToBlockAction',
                      parentBlockId: 'radioOption3.id',
                      gtmEventName: 'gtmEventName',
                      blockId: 'step3.id'
                    },
                    children: []
                  },
                  {
                    id: 'radioOption4.id',
                    __typename: 'RadioOptionBlock',
                    parentBlockId: 'radioQuestion1.id',
                    parentOrder: 2,
                    label: '1. Step 4 (End)',
                    action: {
                      __typename: 'NavigateToBlockAction',
                      parentBlockId: 'radioOption4.id',
                      gtmEventName: 'gtmEventName',
                      blockId: 'step4.id'
                    },
                    children: []
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'step2.id',
        __typename: 'StepBlock',
        parentBlockId: null,
        parentOrder: 0,
        locked: false,
        nextBlockId: 'step3.id',
        children: [
          {
            id: 'card2.id',
            __typename: 'CardBlock',
            parentBlockId: 'step2.id',
            coverBlockId: null,
            parentOrder: 0,
            backgroundColor: null,
            themeMode: null,
            themeName: null,
            fullscreen: false,
            children: [
              {
                id: 'video1.id',
                __typename: 'VideoBlock',
                parentBlockId: 'card2.id',
                parentOrder: 0,
                autoplay: true,
                muted: true,
                videoId: '2_0-FallingPlates',
                videoVariantLanguageId: '529',
                video: {
                  __typename: 'Video',
                  id: '2_0-FallingPlates',
                  title: [
                    {
                      __typename: 'Translation',
                      value: 'FallingPlates'
                    }
                  ],
                  image:
                    'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_0-FallingPlates.mobileCinematicHigh.jpg',
                  variant: {
                    __typename: 'VideoVariant',
                    id: '2_0-FallingPlates-529',
                    hls: 'https://arc.gt/hls/2_0-FallingPlates/529'
                  }
                },
                endAt: null,
                startAt: null,
                posterBlockId: null,
                fullsize: true,
                children: [
                  {
                    id: 'trigger.id',
                    __typename: 'VideoTriggerBlock',
                    parentBlockId: 'video1.id',
                    parentOrder: 0,
                    triggerStart: 20,
                    triggerAction: {
                      __typename: 'NavigateToBlockAction',
                      parentBlockId: 'trigger.id',
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
      },
      {
        id: 'step3.id',
        __typename: 'StepBlock',
        parentBlockId: null,
        parentOrder: 2,
        locked: false,
        nextBlockId: null,
        children: [
          {
            id: 'card3.id',
            __typename: 'CardBlock',
            parentBlockId: 'step3.id',
            coverBlockId: 'null',
            parentOrder: 0,
            backgroundColor: null,
            themeMode: null,
            themeName: null,
            fullscreen: false,
            children: [
              {
                id: 'radioQuestion1.id',
                __typename: 'RadioQuestionBlock',
                parentBlockId: 'card3.id',
                parentOrder: 0,
                label: 'Step 3',
                description: 'No nextBlockId',
                children: [
                  {
                    id: 'radioOption1.id',
                    __typename: 'RadioOptionBlock',
                    parentBlockId: 'radioQuestion1.id',
                    parentOrder: 0,
                    label: '3. Step 1 (Start)',
                    action: {
                      __typename: 'NavigateToBlockAction',
                      parentBlockId: 'radioOption1.id',
                      gtmEventName: 'gtmEventName',
                      blockId: 'step1.id'
                    },
                    children: []
                  },
                  {
                    id: 'radioOption2.id',
                    __typename: 'RadioOptionBlock',
                    parentBlockId: 'radioQuestion1.id',
                    parentOrder: 1,
                    label: '3. Step 2 (Locked)',
                    action: {
                      __typename: 'NavigateToBlockAction',
                      parentBlockId: 'radioOption2.id',
                      gtmEventName: 'gtmEventName',
                      blockId: 'step2.id'
                    },
                    children: []
                  },
                  {
                    id: 'radioOption4.id',
                    __typename: 'RadioOptionBlock',
                    parentBlockId: 'radioQuestion1.id',
                    parentOrder: 2,
                    label: '3. Step 4 (End)',
                    action: {
                      __typename: 'NavigateToBlockAction',
                      parentBlockId: 'radioOption4.id',
                      gtmEventName: 'gtmEventName',
                      blockId: 'step4.id'
                    },
                    children: []
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
    const { getByTestId } = renderWithApolloClient(
      <Conductor blocks={blocks} />
    )
    const conductorNextButton = getByTestId('conductorNextButton')
    expect(treeBlocksVar()).toBe(blocks)
    expect(activeBlockVar()?.id).toBe('step1.id')
    expect(getByTestId('journey-progress')).toHaveStyle('visibility: visible;')
    fireEvent.click(conductorNextButton)
    expect(activeBlockVar()?.id).toBe('step2.id')
    await waitFor(() =>
      expect(getByTestId('journey-progress')).toHaveStyle('visibility: hidden;')
    )
    fireEvent.click(conductorNextButton)
    expect(activeBlockVar()?.id).toBe('step3.id')
    expect(getByTestId('journey-progress')).toHaveStyle('visibility: visible;')
  })
})
