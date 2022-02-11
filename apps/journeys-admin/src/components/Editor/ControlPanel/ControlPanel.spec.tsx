import { TreeBlock, EditorProvider } from '@core/journeys/ui'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import {
  GetJourney_journey_blocks_StepBlock as StepBlock,
  GetJourney_journey as Journey
} from '../../../../__generated__/GetJourney'
import { JourneyProvider } from '../../../libs/context'
import { VIDEO_BLOCK_CREATE } from './BlocksTab/NewVideoButton/NewVideoButton'
import { TYPOGRAPHY_BLOCK_CREATE } from './BlocksTab/NewTypographyButton/NewTypographyButton'
import { IMAGE_BLOCK_CREATE } from './BlocksTab/NewImageButton/NewImageButton'
import { SIGN_UP_BLOCK_CREATE } from './BlocksTab/NewSignUpButton/NewSignUpButton'
import { RADIO_QUESTION_BLOCK_CREATE } from './BlocksTab/NewRadioQuestionButton/NewRadioQuestionButton'
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
        <EditorProvider initialState={{ steps: [step1, step2] }}>
          <ControlPanel />
        </EditorProvider>
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
        <EditorProvider initialState={{ steps: [step1, step2] }}>
          <ControlPanel />
        </EditorProvider>
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
    const { getByRole, queryByRole } = render(
      <MockedProvider>
        <EditorProvider initialState={{ steps: [step1, step2] }}>
          <ControlPanel />
        </EditorProvider>
      </MockedProvider>
    )
    expect(getByRole('tabpanel', { name: 'Cards' })).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Add' }))
    expect(getByRole('tabpanel', { name: 'Blocks' })).toBeInTheDocument()
    await waitFor(() =>
      expect(queryByRole('button', { name: 'Add' })).not.toBeInTheDocument()
    )
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
        <JourneyProvider value={{ id: 'journeyId' } as unknown as Journey}>
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
                  journeyId: 'journeyId',
                  parentBlockId: 'cardId',
                  submitLabel: 'Submit'
                }
              }
            },
            result: {
              data: {
                signUpBlockCreate: {
                  id: 'signUpBlockId',
                  parentBlockId: 'cardId',
                  journeyId: 'journeyId',
                  parentOrder: 0,
                  submitLabel: 'Submit',
                  __typename: 'SignUpBlock',
                  action: {
                    __typename: 'NavigateToBlockAction',
                    gtmEventName: 'gtmEventName',
                    blockId: 'def'
                  },
                  submitIcon: null
                }
              }
            }
          }
        ]}
      >
        <JourneyProvider value={{ id: 'journeyId' } as unknown as Journey}>
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
    const { getByRole, getByTestId } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: RADIO_QUESTION_BLOCK_CREATE,
              variables: {
                input: {
                  journeyId: 'journeyId',
                  id: 'uuid',
                  parentBlockId: 'cardId',
                  label: 'Your Question Here?'
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
            result: {
              data: {
                radioQuestionBlockCreate: {
                  __typename: 'RadioQuestionBlock',
                  id: 'uuid',
                  parentBlockId: 'cardId',
                  journeyId: 'journeyId',
                  label: 'Your Question Here?',
                  description: null
                },
                radioOption1: {
                  __typename: 'RadioOptionBlock',
                  id: 'radioOptionBlockId1',
                  parentBlockId: 'uuid',
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
                  journeyId: 'journeyId',
                  label: 'Option 2',
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
        <JourneyProvider value={{ id: 'journeyId' } as unknown as Journey}>
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
        <JourneyProvider value={{ id: 'journeyId' } as unknown as Journey}>
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
                  videoContent: {
                    src: null
                  },
                  title: '',
                  fullsize: null
                }
              }
            },
            result: {
              data: {
                videoBlockCreate: {
                  id: 'videoBlockId',
                  parentBlockId: 'cardId',
                  journeyId: 'journeyId',
                  title: '',
                  muted: false,
                  autoplay: true,
                  startAt: null,
                  endAt: null,
                  posterBlockId: null,
                  videoContent: {
                    src: null
                  },
                  fullsize: null
                }
              }
            }
          }
        ]}
      >
        <JourneyProvider value={{ id: 'journeyId' } as unknown as Journey}>
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
})
