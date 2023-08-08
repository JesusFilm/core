import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_TextResponseBlock as TextResponseBlock
} from '../../../../../../../../../__generated__/GetJourney'

import { TEXT_RESPONSE_HINT_UPDATE } from './Hint'

import { Hint } from '.'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

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

const pageData: { journey: Journey; variant: 'default' | 'admin' | 'embed' } = {
  journey: { id: 'journey.id' } as unknown as Journey,
  variant: 'admin'
}

interface HintMockProps {
  mocks?: Array<MockedResponse<Record<string, unknown>>>
  initialState?: { selectedBlock: TreeBlock<TextResponseBlock> | undefined }
}

const HintMock = ({
  mocks = [],
  initialState = { selectedBlock: block }
}: HintMockProps): ReactElement => (
  <MockedProvider mocks={mocks} addTypename={false}>
    <JourneyProvider value={pageData}>
      <EditorProvider initialState={initialState}>
        <Hint />
      </EditorProvider>
    </JourneyProvider>
  </MockedProvider>
)

describe('Edit Hint field', () => {
  it('should display placeholder field if no selectedBlock', () => {
    const { getByRole } = render(
      <HintMock initialState={{ selectedBlock: undefined }} />
    )
    const field = getByRole('textbox', { name: 'Hint' })

    expect(field).toBeDisabled()
  })

  it('should display hint value', () => {
    const { getByRole } = render(<HintMock />)
    const field = getByRole('textbox', { name: 'Hint' })

    expect(field).toHaveValue('A hint message')
  })

  it('should not be able to type beyond max character limit', () => {
    const { getByRole } = render(<HintMock />)
    const field = getByRole('textbox', { name: 'Hint' })

    expect(field).toHaveAttribute('maxlength', '250')
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

    const { getByRole } = render(<HintMock mocks={[updateSuccess]} />)

    const field = getByRole('textbox', { name: 'Hint' })

    fireEvent.change(field, { target: { value: 'Updated hint' } })
    fireEvent.blur(field)

    await waitFor(() => {
      expect(result).toHaveBeenCalled()
    })
  })
})
