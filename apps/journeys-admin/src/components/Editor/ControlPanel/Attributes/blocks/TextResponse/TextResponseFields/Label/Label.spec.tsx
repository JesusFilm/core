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
  label: 'Your answer',
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
  initialState?: { selectedBlock: TreeBlock<TextResponseBlock> | undefined }
}

const LabelMock = ({
  mocks = [],
  initialState = { selectedBlock: block }
}: LabelMockProps): ReactElement => (
  <MockedProvider mocks={mocks} addTypename={false}>
    <JourneyProvider value={pageData}>
      <EditorProvider initialState={initialState}>
        <Label />
      </EditorProvider>
    </JourneyProvider>
  </MockedProvider>
)

describe('Edit Label field', () => {
  it('should display placeholder field if no selectedBlock', () => {
    const { getByRole } = render(
      <LabelMock initialState={{ selectedBlock: undefined }} />
    )
    const field = getByRole('textbox', { name: 'Label' })

    expect(field).toBeDisabled()
  })

  it('should display label value', () => {
    const { getByRole } = render(<LabelMock />)
    const field = getByRole('textbox', { name: 'Label' })

    expect(field).toHaveValue('Your answer')
  })

  it('should not be able to type beyond max character limit', () => {
    const { getByRole } = render(<LabelMock />)
    const field = getByRole('textbox', { name: 'Label' })

    expect(field).toHaveAttribute('maxlength', '250')
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

    const field = getByRole('textbox', { name: 'Label' })

    fireEvent.change(field, { target: { value: 'Updated label' } })
    fireEvent.blur(field)

    await waitFor(() => {
      expect(result).toBeCalled()
    })
  })

  it('should set the default label on blur if none set', async () => {
    const result = jest.fn(() => ({
      data: {
        textResponseBlockUpdate: {
          id: block.id,
          journeyId: pageData.journey.id,
          label: 'Your answer here'
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
            label: 'Your answer here'
          }
        }
      },
      result
    }

    const { getByRole } = render(<LabelMock mocks={[updateSuccess]} />)

    const field = getByRole('textbox', { name: 'Label' })

    fireEvent.change(field, { target: { value: '' } })
    fireEvent.blur(field)

    await waitFor(() => {
      expect(result).toBeCalled()
    })
  })
})
