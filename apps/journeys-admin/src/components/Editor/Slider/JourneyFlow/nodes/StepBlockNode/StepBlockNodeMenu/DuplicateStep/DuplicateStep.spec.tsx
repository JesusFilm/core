import { InMemoryCache } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import noop from 'lodash/noop'
import { SnackbarProvider } from 'notistack'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { TreeBlock } from '@core/journeys/ui/block'

import { BlockFields_StepBlock as StepBlock } from '../../../../../../../../../__generated__/BlockFields'
import { GetJourney_journey as Journey } from '../../../../../../../../../__generated__/GetJourney'
import { StepDuplicate } from '../../../../../../../../../__generated__/StepDuplicate'
import { TestEditorState } from '../../../../../../../../libs/TestEditorState'

import { STEP_DUPLICATE } from './DuplicateStep'

import { DuplicateStep } from '.'

describe('DuplicateStep', () => {
  const mockStepDuplicate: MockedResponse<StepDuplicate> = {
    request: {
      query: STEP_DUPLICATE,
      variables: {
        id: 'step.id',
        journeyId: 'journey.id',
        parentOrder: null,
        x: 40,
        y: 40
      }
    },
    result: {
      data: {
        blockDuplicate: [
          {
            __typename: 'StepBlock',
            id: 'newStep.id'
          }
        ]
      }
    }
  }

  const step = {
    __typename: 'StepBlock',
    id: 'step.id'
  } as unknown as TreeBlock<StepBlock>

  const journey = {
    id: 'journey.id'
  } as unknown as Journey

  it('duplicate the step', async () => {
    const mockDuplicateStepResult = jest.fn(() => ({
      ...mockStepDuplicate.result
    }))

    render(
      <MockedProvider
        mocks={[{ ...mockStepDuplicate, result: mockDuplicateStepResult }]}
      >
        <SnackbarProvider>
          <JourneyProvider value={{ journey }}>
            <DuplicateStep step={step} xPos={0} yPos={0} handleClick={noop} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    const duplicateButton = screen.getByRole('menuitem', {
      name: 'Duplicate Card'
    })
    await waitFor(async () => await userEvent.click(duplicateButton))

    await waitFor(() => expect(mockDuplicateStepResult).toHaveBeenCalled())
  })

  it('should update cache after duplication', async () => {
    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journey.id': {
        blocks: [{ __ref: `StepBlock:step.id` }],
        id: 'journey.id',
        __typename: 'Journey'
      },
      'StepBlock:step.id': {
        ...step
      }
    })

    render(
      <MockedProvider mocks={[mockStepDuplicate]} cache={cache}>
        <SnackbarProvider>
          <JourneyProvider value={{ journey }}>
            <DuplicateStep step={step} xPos={0} yPos={0} handleClick={noop} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    const duplicateButton = screen.getByRole('menuitem', {
      name: 'Duplicate Card'
    })
    await waitFor(async () => await userEvent.click(duplicateButton))

    expect(cache.extract()['Journey:journey.id']?.blocks).toEqual([
      { __ref: `StepBlock:step.id` },
      { __ref: `StepBlock:newStep.id` }
    ])

    expect(cache.extract()['StepBlock:step.id']).toEqual({
      __typename: 'StepBlock',
      id: 'step.id'
    })

    expect(cache.extract()['StepBlock:newStep.id']).toEqual({
      __typename: 'StepBlock',
      id: 'newStep.id'
    })
  })

  it('should handle actions on duplication success', async () => {
    const handleClick = jest.fn()
    const initialState = {
      steps: [step],
      selectedStep: step
    }

    render(
      <MockedProvider mocks={[mockStepDuplicate]}>
        <EditorProvider initialState={initialState}>
          <SnackbarProvider>
            <JourneyProvider value={{ journey }}>
              <DuplicateStep
                step={step}
                xPos={0}
                yPos={0}
                handleClick={handleClick}
              />
              <TestEditorState />
            </JourneyProvider>
          </SnackbarProvider>
        </EditorProvider>
      </MockedProvider>
    )

    const duplicateButton = screen.getByRole('menuitem', {
      name: 'Duplicate Card'
    })
    await waitFor(async () => await userEvent.click(duplicateButton))

    expect(screen.getByText('selectedStep: newStep.id')).toBeInTheDocument()
    expect(screen.getByText('Card Duplicated')).toBeInTheDocument()
    expect(handleClick).toHaveBeenCalled()
  })
})
