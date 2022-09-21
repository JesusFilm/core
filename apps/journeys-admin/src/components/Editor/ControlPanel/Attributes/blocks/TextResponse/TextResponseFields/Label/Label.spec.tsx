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
import { TEXT_RESPONSE_LABEL_UPDATE } from './Label'
import { Label } from '.'

const block: TreeBlock<TextResponseBlock> = {
  __typename: 'TextResponseBlock',
  id: 'textResponse0.id',
  parentBlockId: '0',
  parentOrder: 0,
  label: 'Your answer here',
  hint: null,
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
        <Label />
      </EditorProvider>
    </JourneyProvider>
  </MockedProvider>
)

describe('Edit Label field', () => {
  it('should display label value', () => {
    const { getByRole } = render(<LabelMock />)
    const labelField = getByRole('textbox', { name: 'Label' })

    expect(labelField).toHaveValue('Your answer here')
  })

  it('should display max label length', () => {
    const { getByRole } = render(<LabelMock />)
    const labelField = getByRole('textbox', { name: 'Label' })

    expect(labelField).toHaveAccessibleDescription('Can only be 16 characters')
  })

  it('should not be able to type beyond max character limit', () => {
    const { getByRole } = render(<LabelMock />)
    const labelField = getByRole('textbox', { name: 'Label' })

    expect(labelField).toHaveAttribute('maxlength', '16')
  })

  it('should update the label on blur', async () => {
    const result = jest.fn(() => ({
      data: {
        textResponseBlockUpdate: {
          id: block.id,
          journeyId: pageData.journey.id,
          label: 'Updated label'
        }
      }
    }))

    const updateSuccess = {
      request: {
        query: TEXT_RESPONSE_LABEL_UPDATE,
        variables: {
          id: block.id,
          journeyId: pageData.journey.id,
          input: {
            label: 'Updated label'
          }
        }
      },
      result
    }

    const { getByRole } = render(<LabelMock mocks={[updateSuccess]} />)

    const labelField = getByRole('textbox', { name: 'Label' })

    fireEvent.change(labelField, { target: { value: 'Updated label' } })
    fireEvent.blur(labelField)

    await waitFor(() => {
      expect(result).toBeCalled()
    })
  })
})
