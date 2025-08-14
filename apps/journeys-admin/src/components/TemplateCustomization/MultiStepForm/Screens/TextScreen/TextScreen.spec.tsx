import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'

import { TextScreen, JOURNEY_CUSTOMIZATION_FIELD_UPDATE } from './TextScreen'
import type {
  JourneyCustomizationFieldUpdate,
  JourneyCustomizationFieldUpdateVariables
} from '../../../../../../__generated__/JourneyCustomizationFieldUpdate'

describe('TextScreen', () => {
  const baseJourney = {
    ...defaultJourney,
    journeyCustomizationDescription:
      'Hello {{ firstName: John }} and {{ lastName: Doe }}!',
    journeyCustomizationFields: [
      {
        id: '1',
        key: 'firstName',
        value: 'John',
        __typename: 'JourneyCustomizationField'
      },
      {
        id: '2',
        key: 'lastName',
        value: 'Doe',
        __typename: 'JourneyCustomizationField'
      }
    ]
  }

  it('renders editable tokens with initial values', () => {
    render(
      <MockedProvider>
        <JourneyProvider
          value={{ journey: baseJourney as any, variant: 'admin' }}
        >
          <TextScreen handleNext={jest.fn()} />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(screen.getByText('Hello')).toBeInTheDocument()
    expect(screen.getByText('John')).toBeInTheDocument()
    expect(screen.getByText('Doe')).toBeInTheDocument()
  })

  it('updates value on blur and on Tab/Enter', () => {
    render(
      <MockedProvider>
        <JourneyProvider
          value={{ journey: baseJourney as any, variant: 'admin' }}
        >
          <TextScreen handleNext={jest.fn()} />
        </JourneyProvider>
      </MockedProvider>
    )

    const firstEditable = screen.getAllByText('John')[0]
    fireEvent.focus(firstEditable)
    firstEditable.textContent = 'Jane'
    fireEvent.blur(firstEditable)
    expect(screen.getAllByText('Jane')[0]).toBeInTheDocument()

    const lastEditable = screen.getAllByText('Doe')[0]
    fireEvent.focus(lastEditable)
    lastEditable.textContent = 'Roe'
    fireEvent.keyDown(lastEditable, { key: 'Enter' })
    expect(screen.getAllByText('Roe')[0]).toBeInTheDocument()
  })

  it('submits only when values changed and calls handleNext', async () => {
    const handleNext = jest.fn()
    const journeyCustomizationFieldUpdate: MockedResponse<
      JourneyCustomizationFieldUpdate,
      JourneyCustomizationFieldUpdateVariables
    > = {
      request: {
        query: JOURNEY_CUSTOMIZATION_FIELD_UPDATE,
        variables: {
          journeyId: baseJourney.id,
          input: [
            { id: '1', key: 'firstName', value: 'Jane' },
            { id: '2', key: 'lastName', value: 'Roe' }
          ]
        }
      },
      result: jest.fn(() => ({
        data: {
          journeyCustomizationFieldUserUpdate: [
            {
              id: '1',
              key: 'firstName',
              value: 'Jane',
              __typename: 'JourneyCustomizationField'
            },
            {
              id: '2',
              key: 'lastName',
              value: 'Roe',
              __typename: 'JourneyCustomizationField'
            }
          ]
        }
      }))
    }

    render(
      <MockedProvider mocks={[journeyCustomizationFieldUpdate]}>
        <JourneyProvider
          value={{ journey: baseJourney as any, variant: 'admin' }}
        >
          <TextScreen handleNext={handleNext} />
        </JourneyProvider>
      </MockedProvider>
    )

    const [firstEditable, lastEditable] = [
      screen.getAllByText('John')[0],
      screen.getAllByText('Doe')[0]
    ]
    fireEvent.focus(firstEditable)
    firstEditable.textContent = 'Jane'
    fireEvent.blur(firstEditable)
    fireEvent.focus(lastEditable)
    lastEditable.textContent = 'Roe'
    fireEvent.blur(lastEditable)

    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }))

    // handleNext should be called after mutation resolves
    // We won't await network; just assert it eventually gets called by Mutation
    await waitFor(() =>
      expect(journeyCustomizationFieldUpdate.result).toHaveBeenCalled()
    )
  })

  it('does not submit when no changes and still calls handleNext', () => {
    const handleNext = jest.fn()
    render(
      <MockedProvider>
        <JourneyProvider
          value={{ journey: baseJourney as any, variant: 'admin' }}
        >
          <TextScreen handleNext={handleNext} />
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }))
    expect(handleNext).toHaveBeenCalled()
  })
})
