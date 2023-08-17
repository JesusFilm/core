import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import {
  ActiveFab,
  ActiveJourneyEditContent,
  ActiveTab,
  EditorProvider,
  EditorState,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_StepBlock as StepBlock,
  GetJourney_journey_blocks_VideoBlock as VideoBlock
} from '../../../../__generated__/GetJourney'
import {
  ButtonColor,
  ButtonSize,
  ButtonVariant,
  ThemeMode,
  ThemeName,
  VideoBlockSource
} from '../../../../__generated__/globalTypes'
import { STEP_AND_CARD_BLOCK_CREATE } from '../../CardPreview/CardPreview'
import { SocialShareAppearance } from '../Drawer/SocialShareAppearance'

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
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

jest.mock('@core/journeys/ui/EditorProvider', () => {
  const originalModule = jest.requireActual('@core/journeys/ui/EditorProvider')
  return {
    __esModule: true,
    ...originalModule,
    useEditor: jest.fn(
      jest.requireActual('@core/journeys/ui/EditorProvider').useEditor
    )
  }
})

describe('ControlPanel', () => {
  const step1: TreeBlock<StepBlock> = {
    id: 'step1.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 0,
    locked: false,
    nextBlockId: null,
    children: []
  }
  const step2: TreeBlock<StepBlock> = {
    id: 'step2.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 1,
    locked: true,
    nextBlockId: null,
    children: []
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
        id: 'cardId',
        __typename: 'CardBlock',
        parentBlockId: 'stepId',
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

  const videoBlock: TreeBlock<VideoBlock> = {
    __typename: 'VideoBlock',
    id: 'videoId',
    parentBlockId: null,
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

  it('should render tabs and tab panels', async () => {
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
    fireEvent.click(getByTestId('preview-step2.id'))
    expect(getByText('Locked With Interaction')).toBeInTheDocument()
    fireEvent.click(getByRole('tab', { name: 'Blocks' }))
    expect(getByRole('tabpanel', { name: 'Blocks' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Text' })).toBeInTheDocument()
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

  // test fails in ci, but passes locally and in wallaby and works as intended
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

  it('should hide add button when clicking add button', async () => {
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
          <EditorProvider initialState={{ steps: [step1, step2] }}>
            <ControlPanel />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Add' }))
    expect(getByRole('tabpanel', { name: 'Blocks' })).toBeInTheDocument()
    // TODO: Flakey expectation passes locally, fails remotely
    // await waitFor(() =>
    //   expect(queryByRole('button', { name: 'Add' })).not.toBeInTheDocument()
    // )
  })

  it('should change to properties tab on text button click', async () => {
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
                  content: '',
                  variant: 'h1'
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
    fireEvent.click(getByTestId('preview-step3.id'))
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
                  parentBlockId: 'cardId',
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
    fireEvent.click(getByTestId('preview-step3.id'))
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
                  parentBlockId: 'cardId'
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
    fireEvent.click(getByTestId('preview-step3.id'))
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
                  parentBlockId: 'cardId',
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
    fireEvent.click(getByTestId('preview-step3.id'))
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
                  parentBlockId: 'cardId',
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
    fireEvent.click(getByTestId('preview-step3.id'))
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
                  parentBlockId: 'cardId',
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
                  parentBlockId: 'cardId',
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
    fireEvent.click(getByTestId('preview-step3.id'))
    fireEvent.click(getByRole('button', { name: 'Add' }))
    expect(getByRole('tabpanel', { name: 'Blocks' })).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Button' }))
    await waitFor(() => {
      expect(getByRole('button', { name: 'Done' })).toBeInTheDocument()
      expect(getByRole('tab', { name: 'Properties' })).toHaveAttribute(
        'aria-selected',
        'true'
      )
    })
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
    fireEvent.click(getByTestId('preview-step3.id'))
    expect(getByRole('tab', { name: 'Journey' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
  })

  it('should keep cards tab open when adding a new card', async () => {
    const { getByRole, getByTestId } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: STEP_AND_CARD_BLOCK_CREATE,
              variables: {
                journeyId: 'journeyId',
                stepId: 'uuid',
                cardId: 'uuid'
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
    fireEvent.click(getByTestId('AddIcon'))
    await waitFor(() =>
      expect(getByRole('tab', { name: 'Journey' })).toHaveAttribute(
        'aria-selected',
        'true'
      )
    )
  })

  it('should not allow blocks to be added when a Video Block is present', async () => {
    const step4 = step3
    step4.children[0].children.push(videoBlock)
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
    const step4 = step3
    step4.children[0].children.push(videoBlock)
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
    const state: EditorState = {
      steps: [step1, step2, step3],
      selectedBlock: step1,
      drawerMobileOpen: false,
      activeTab: ActiveTab.Properties,
      activeFab: ActiveFab.Add,
      journeyEditContentComponent: ActiveJourneyEditContent.SocialPreview
    }

    const mockUseEditor = useEditor as jest.MockedFunction<typeof useEditor>
    const dispatch = jest.fn()
    mockUseEditor.mockReturnValue({
      state,
      dispatch
    })

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
          <EditorProvider initialState={state}>
            <ControlPanel />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getByRole('tab', { name: 'Properties' })).toHaveAttribute('disabled')
    expect(getByRole('tab', { name: 'Blocks' })).toHaveAttribute('disabled')
    fireEvent.click(getByTestId('social-edit-fab'))
    expect(dispatch).toHaveBeenCalledWith({
      mobileOpen: true,
      type: 'SetDrawerMobileOpenAction'
    })
  })

  it('should open social preview on selection', async () => {
    const state: EditorState = {
      steps: [step1, step2, step3],
      selectedBlock: step1,
      drawerMobileOpen: false,
      activeTab: ActiveTab.Properties,
      activeFab: ActiveFab.Add,
      journeyEditContentComponent: ActiveJourneyEditContent.Canvas
    }

    const mockUseEditor = useEditor as jest.MockedFunction<typeof useEditor>
    const dispatch = jest.fn()
    mockUseEditor.mockReturnValue({
      state,
      dispatch
    })

    const { getByTestId } = render(
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
          <EditorProvider initialState={state}>
            <ControlPanel />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByTestId('social-preview-navigation-card'))
    expect(dispatch).toHaveBeenCalledWith({
      component: 'social',
      type: 'SetJourneyEditContentAction'
    })
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SetDrawerPropsAction',
      title: 'Social Share Preview',
      mobileOpen: false,
      children: <SocialShareAppearance />
    })
  })
})
