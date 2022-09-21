import { ReactElement } from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import type { TreeBlock } from '@core/journeys/ui/block'
import {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_TextResponseBlock as TextResponseBlock
} from '../../../../../../../../../__generated__/GetJourney'
import { TEXT_RESPONSE_HINT_UPDATE } from './Hint'
import { Hint } from '.'

const block: TreeBlock<TextResponseBlock> = {
  __typename: 'TextResponseBlock',
  id: 'textResponse0.id',
  parentBlockId: '0',
  parentOrder: 0,
  label: 'Your answer here',
  hint: 'A hint message',
  minRows: null,
  submitIconId: null,
  submitLabel: null,
  action: {
    __typename: 'LinkAction',
    parentBlockId: 'textResponse0.id',
    gtmEventName: 'textResponse',
    url: '#'
  },
  children: []
}

const pageData = { journey: { id: 'journey.id' } as unknown as Journey }

interface LabelMockProps {
  mocks?: Array<MockedResponse<Record<string, unknown>>>
}

const LabelMock = ({ mocks = [] }: LabelMockProps): ReactElement => (
  <MockedProvider mocks={mocks} addTypename={false}>
    <JourneyProvider value={pageData}>
      <EditorProvider
        initialState={{
          selectedBlock: block
        }}
      >
        <Hint />
      </EditorProvider>
    </JourneyProvider>
  </MockedProvider>
)

describe('Edit Hint field', () => {
  it('should display hint value', () => {
    const { getByRole } = render(<LabelMock />)
    const hintField = getByRole('textbox', { name: 'Hint' })

    expect(hintField).toHaveValue('A hint message')
  })

  it('should display max hint length', () => {
    const { getByRole } = render(<LabelMock />)
    const hintField = getByRole('textbox', { name: 'Hint' })

    expect(hintField).toHaveAccessibleDescription('Can only be 22 characters')
  })

  it('should not be able to type beyond max character limit', () => {
    const { getByRole } = render(<LabelMock />)
    const hintField = getByRole('textbox', { name: 'Hint' })

    expect(hintField).toHaveAttribute('maxlength', '22')
  })

  it('should update the hint on blur', async () => {
    const result = jest.fn(() => ({
      data: {
        textResponseBlockUpdate: {
          id: block.id,
          journeyId: pageData.journey.id,
          hint: 'Updated hint'
        }
      }
    }))

    const updateSuccess = {
      request: {
        query: TEXT_RESPONSE_HINT_UPDATE,
        variables: {
          id: block.id,
          journeyId: pageData.journey.id,
          input: {
            hint: 'Updated hint'
          }
        }
      },
      result
    }

    const { getByRole } = render(<LabelMock mocks={[updateSuccess]} />)

    const hintField = getByRole('textbox', { name: 'Hint' })

    fireEvent.change(hintField, { target: { value: 'Updated hint' } })
    fireEvent.blur(hintField)

    await waitFor(() => {
      expect(result).toBeCalled()
    })
  })
})
