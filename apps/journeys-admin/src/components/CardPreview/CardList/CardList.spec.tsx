import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render } from '@testing-library/react'
import { DragDropContext } from 'react-beautiful-dnd'

import type { TreeBlock } from '@core/journeys/ui/block'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { BlockFields_StepBlock as StepBlock } from '../../../../__generated__/BlockFields'
import {
  Role,
  ThemeMode,
  ThemeName,
  VideoBlockSource
} from '../../../../__generated__/globalTypes'
import { JourneyFields as Journey } from '../../../../__generated__/JourneyFields'
import { GET_USER_ROLE } from '../../../libs/useUserRoleQuery/useUserRoleQuery'
import { SocialProvider } from '../../Editor/SocialProvider'

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

  it('should call handleClick on addCard click', () => {
    const handleClick = jest.fn()
    const { getByRole } = render(
      <MockedProvider>
        <SocialProvider>
          <CardList
            steps={steps}
            selected={selected}
            showAddButton
            handleClick={handleClick}
          />
        </SocialProvider>
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
    const dragHandle = getAllByTestId('DragIcon')
    expect(dragHandle[0]).toHaveClass('MuiSvgIcon-root')
  })

  it('contains goals card', () => {
    const { getByTestId } = render(
      <MockedProvider>
        <DragDropContext>
          <CardList
            steps={steps}
            selected={selected}
            showAddButton
            droppableProvided={droppableProvided}
            showNavigationCards
          />
        </DragDropContext>
      </MockedProvider>
    )
    expect(getByTestId('goals-navigation-card')).toBeInTheDocument()
  })

  it('navigates on goals card click', async () => {
    const handleChange = jest.fn()
    const { getByTestId } = render(
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
            variant: 'admin'
          }}
        >
          <DragDropContext>
            <CardList
              steps={steps}
              selected={selected}
              droppableProvided={droppableProvided}
              handleChange={handleChange}
              showNavigationCards
            />
          </DragDropContext>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByTestId('goals-navigation-card'))
    expect(handleChange).toHaveBeenCalledWith('goals')
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
            showNavigationCards
          />
        </DragDropContext>
      </MockedProvider>
    )
    expect(getByTestId('social-preview-navigation-card')).toBeInTheDocument()
  })

  it('navigates on social preview card click', async () => {
    const handleChange = jest.fn()
    const { getByTestId } = render(
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
            variant: 'admin'
          }}
        >
          <DragDropContext>
            <CardList
              steps={steps}
              selected={selected}
              droppableProvided={droppableProvided}
              handleChange={handleChange}
              showNavigationCards
            />
          </DragDropContext>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByTestId('social-preview-navigation-card'))
    expect(handleChange).toHaveBeenCalledWith('social')
  })

  it('should display image for social navigationcard if image is provided', () => {
    const handleChange = jest.fn()
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
            variant: 'admin'
          }}
        >
          <SocialProvider
            initialValues={{
              primaryImageBlock: {
                src: 'https://images.unsplash.com/photo-1600133153574-25d98a99528c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80'
              }
            }}
          >
            <DragDropContext>
              <CardList
                steps={steps}
                selected={selected}
                droppableProvided={droppableProvided}
                handleChange={handleChange}
                showNavigationCards
              />
            </DragDropContext>
          </SocialProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getAllByRole('img')[0].attributes.getNamedItem('src')?.value).toBe(
      'https://images.unsplash.com/photo-1600133153574-25d98a99528c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80'
    )
  })

  it('should render the goal and social navigation card if journey is not a template', async () => {
    const { getByTestId } = render(
      <MockedProvider>
        <SocialProvider>
          <CardList
            steps={steps}
            selected={selected}
            showAddButton
            handleClick={jest.fn()}
            showNavigationCards
          />
        </SocialProvider>
      </MockedProvider>
    )
    expect(getByTestId('goals-navigation-card')).toBeInTheDocument()
    expect(getByTestId('social-preview-navigation-card')).toBeInTheDocument()
  })

  it('should render the goal and social navigation card if the user is a publisher', () => {
    const { getByTestId } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_USER_ROLE
            },
            result: {
              data: {
                getUserRole: {
                  id: 'userRoleId',
                  roles: [Role.publisher]
                }
              }
            }
          }
        ]}
      >
        <DragDropContext>
          <CardList
            steps={steps}
            selected={selected}
            droppableProvided={droppableProvided}
            handleChange={jest.fn()}
            showNavigationCards
          />
        </DragDropContext>
      </MockedProvider>
    )
    expect(getByTestId('goals-navigation-card')).toBeInTheDocument()
    expect(getByTestId('social-preview-navigation-card')).toBeInTheDocument()
  })

  it('should not render the goal and social navigation card if journey is a template', () => {
    const { queryByTestId } = render(
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
              template: true
            } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <DragDropContext>
            <CardList
              steps={steps}
              selected={selected}
              droppableProvided={droppableProvided}
              handleChange={jest.fn()}
              showNavigationCards
            />
          </DragDropContext>
        </JourneyProvider>
      </MockedProvider>
    )
    expect(queryByTestId('goals-navigation-card')).not.toBeInTheDocument()
    expect(
      queryByTestId('social-preview-navigation-card')
    ).not.toBeInTheDocument()
  })
})
