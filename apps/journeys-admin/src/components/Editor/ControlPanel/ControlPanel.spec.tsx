import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { formatISO } from 'date-fns'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'

import type { TreeBlock } from '@core/journeys/ui/block'
import {
  ActiveFab,
  ActiveJourneyEditContent,
  ActiveTab,
  EditorProvider
} from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../__generated__/GetJourney'
import {
  ButtonColor,
  ButtonSize,
  ButtonVariant,
  ThemeMode,
  ThemeName,
  TypographyVariant,
  VideoBlockSource
} from '../../../../__generated__/globalTypes'
import { TestEditorState } from '../../../libs/TestEditorState'
import { STEP_AND_CARD_BLOCK_CREATE } from '../../CardPreview/CardPreview'

import { BUTTON_BLOCK_CREATE } from './BlocksTab/NewButtonButton/NewButtonButton'
import { IMAGE_BLOCK_CREATE } from './BlocksTab/NewImageButton/NewImageButton'
import { RADIO_QUESTION_BLOCK_CREATE } from './BlocksTab/NewRadioQuestionButton/NewRadioQuestionButton'
import { SIGN_UP_BLOCK_CREATE } from './BlocksTab/NewSignUpButton/NewSignUpButton'
import { TYPOGRAPHY_BLOCK_CREATE } from './BlocksTab/NewTypographyButton/NewTypographyButton'
import { VIDEO_BLOCK_CREATE } from './BlocksTab/NewVideoButton/NewVideoButton'

import { ControlPanel } from '.'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: () => 'uuid'
}))

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => ({ t: (str: string) => str })
}))

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn(() => ({ query: { tab: 'active' } }))
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('ControlPanel', () => {
  const step1: TreeBlock = {
    id: 'step1.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 0,
    locked: false,
    nextBlockId: null,
    children: [
      {
        id: 'card1.id',
        __typename: 'CardBlock',
        parentBlockId: 'step1.id',
        parentOrder: 0,
        coverBlockId: null,
        backgroundColor: null,
        themeMode: null,
        themeName: null,
        fullscreen: false,
        children: []
      }
    ]
  }
  const step2: TreeBlock = {
    id: 'step2.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 1,
    locked: true,
    nextBlockId: null,
    children: [
      {
        id: 'card2.id',
        __typename: 'CardBlock',
        parentBlockId: 'step2.id',
        parentOrder: 0,
        coverBlockId: null,
        backgroundColor: null,
        themeMode: null,
        themeName: null,
        fullscreen: false,
        children: []
      }
    ]
  }
  const step3: TreeBlock = {
    __typename: 'StepBlock',
    id: 'step3.id',
    parentBlockId: null,
    parentOrder: 2,
    locked: true,
    nextBlockId: null,
    children: [
      {
        id: 'card3.id',
        __typename: 'CardBlock',
        parentBlockId: 'step3.id',
        parentOrder: 0,
        coverBlockId: null,
        backgroundColor: null,
        themeMode: null,
        themeName: null,
        fullscreen: false,
        children: [
          {
            __typename: 'TypographyBlock',
            id: 'typography.id',
            parentBlockId: 'step3.id',
            parentOrder: 0,
            variant: TypographyVariant.body1,
            content: 'typography content',
            color: null,
            align: null,
            children: []
          }
        ]
      }
    ]
  }
  const step4: TreeBlock = {
    __typename: 'StepBlock',
    id: 'step4.id',
    parentBlockId: null,
    parentOrder: 2,
    locked: true,
    nextBlockId: null,
    children: [
      {
        id: 'card4.id',
        __typename: 'CardBlock',
        parentBlockId: 'step4.id',
        parentOrder: 0,
        coverBlockId: null,
        backgroundColor: null,
        themeMode: null,
        themeName: null,
        fullscreen: false,
        children: [
          {
            __typename: 'VideoBlock',
            id: 'videoId',
            parentBlockId: 'card4.id',
            parentOrder: null,
            muted: true,
            autoplay: false,
            startAt: null,
            endAt: null,
            posterBlockId: null,
            fullsize: null,
            videoId: null,
            videoVariantLanguageId: null,
            source: VideoBlockSource.internal,
            title: null,
            description: null,
            image: null,
            duration: null,
            objectFit: null,
            video: null,
            action: null,
            children: []
          }
        ]
      }
    ]
  }

  it('should render tabs and tab panels', async () => {
    const push = jest.fn()
    const on = jest.fn()
    mockedUseRouter.mockReturnValue({
      push,
      events: {
        on
      },
      query: { param: null }
    } as unknown as NextRouter)

    const { getByTestId, getByText, getByRole } = render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: {
              id: 'journeyId',
              themeMode: ThemeMode.dark,
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
          <EditorProvider initialState={{ steps: [step1, step2] }}>
            <ControlPanel />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    // Default start on Cards
    expect(getByRole('tabpanel', { name: 'Journey' })).toBeInTheDocument()
    fireEvent.click(getByRole('tab', { name: 'Properties' }))
    expect(getByRole('tabpanel', { name: 'Properties' })).toBeInTheDocument()
    expect(getByText('Unlocked Card')).toBeInTheDocument()
    fireEvent.click(getByTestId('CardItem-step2.id'))
    expect(getByText('Locked With Interaction')).toBeInTheDocument()
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith({
        push,
        events: {
          on
        },
        query: { param: 'properties-tab' }
      })
    })

    fireEvent.click(getByRole('tab', { name: 'Blocks' }))
    expect(getByRole('tabpanel', { name: 'Blocks' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Text' })).toBeInTheDocument()
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith({
        push,
        events: {
          on
        },
        query: { param: 'blocks-tab' }
      })
    })

    fireEvent.click(getByRole('tab', { name: 'Journey' }))
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith({
        push,
        events: {
          on
        },
        query: { param: 'journeys-tab' }
      })
    })
  })

  it('should render component properties if a component is selected', async () => {
    const { getByRole } = render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: {
              id: 'journeyId',
              themeMode: ThemeMode.dark,
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
          <EditorProvider
            initialState={{
              steps: [step1],
              selectedBlock: undefined,
              selectedComponent: 'Footer'
            }}
          >
            <ControlPanel />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('tab', { name: 'Properties' }))
    expect(getByRole('tab', { name: 'Properties' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
    expect(
      getByRole('button', { name: 'Chat Widget None' })
    ).toBeInTheDocument()
  })

  //  "Exceeded timeout of 10000 ms for a test" on CI
  it.skip('should hide add button when clicking blocks tab', async () => {
    const { getByRole, queryByRole } = render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: {
              id: 'journeyId',
              themeMode: ThemeMode.dark,
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
          <EditorProvider initialState={{ steps: [step1, step2] }}>
            <ControlPanel />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('tab', { name: 'Blocks' }))
    await waitFor(() =>
      expect(queryByRole('button', { name: 'Add' })).not.toBeInTheDocument()
    )
  })

  //  "Exceeded timeout of 10000 ms for a test" on CI
  it.skip('should hide add button when clicking add button', async () => {
    const { queryByRole, getByRole } = render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: {
              id: 'journeyId',
              themeMode: ThemeMode.dark,
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
          <EditorProvider initialState={{ steps: [step1, step2] }}>
            <ControlPanel />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Add' }))
    expect(getByRole('tabpanel', { name: 'Blocks' })).toBeInTheDocument()
    await waitFor(() =>
      expect(queryByRole('button', { name: 'Add' })).not.toBeInTheDocument()
    )
  })

  //  "Exceeded timeout of 10000 ms for a test" on CI
  it.skip('should change to properties tab on text button click', async () => {
    const { getByRole, getByTestId } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: TYPOGRAPHY_BLOCK_CREATE,
              variables: {
                input: {
                  journeyId: 'journeyId',
                  parentBlockId: 'card3.id',
                  content: '',
                  variant: 'body2'
                }
              }
            },
            result: {
              data: {
                typographyBlockCreate: {
                  id: 'typographyBlockId',
                  parentBlockId: 'cardId',
                  parentOrder: null,
                  journeyId: 'journeyId',
                  align: null,
                  color: null,
                  content: null,
                  variant: null
                }
              }
            }
          }
        ]}
      >
        <JourneyProvider
          value={{
            journey: {
              id: 'journeyId',
              themeMode: ThemeMode.dark,
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
          <EditorProvider initialState={{ steps: [step1, step2, step3] }}>
            <ControlPanel />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByTestId('CardItem-step3.id'))
    fireEvent.click(getByRole('button', { name: 'Add' }))
    expect(getByRole('tabpanel', { name: 'Blocks' })).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Text' }))
    await waitFor(() => {
      expect(getByRole('button', { name: 'Done' })).toBeInTheDocument()
      expect(getByRole('tab', { name: 'Properties' })).toHaveAttribute(
        'aria-selected',
        'true'
      )
    })
  })

  it('should change to properties tab on subscribe button click', async () => {
    const { getByRole, getByTestId } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: SIGN_UP_BLOCK_CREATE,
              variables: {
                input: {
                  id: 'uuid',
                  journeyId: 'journeyId',
                  parentBlockId: 'card3.id',
                  submitLabel: 'Submit'
                },
                iconBlockCreateInput: {
                  id: 'uuid',
                  journeyId: 'journeyId',
                  parentBlockId: 'uuid',
                  name: null
                },
                id: 'uuid',
                journeyId: 'journeyId',
                updateInput: {
                  submitIconId: 'uuid'
                }
              }
            },
            result: {
              data: {
                signUpBlockCreate: {
                  __typename: 'SignUpBlock',
                  id: 'uuid'
                },
                submitIcon: {
                  __typename: 'IconBlock',
                  id: 'uuid',
                  journeyId: 'journeyId',
                  parentBlockId: 'uuid',
                  parentOrder: null,
                  iconName: null,
                  iconColor: null,
                  iconSize: null
                },
                signUpBlockUpdate: {
                  __typename: 'SignUpBlock',
                  id: 'uuid',
                  parentBlockId: 'cardId',
                  parentOrder: 0,
                  journeyId: 'journeyId',
                  submitIconId: 'uuid',
                  submitLabel: 'Submit',
                  action: {
                    __typename: 'NavigateToBlockAction',
                    gtmEventName: 'gtmEventName',
                    blockId: 'def'
                  }
                }
              }
            }
          }
        ]}
      >
        <JourneyProvider
          value={{
            journey: {
              id: 'journeyId',
              themeMode: ThemeMode.dark,
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
          <EditorProvider initialState={{ steps: [step1, step2, step3] }}>
            <ControlPanel />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Add' })).toBeInTheDocument()
    fireEvent.click(getByTestId('CardItem-step3.id'))
    fireEvent.click(getByRole('button', { name: 'Add' }))
    expect(getByRole('tabpanel', { name: 'Blocks' })).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Subscribe' }))
    await waitFor(() =>
      expect(getByRole('tab', { name: 'Properties' })).toHaveAttribute(
        'aria-selected',
        'true'
      )
    )
  })

  it('should change to properties tab on poll button click', async () => {
    const titleCreateResult = jest.fn(() => ({
      data: {
        typographyBlockCreate: {
          id: 'typographyId.1',
          parentBlockId: 'cardId',
          parentOrder: 0,
          content: 'Your Question Here?',
          align: null,
          color: null,
          variant: 'h3',
          __typename: 'TypographyBlock'
        }
      }
    }))

    const descriptionCreateResult = jest.fn(() => ({
      data: {
        typographyBlockCreate: {
          id: 'typographyId.2',
          parentBlockId: 'cardId',
          parentOrder: 1,
          content: 'Your Description Here',
          align: null,
          color: null,
          variant: 'body2',
          __typename: 'TypographyBlock'
        }
      }
    }))

    const radioCreateResult = jest.fn(() => ({
      data: {
        radioQuestionBlockCreate: {
          __typename: 'RadioQuestionBlock',
          id: 'uuid',
          parentBlockId: 'cardId',
          parentOrder: 2,
          journeyId: 'journeyId'
        },
        radioOption1: {
          __typename: 'RadioOptionBlock',
          id: 'radioOptionBlockId1',
          parentBlockId: 'uuid',
          parentOrder: 0,
          journeyId: 'journeyId',
          label: 'Option 1',
          action: {
            __typename: 'NavigateToBlockAction',
            gtmEventName: 'gtmEventName',
            blockId: 'def'
          }
        },
        radioOption2: {
          __typename: 'RadioOptionBlock',
          id: 'radioOptionBlockId2',
          parentBlockId: 'uuid',
          parentOrder: 1,
          journeyId: 'journeyId',
          label: 'Option 2',
          action: {
            __typename: 'NavigateToBlockAction',
            gtmEventName: 'gtmEventName',
            blockId: 'def'
          }
        }
      }
    }))

    const { getByRole, getByTestId } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: TYPOGRAPHY_BLOCK_CREATE,
              variables: {
                input: {
                  journeyId: 'journeyId',
                  parentBlockId: 'cardId',
                  content: 'Your Question Here?',
                  variant: 'h3'
                }
              }
            },
            result: titleCreateResult
          },
          {
            request: {
              query: TYPOGRAPHY_BLOCK_CREATE,
              variables: {
                input: {
                  journeyId: 'journeyId',
                  parentBlockId: 'cardId',
                  content: 'Your Description Here',
                  variant: 'body2'
                }
              }
            },
            result: descriptionCreateResult
          },
          {
            request: {
              query: RADIO_QUESTION_BLOCK_CREATE,
              variables: {
                input: {
                  journeyId: 'journeyId',
                  id: 'uuid',
                  parentBlockId: 'card3.id'
                },
                radioOptionBlockCreateInput1: {
                  journeyId: 'journeyId',
                  parentBlockId: 'uuid',
                  label: 'Option 1'
                },
                radioOptionBlockCreateInput2: {
                  journeyId: 'journeyId',
                  parentBlockId: 'uuid',
                  label: 'Option 2'
                }
              }
            },
            result: radioCreateResult
          }
        ]}
      >
        <JourneyProvider
          value={{
            journey: {
              id: 'journeyId',
              themeMode: ThemeMode.dark,
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
          <EditorProvider initialState={{ steps: [step1, step2, step3] }}>
            <ControlPanel />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByTestId('CardItem-step3.id'))
    fireEvent.click(getByRole('button', { name: 'Add' }))
    expect(getByRole('tabpanel', { name: 'Blocks' })).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Poll' }))
    await waitFor(() =>
      expect(getByRole('tab', { name: 'Properties' })).toHaveAttribute(
        'aria-selected',
        'true'
      )
    )
  })

  it('should change to properties tab on image button click', async () => {
    const { getByRole, getByTestId } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: IMAGE_BLOCK_CREATE,
              variables: {
                input: {
                  journeyId: 'journeyId',
                  parentBlockId: 'card3.id',
                  src: null,
                  alt: 'Default Image Icon'
                }
              }
            },
            result: {
              data: {
                imageBlockCreate: {
                  id: 'imageBlockId',
                  parentBlockId: 'cardId',
                  parentOrder: null,
                  journeyId: 'journeyId',
                  src: null,
                  alt: 'Default Image Icon',
                  width: 0,
                  height: 0,
                  blurhash: null,
                  __typename: 'ImageBlock'
                }
              }
            }
          }
        ]}
      >
        <JourneyProvider
          value={{
            journey: {
              id: 'journeyId',
              themeMode: ThemeMode.dark,
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
          <EditorProvider initialState={{ steps: [step1, step2, step3] }}>
            <ControlPanel />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByTestId('CardItem-step3.id'))
    fireEvent.click(getByRole('button', { name: 'Add' }))
    expect(getByRole('tabpanel', { name: 'Blocks' })).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Image' }))
    await waitFor(() =>
      expect(getByRole('tab', { name: 'Properties' })).toHaveAttribute(
        'aria-selected',
        'true'
      )
    )
  })

  it('should change to properties tab on video button click', async () => {
    const { getByRole, getByTestId } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: VIDEO_BLOCK_CREATE,
              variables: {
                input: {
                  journeyId: 'journeyId',
                  parentBlockId: 'card3.id',
                  autoplay: true,
                  muted: false,
                  fullsize: true
                }
              }
            },
            result: {
              data: {
                videoBlockCreate: {
                  id: 'videoBlockId',
                  parentBlockId: 'cardId',
                  parentOrder: null,
                  journeyId: 'journeyId',
                  title: '',
                  muted: false,
                  autoplay: true,
                  startAt: null,
                  endAt: null,
                  posterBlockId: null,
                  video: null,
                  fullsize: true
                }
              }
            }
          }
        ]}
      >
        <JourneyProvider
          value={{
            journey: {
              id: 'journeyId',
              themeMode: ThemeMode.dark,
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
          <EditorProvider initialState={{ steps: [step1, step2, step3] }}>
            <ControlPanel />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByTestId('CardItem-step3.id'))
    fireEvent.click(getByRole('button', { name: 'Add' }))
    expect(getByRole('tabpanel', { name: 'Blocks' })).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Video' }))
    await waitFor(() =>
      expect(getByRole('tab', { name: 'Properties' })).toHaveAttribute(
        'aria-selected',
        'true'
      )
    )
  })

  it('should change to properties tab on "button" button click', async () => {
    const { getByRole, getByTestId } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: BUTTON_BLOCK_CREATE,
              variables: {
                input: {
                  id: 'uuid',
                  journeyId: 'journeyId',
                  parentBlockId: 'card3.id',
                  label: '',
                  variant: ButtonVariant.contained,
                  color: ButtonColor.primary,
                  size: ButtonSize.medium
                },
                iconBlockCreateInput1: {
                  id: 'uuid',
                  journeyId: 'journeyId',
                  parentBlockId: 'uuid',
                  name: null
                },
                iconBlockCreateInput2: {
                  id: 'uuid',
                  journeyId: 'journeyId',
                  parentBlockId: 'uuid',
                  name: null
                },
                id: 'uuid',
                journeyId: 'journeyId',
                updateInput: {
                  startIconId: 'uuid',
                  endIconId: 'uuid'
                }
              }
            },
            result: {
              data: {
                buttonBlockCreate: {
                  id: 'uuid'
                },
                startIcon: {
                  __typename: 'IconBlock',
                  id: 'uuid',
                  journeyId: 'journeyId',
                  parentBlockId: 'uuid',
                  parentOrder: null,
                  iconName: null,
                  iconColor: null,
                  iconSize: null
                },
                endIcon: {
                  __typename: 'IconBlock',
                  id: 'uuid',
                  journeyId: 'journeyId',
                  parentBlockId: 'uuid',
                  parentOrder: null,
                  iconName: null,
                  iconColor: null,
                  iconSize: null
                },
                buttonBlockUpdate: {
                  id: 'uuid',
                  parentBlockId: 'card3.id',
                  parentOrder: 0,
                  journeyId: 'journeyId',
                  label: '',
                  variant: ButtonVariant.contained,
                  color: ButtonColor.primary,
                  size: ButtonSize.medium,
                  startIconId: 'uuid',
                  endIconId: 'uuid',
                  action: null
                }
              }
            }
          }
        ]}
      >
        <JourneyProvider
          value={{
            journey: {
              id: 'journeyId',
              themeMode: ThemeMode.dark,
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
          <EditorProvider initialState={{ steps: [step1, step2, step3] }}>
            <ControlPanel />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByTestId('CardItem-step3.id'))
    fireEvent.click(getByRole('button', { name: 'Add' }))
    expect(getByRole('tabpanel', { name: 'Blocks' })).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Button' }))
    await waitFor(() => {
      expect(getByRole('button', { name: 'Done' })).toBeInTheDocument()
    })
    expect(getByRole('tab', { name: 'Properties' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
  })

  it('should keep Journey tab open when selecting a card', async () => {
    const { getByRole, getByTestId } = render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: {
              id: 'journeyId',
              themeMode: ThemeMode.dark,
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
          <EditorProvider initialState={{ steps: [step1, step2, step3] }}>
            <ControlPanel />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getByRole('tab', { name: 'Journey' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
    fireEvent.click(getByTestId('CardItem-step3.id'))
    expect(getByRole('tab', { name: 'Journey' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
  })

  it('should keep Journey tab open when adding a new card', async () => {
    const { getByRole, getAllByTestId } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: STEP_AND_CARD_BLOCK_CREATE,
              variables: {
                stepBlockCreateInput: {
                  id: 'uuid',
                  journeyId: 'journeyId'
                },
                cardBlockCreateInput: {
                  id: 'uuid',
                  journeyId: 'journeyId',
                  parentBlockId: 'uuid',
                  themeMode: ThemeMode.dark,
                  themeName: ThemeName.base
                }
              }
            },
            result: {
              data: {
                stepBlockCreate: {
                  id: 'uuid',
                  parentBlockId: null,
                  parentOrder: 1,
                  locked: false,
                  nextBlockId: null,
                  __typename: 'StepBlock'
                },
                cardBlockCreate: {
                  id: 'uui',
                  parentBlockId: 'uuid',
                  parentOrder: 0,
                  backgroundColor: null,
                  coverBlockId: null,
                  themeMode: ThemeMode.light,
                  themeName: ThemeName.base,
                  fullscreen: false,
                  __typename: 'CardBlock'
                }
              }
            }
          }
        ]}
      >
        <JourneyProvider
          value={{
            journey: {
              id: 'journeyId',
              themeMode: ThemeMode.dark,
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
          <EditorProvider initialState={{ steps: [step1] }}>
            <ControlPanel />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getByRole('tab', { name: 'Journey' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
    fireEvent.click(getAllByTestId('Plus2Icon')[1])
    await waitFor(() =>
      expect(getByRole('tab', { name: 'Journey' })).toHaveAttribute(
        'aria-selected',
        'true'
      )
    )
  })

  it('should open properties drawer when selecting a card with children', async () => {
    const { getByTestId, getByText } = render(
      <SnackbarProvider>
        <MockedProvider>
          <JourneyProvider
            value={{
              journey: {
                id: 'journeyId',
                themeMode: ThemeMode.dark,
                themeName: ThemeName.base,
                language: {
                  __typename: 'Language',
                  id: '529',
                  bcp47: 'en',
                  iso3: 'eng',
                  name: [{ primary: true, value: 'English' }]
                },
                createdAt: formatISO(new Date())
              } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditorProvider
              initialState={{
                steps: [step1, step2, step3],
                selectedBlock: step1,
                drawerMobileOpen: false,
                activeTab: ActiveTab.Properties,
                activeFab: ActiveFab.Add,
                journeyEditContentComponent: ActiveJourneyEditContent.Canvas
              }}
            >
              <TestEditorState renderChildren />
              <ControlPanel />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    fireEvent.click(getByTestId('CardItem-step3.id'))
    expect(getByText('selectedBlock: step3.id')).toBeInTheDocument()
    expect(getByText('drawerMobileOpen: false')).toBeInTheDocument()
    expect(getByText('drawerTitle: Properties')).toBeInTheDocument()
  })

  it('should open card template drawer when selecting a card without children', async () => {
    const { getByTestId, getByText, getByRole } = render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: {
              id: 'journeyId',
              themeMode: ThemeMode.dark,
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
          <EditorProvider
            initialState={{
              steps: [step1, step2, step3],
              selectedBlock: step1,
              drawerMobileOpen: false,
              activeTab: ActiveTab.Properties,
              activeFab: ActiveFab.Add,
              journeyEditContentComponent: ActiveJourneyEditContent.Canvas
            }}
          >
            <TestEditorState renderChildren />
            <ControlPanel />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByTestId('CardItem-step2.id'))
    expect(getByText('selectedBlock: step2.id')).toBeInTheDocument()
    expect(getByText('drawerMobileOpen: false')).toBeInTheDocument()
    expect(getByText('drawerTitle: Card Templates')).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Card Video Template' })
    ).toBeInTheDocument()
  })

  it('should not allow blocks to be added when a Video Block is present', async () => {
    const { getByRole } = render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: {
              id: 'journeyId',
              themeMode: ThemeMode.dark,
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
          <EditorProvider initialState={{ steps: [step4] }}>
            <ControlPanel />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    expect(getByRole('tab', { name: 'Blocks' })).toBeInTheDocument()
    expect(getByRole('tab', { name: 'Blocks' })).toBeDisabled()
  })

  it('should show a tooltip when disabled blocks tab is hovered over', async () => {
    const { getByRole, queryByRole } = render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: {
              id: 'journeyId',
              themeMode: ThemeMode.dark,
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
          <EditorProvider initialState={{ steps: [step4] }}>
            <ControlPanel />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    expect(getByRole('tab', { name: 'Blocks' })).toBeInTheDocument()
    expect(getByRole('tab', { name: 'Blocks' })).toBeDisabled()
    expect(queryByRole('tooltip')).not.toBeInTheDocument()
    fireEvent.mouseEnter(getByRole('tab', { name: 'Blocks' }))
    await waitFor(() =>
      expect(
        getByRole('tooltip', {
          name: 'Blocks cannot be placed on top of Video Block'
        })
      ).toBeInTheDocument()
    )
  })

  it('should open mobile drawer for social preview', async () => {
    const { getByText, getByRole, getByTestId } = render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: {
              id: 'journeyId',
              themeMode: ThemeMode.dark,
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
          <EditorProvider
            initialState={{
              steps: [step1, step2, step3],
              selectedBlock: step1,
              drawerMobileOpen: false,
              activeTab: ActiveTab.Properties,
              activeFab: ActiveFab.Add
            }}
          >
            <TestEditorState renderChildren />
            <ControlPanel />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByTestId('NavigationCardSocial'))
    expect(getByRole('tab', { name: 'Properties' })).toHaveAttribute('disabled')
    expect(getByRole('tab', { name: 'Blocks' })).toHaveAttribute('disabled')
    fireEvent.click(getByTestId('social-edit-fab'))
    expect(getByText('selectedBlock: step1.id')).toBeInTheDocument()
    expect(getByText('drawerMobileOpen: true')).toBeInTheDocument()
    expect(getByText('drawerTitle: Social Share Preview')).toBeInTheDocument()
    expect(getByText('journeyEditContentComponent: social')).toBeInTheDocument()
    expect(getByText('Social Image')).toBeInTheDocument()
  })

  it('should open social preview on selection', async () => {
    const { getByTestId, getByText } = render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: {
              id: 'journeyId',
              themeMode: ThemeMode.dark,
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
          <EditorProvider
            initialState={{
              steps: [step1, step2, step3],
              selectedBlock: step1,
              drawerMobileOpen: false,
              activeTab: ActiveTab.Properties,
              activeFab: ActiveFab.Add,
              journeyEditContentComponent: ActiveJourneyEditContent.Canvas
            }}
          >
            <TestEditorState renderChildren />
            <ControlPanel />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByTestId('NavigationCardSocial'))
    expect(getByText('selectedBlock: step1.id')).toBeInTheDocument()
    expect(getByText('drawerMobileOpen: false')).toBeInTheDocument()
    expect(getByText('drawerTitle: Social Share Preview')).toBeInTheDocument()
    expect(getByText('journeyEditContentComponent: social')).toBeInTheDocument()
    expect(getByText('Social Image')).toBeInTheDocument()
  })

  it('should open action on selection', async () => {
    const { getByTestId, getByText } = render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: {
              id: 'journeyId',
              themeMode: ThemeMode.dark,
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
          <EditorProvider
            initialState={{
              steps: [step1, step2, step3],
              selectedBlock: step1,
              drawerMobileOpen: false,
              activeTab: ActiveTab.Properties,
              activeFab: ActiveFab.Add,
              journeyEditContentComponent: ActiveJourneyEditContent.Canvas
            }}
          >
            <TestEditorState />
            <ControlPanel />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByTestId('NavigationCardGoals'))
    expect(getByText('journeyEditContentComponent: action')).toBeInTheDocument()
  })

  it('should open social share preview drawer when changing to journey tab', async () => {
    const { getByText } = render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: {
              id: 'journeyId',
              themeMode: ThemeMode.dark,
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
          <EditorProvider
            initialState={{
              steps: [step1, step2, step3],
              selectedBlock: step1,
              drawerMobileOpen: false,
              activeTab: ActiveTab.Properties,
              activeFab: ActiveFab.Add,
              journeyEditContentComponent:
                ActiveJourneyEditContent.SocialPreview
            }}
          >
            <TestEditorState />
            <ControlPanel />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByText('Journey'))
    expect(getByText('drawerTitle: Social Share Preview')).toBeInTheDocument()
  })

  it('should open information drawer when changing to journey tab', async () => {
    const { getByText } = render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: {
              id: 'journeyId',
              themeMode: ThemeMode.dark,
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
          <EditorProvider
            initialState={{
              steps: [step1, step2, step3],
              selectedBlock: step1,
              drawerMobileOpen: false,
              activeTab: ActiveTab.Properties,
              activeFab: ActiveFab.Add,
              journeyEditContentComponent: ActiveJourneyEditContent.Action
            }}
          >
            <TestEditorState />
            <ControlPanel />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByText('Journey'))
    expect(getByText('drawerTitle: Information')).toBeInTheDocument()
  })

  it('should open properties drawer when changing to journey tab when card not empty', async () => {
    const { getByText } = render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: {
                id: 'journeyId',
                themeMode: ThemeMode.dark,
                themeName: ThemeName.base,
                language: {
                  __typename: 'Language',
                  id: '529',
                  bcp47: 'en',
                  iso3: 'eng',
                  name: [{ primary: true, value: 'English' }]
                },
                createdAt: formatISO(new Date())
              } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditorProvider
              initialState={{
                steps: [step1, step2, step3],
                selectedBlock: step3,
                selectedStep: step3,
                drawerMobileOpen: false,
                activeTab: ActiveTab.Properties,
                activeFab: ActiveFab.Add,
                journeyEditContentComponent: ActiveJourneyEditContent.Canvas
              }}
            >
              <TestEditorState renderChildren />
              <ControlPanel />
            </EditorProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.click(getByText('Journey'))
    expect(getByText('drawerTitle: Properties')).toBeInTheDocument()
  })

  it('should open properties drawer when changing to journey tab when card empty', async () => {
    const { getByText } = render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: {
                id: 'journeyId',
                themeMode: ThemeMode.dark,
                themeName: ThemeName.base,
                language: {
                  __typename: 'Language',
                  id: '529',
                  bcp47: 'en',
                  iso3: 'eng',
                  name: [{ primary: true, value: 'English' }]
                },
                createdAt: formatISO(new Date())
              } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditorProvider
              initialState={{
                steps: [step1, step2, step3],
                selectedBlock: step1,
                selectedStep: step1,
                drawerMobileOpen: false,
                activeTab: ActiveTab.Properties,
                activeFab: ActiveFab.Add,
                journeyEditContentComponent: ActiveJourneyEditContent.Canvas
              }}
            >
              <TestEditorState />
              <ControlPanel />
            </EditorProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.click(getByText('Journey'))
    expect(getByText('drawerTitle: Card Templates')).toBeInTheDocument()
  })
})
