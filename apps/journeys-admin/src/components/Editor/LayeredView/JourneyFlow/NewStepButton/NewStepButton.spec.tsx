import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ReactFlowProvider } from 'reactflow'
import { v4 as uuidv4 } from 'uuid'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'

import { stepAndCardBlockCreateMock } from '../../../../../libs/useStepAndCardBlockCreateMutation/useStepAndCardBlockCreateMutation.mock'

import { NewStepButton } from '.'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

describe('NewStepButton', () => {
  it('should render', () => {
    render(
      <MockedProvider>
        <ReactFlowProvider>
          <NewStepButton />
        </ReactFlowProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Add Step' })).toBeInTheDocument()
  })

  it('should create a step on click', async () => {
    mockUuidv4.mockReturnValueOnce('newStep.id')
    mockUuidv4.mockReturnValueOnce('newCard.id')

    const result = jest.fn().mockReturnValue(stepAndCardBlockCreateMock.result)

    render(
      <MockedProvider mocks={[{ ...stepAndCardBlockCreateMock, result }]}>
        <JourneyProvider value={{ journey: defaultJourney }}>
          <EditorProvider>
            <ReactFlowProvider>
              <NewStepButton />
            </ReactFlowProvider>
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Add Step' }))

    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should be disabled', () => {
    render(
      <MockedProvider>
        <ReactFlowProvider>
          <NewStepButton disabled />
        </ReactFlowProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Add Step' })).toBeDisabled()
  })
})
