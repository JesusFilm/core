import { render, fireEvent } from '@testing-library/react'
import type { TreeBlock } from '@core/journeys/ui/block'
import { MockedProvider } from '@apollo/client/testing'
import { DragDropContext } from 'react-beautiful-dnd'
import {
  ActiveFab,
  ActiveJourneyEditContent,
  ActiveTab,
  EditorState,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { BlockFields_StepBlock as StepBlock } from '../../../../__generated__/BlockFields'
import {
  VideoBlockSource,
  ThemeName,
  ThemeMode
} from '../../../../__generated__/globalTypes'
import { JourneyFields as Journey } from '../../../../__generated__/JourneyFields'
import { CardList } from '.'

jest.mock('react-beautiful-dnd', () => ({
  Droppable: ({ children }) =>
    children(
      {
        draggableProps: {
          style: {}
        },
        innerRef: jest.fn()
      },
      {}
    ),
  Draggable: ({ children }) =>
    children(
      {
        draggableProps: {
          style: {}
        },
        innerRef: jest.fn()
      },
      {}
    ),
  DragDropContext: ({ children }) => children
}))

jest.mock('@core/journeys/ui/EditorProvider', () => {
  const originalModule = jest.requireActual('@core/journeys/ui/EditorProvider')
  return {
    __esModule: true,
    ...originalModule,
    useEditor: jest.fn()
  }
})

describe('CardList', () => {
  const selected: TreeBlock<StepBlock> = {
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
            source: VideoBlockSource.internal,
            title: null,
            description: null,
            duration: null,
            image: null,
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
            action: null,
            objectFit: null,
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
  }

  const droppableProvided = {
    draggableProps: {
      style: {}
    },
    innerRef: jest.fn()
  }

  const steps: Array<TreeBlock<StepBlock>> = [
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
    selected
  ]

  const state: EditorState = {
    steps,
    selectedBlock: selected,
    drawerMobileOpen: false,
    activeTab: ActiveTab.Cards,
    activeFab: ActiveFab.Add,
    journeyEditContentComponent: ActiveJourneyEditContent.Canvas
  }

  const mockUseEditor = useEditor as jest.MockedFunction<typeof useEditor>
  beforeEach(() => {
    mockUseEditor.mockReturnValue({
      state,
      dispatch: jest.fn()
    })
  })

  it('should call handleClick on addCard click', () => {
    const handleClick = jest.fn()
    const { getByRole } = render(
      <MockedProvider>
        <CardList
          steps={steps}
          selected={selected}
          showAddButton
          handleClick={handleClick}
        />
      </MockedProvider>
    )
    expect(getByRole('button')).toBeInTheDocument()
    fireEvent.click(getByRole('button'))
    expect(handleClick).toHaveBeenCalled()
  })

  it('should render without the drag handle', () => {
    const { queryByRole } = render(
      <MockedProvider>
        <CardList steps={steps} selected={selected} showAddButton />
      </MockedProvider>
    )
    expect(queryByRole('DragHandleRoundedIcon')).not.toBeInTheDocument()
  })

  it('should prompt users that a card is draggable', () => {
    const { getAllByTestId } = render(
      <MockedProvider>
        <DragDropContext>
          <CardList
            steps={steps}
            selected={selected}
            showAddButton
            droppableProvided={droppableProvided}
          />
        </DragDropContext>
      </MockedProvider>
    )
    const dragHandle = getAllByTestId('DragHandleRoundedIcon')
    expect(dragHandle[0]).toHaveClass('MuiSvgIcon-root')
  })

  it('contains social preview card', () => {
    const { getByTestId } = render(
      <MockedProvider>
        <DragDropContext>
          <CardList
            steps={steps}
            selected={selected}
            showAddButton
            droppableProvided={droppableProvided}
          />
        </DragDropContext>
      </MockedProvider>
    )
    expect(getByTestId('social-preview-navigation-card')).toBeInTheDocument()
  })

  it('navigates on social preview card click', async () => {
    const dispatch = jest.fn()
    const handleChange = jest.fn()
    mockUseEditor.mockReturnValue({
      state,
      dispatch
    })
    const { getAllByRole } = render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: {
              id: 'journeyId',
              themeMode: ThemeMode.light,
              themeName: ThemeName.base,
              language: {
                __typename: 'Language',
                id: '529',
                bcp47: 'en',
                iso3: 'eng'
              }
            } as unknown as Journey,
            admin: true
          }}
        >
          <DragDropContext>
            <CardList
              steps={steps}
              selected={selected}
              droppableProvided={droppableProvided}
              handleChange={handleChange}
            />
          </DragDropContext>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getAllByRole('button')[0])
    expect(handleChange).toHaveBeenCalledWith('social')
  })

  it('should display image for social navigationcard if image is provided', () => {
    const dispatch = jest.fn()
    const handleChange = jest.fn()
    mockUseEditor.mockReturnValue({
      state,
      dispatch
    })
    const { getAllByRole } = render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: {
              id: 'journeyId',
              themeMode: ThemeMode.light,
              themeName: ThemeName.base,
              language: {
                __typename: 'Language',
                id: '529',
                bcp47: 'en',
                iso3: 'eng'
              },
              primaryImageBlock: {
                src: 'https://images.unsplash.com/photo-1600133153574-25d98a99528c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80'
              }
            } as unknown as Journey,
            admin: true
          }}
        >
          <DragDropContext>
            <CardList
              steps={steps}
              selected={selected}
              droppableProvided={droppableProvided}
              handleChange={handleChange}
            />
          </DragDropContext>
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getAllByRole('img')[0].attributes.getNamedItem('src')?.value).toBe(
      'https://images.unsplash.com/photo-1600133153574-25d98a99528c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80'
    )
  })
})
