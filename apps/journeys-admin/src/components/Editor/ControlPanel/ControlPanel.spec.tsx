import { TreeBlock, EditorProvider } from '@core/journeys/ui'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import {
  GetJourney_journey_blocks_StepBlock as StepBlock,
  GetJourney_journey as Journey
} from '../../../../__generated__/GetJourney'
import { JourneyProvider } from '../../../libs/context'
import {
  ButtonVariant,
  ButtonColor,
  ButtonSize,
  ThemeMode,
  ThemeName
} from '../../../../__generated__/globalTypes'
import { VIDEO_BLOCK_CREATE } from './BlocksTab/NewVideoButton/NewVideoButton'
import { TYPOGRAPHY_BLOCK_CREATE } from './BlocksTab/NewTypographyButton/NewTypographyButton'
import { IMAGE_BLOCK_CREATE } from './BlocksTab/NewImageButton/NewImageButton'
import { SIGN_UP_BLOCK_CREATE } from './BlocksTab/NewSignUpButton/NewSignUpButton'
import { RADIO_QUESTION_BLOCK_CREATE } from './BlocksTab/NewRadioQuestionButton/NewRadioQuestionButton'
import { BUTTON_BLOCK_CREATE } from './BlocksTab/NewButtonButton/NewButtonButton'
import { ControlPanel } from '.'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: () => 'uuid'
}))

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

  it('should render the element', () => {
    const { getByTestId, getByText, getByRole } = render(
      <MockedProvider>
        <JourneyProvider
          value={
            {
              id: 'journeyId',
              themeMode: ThemeMode.dark,
              themeName: ThemeName.base
            } as unknown as Journey
          }
        >
          <EditorProvider initialState={{ steps: [step1, step2] }}>
            <ControlPanel />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getByRole('tabpanel', { name: 'Cards' })).toBeInTheDocument()
    fireEvent.click(getByTestId('preview-step1.id'))
    expect(getByRole('tabpanel', { name: 'Properties' })).toBeInTheDocument()
    expect(getByRole('tab', { name: 'Properties' })).not.toBeDisabled()
    expect(getByText('Unlocked Card')).toBeInTheDocument()
    fireEvent.click(getByRole('tab', { name: 'Cards' }))
    fireEvent.click(getByTestId('preview-step2.id'))
    expect(getByText('Locked With Interaction')).toBeInTheDocument()
  })

  it('should hide add button when clicking blocks tab', async () => {
    const { getByRole, queryByRole } = render(
      <MockedProvider>
        <JourneyProvider
          value={
            {
              id: 'journeyId',
              themeMode: ThemeMode.dark,
              themeName: ThemeName.base
            } as unknown as Journey
          }
        >
          <EditorProvider initialState={{ steps: [step1, step2] }}>
            <ControlPanel />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getByRole('tabpanel', { name: 'Cards' })).toBeInTheDocument()
    fireEvent.click(getByRole('tab', { name: 'Blocks' }))
    expect(getByRole('tabpanel', { name: 'Blocks' })).toBeInTheDocument()
    await waitFor(() =>
      expect(queryByRole('button', { name: 'Add' })).not.toBeInTheDocument()
    )
  })

  it('should hide add button when clicking add button', async () => {
    const { getByRole } = render(
      <MockedProvider>
        <JourneyProvider
          value={
            {
              id: 'journeyId',
              themeMode: ThemeMode.dark,
              themeName: ThemeName.base
            } as unknown as Journey
          }
        >
          <EditorProvider initialState={{ steps: [step1, step2] }}>
            <ControlPanel />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getByRole('tabpanel', { name: 'Cards' })).toBeInTheDocument()
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
                  content: 'Add your text here...',
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
          value={
            {
              id: 'journeyId',
              themeMode: ThemeMode.dark,
              themeName: ThemeName.base
            } as unknown as Journey
          }
        >
          <EditorProvider initialState={{ steps: [step1, step2, step3] }}>
            <ControlPanel />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getByRole('tab', { name: 'Cards' })).toBeInTheDocument()
    fireEvent.click(getByTestId('preview-step3.id'))
    expect(getByRole('tabpanel', { name: 'Properties' })).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Add' }))
    expect(getByRole('tabpanel', { name: 'Blocks' })).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Text' }))
    await waitFor(() =>
      expect(getByRole('tab', { name: 'Properties' })).toHaveAttribute(
        'aria-selected',
        'true'
      )
    )
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
          value={
            {
              id: 'journeyId',
              themeMode: ThemeMode.dark,
              themeName: ThemeName.base
            } as unknown as Journey
          }
        >
          <EditorProvider initialState={{ steps: [step1, step2, step3] }}>
            <ControlPanel />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getByRole('tab', { name: 'Cards' })).toBeInTheDocument()
    fireEvent.click(getByTestId('preview-step3.id'))
    expect(getByRole('tabpanel', { name: 'Properties' })).toBeInTheDocument()
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
          journeyId: 'journeyId',
          label: '',
          description: null
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
                  parentBlockId: 'cardId',
                  label: ''
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
          value={
            {
              id: 'journeyId',
              themeMode: ThemeMode.dark,
              themeName: ThemeName.base
            } as unknown as Journey
          }
        >
          <EditorProvider initialState={{ steps: [step1, step2, step3] }}>
            <ControlPanel />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getByRole('tab', { name: 'Cards' })).toBeInTheDocument()
    fireEvent.click(getByTestId('preview-step3.id'))
    expect(getByRole('tabpanel', { name: 'Properties' })).toBeInTheDocument()
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
          value={
            {
              id: 'journeyId',
              themeMode: ThemeMode.dark,
              themeName: ThemeName.base
            } as unknown as Journey
          }
        >
          <EditorProvider initialState={{ steps: [step1, step2, step3] }}>
            <ControlPanel />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getByRole('tab', { name: 'Cards' })).toBeInTheDocument()
    fireEvent.click(getByTestId('preview-step3.id'))
    expect(getByRole('tabpanel', { name: 'Properties' })).toBeInTheDocument()
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
          value={
            {
              id: 'journeyId',
              themeMode: ThemeMode.dark,
              themeName: ThemeName.base
            } as unknown as Journey
          }
        >
          <EditorProvider initialState={{ steps: [step1, step2, step3] }}>
            <ControlPanel />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getByRole('tab', { name: 'Cards' })).toBeInTheDocument()
    fireEvent.click(getByTestId('preview-step3.id'))
    expect(getByRole('tabpanel', { name: 'Properties' })).toBeInTheDocument()
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

  it('should change to properties tab on button button click', async () => {
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
                  label: 'Edit Text...',
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
                  label: 'Edit Text...',
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
          value={
            {
              id: 'journeyId',
              themeMode: ThemeMode.dark,
              themeName: ThemeName.base
            } as unknown as Journey
          }
        >
          <EditorProvider initialState={{ steps: [step1, step2, step3] }}>
            <ControlPanel />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getByRole('tab', { name: 'Cards' })).toBeInTheDocument()
    fireEvent.click(getByTestId('preview-step3.id'))
    expect(getByRole('tabpanel', { name: 'Properties' })).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Add' }))
    expect(getByRole('tabpanel', { name: 'Blocks' })).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Button' }))
    await waitFor(() =>
      expect(getByRole('tab', { name: 'Properties' })).toHaveAttribute(
        'aria-selected',
        'true'
      )
    )
  })
})
