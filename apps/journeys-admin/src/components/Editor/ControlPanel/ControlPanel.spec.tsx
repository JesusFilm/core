import { TreeBlock, EditorProvider } from '@core/journeys/ui'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import {
  GetJourney_journey_blocks_StepBlock as StepBlock,
  GetJourney_journey as Journey
} from '../../../../__generated__/GetJourney'
import { JourneyProvider } from '../../../libs/context'
import { TYPOGRAPHY_BLOCK_CREATE } from './BlocksTab/Typography'
import { ControlPanel } from '.'

describe('ControlPanel', () => {
  const step1: TreeBlock<StepBlock> = {
    id: 'step1.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    locked: false,
    nextBlockId: null,
    children: []
  }
  const step2: TreeBlock<StepBlock> = {
    id: 'step2.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    locked: true,
    nextBlockId: null,
    children: []
  }
  const step3: TreeBlock = {
    __typename: 'StepBlock',
    id: 'step3.id',
    parentBlockId: null,
    locked: true,
    nextBlockId: null,
    children: [
      {
        id: 'cardId',
        __typename: 'CardBlock',
        parentBlockId: 'stepId',
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
    fireEvent.click(getByTestId('step-step1.id'))
    expect(getByRole('tabpanel', { name: 'Properties' })).toBeInTheDocument()
    expect(getByRole('tab', { name: 'Properties' })).not.toBeDisabled()
    expect(getByText('Unlocked Card')).toBeInTheDocument()
    fireEvent.click(getByRole('tab', { name: 'Cards' }))
    fireEvent.click(getByTestId('step-step2.id'))
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
    fireEvent.click(getByTestId('step-step3.id'))
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
})
