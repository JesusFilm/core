import { ApolloLink } from '@apollo/client'
import { MockLink, MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import DebounceLink from 'apollo-link-debounce'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../../../../../__generated__/GetJourney'
import { MultiselectOptionFields } from '../../../../../../../../__generated__/MultiselectOptionFields'
import { CommandRedoItem } from '../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../Toolbar/Items/CommandUndoItem'

import { MULTISELECT_OPTION_BLOCK_UPDATE, MultiselectOptionEdit } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('MultiselectOptionEdit', () => {
  const props: TreeBlock<MultiselectOptionFields> = {
    __typename: 'MultiselectOptionBlock',
    id: 'option.id',
    label: 'test label',
    parentBlockId: 'card',
    parentOrder: 0,
    children: []
  }

  const mockOptionUpdate1 = {
    request: {
      query: MULTISELECT_OPTION_BLOCK_UPDATE,
      variables: {
        id: 'option.id',
        input: {
          label: 'new label'
        }
      }
    },
    result: jest.fn(() => ({
      data: {
        multiselectOptionBlockUpdate: {
          __typename: 'MultiselectOptionBlock',
          id: 'option.id',
          label: 'new label'
        }
      }
    }))
  }

  const mockOptionUpdate2 = {
    request: {
      query: MULTISELECT_OPTION_BLOCK_UPDATE,
      variables: {
        id: 'option.id',
        input: {
          label: 'test label'
        }
      }
    },
    result: jest.fn(() => ({
      data: {
        multiselectOptionBlockUpdate: {
          __typename: 'MultiselectOptionBlock',
          id: 'option.id',
          label: 'test label'
        }
      }
    }))
  }

  const mockJourney: Journey = {
    id: 'journeyId',
    template: false
  } as unknown as Journey

  beforeEach(() => jest.clearAllMocks())

  it('selects the input on click', () => {
    render(
      <MockedProvider>
        <MultiselectOptionEdit {...props} />
      </MockedProvider>
    )
    const input = screen.getByRole('textbox')
    fireEvent.click(input)
    expect(input).toHaveFocus()
    expect(input).toHaveAttribute('placeholder', 'Add your text here...')
  })

  it('should undo the label change', async () => {
    const link = ApolloLink.from([
      new DebounceLink(500),
      new MockLink([mockOptionUpdate1, mockOptionUpdate2])
    ])

    render(
      <MockedProvider link={link}>
        <JourneyProvider value={{ journey: mockJourney, variant: 'admin' }}>
          <EditorProvider>
            <CommandUndoItem variant="button" />
            <MultiselectOptionEdit {...props} />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    const input = screen.getByRole('textbox', { name: '' })
    await userEvent.type(input, 'new label', { skipClick: true })
    await waitFor(() => expect(mockOptionUpdate1.result).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(mockOptionUpdate2.result).toHaveBeenCalled())
  })

  it('should redo the change to label that was undone', async () => {
    const redoUpdateMock = {
      ...mockOptionUpdate1,
      result: jest.fn(() => ({
        data: {
          multiselectOptionBlockUpdate: {
            __typename: 'MultiselectOptionBlock',
            id: 'option.id',
            label: 'new label'
          }
        }
      }))
    }

    const link = ApolloLink.from([
      new DebounceLink(500),
      new MockLink([mockOptionUpdate1, mockOptionUpdate2, redoUpdateMock])
    ])

    render(
      <MockedProvider link={link}>
        <JourneyProvider value={{ journey: mockJourney, variant: 'admin' }}>
          <EditorProvider>
            <CommandUndoItem variant="button" />
            <CommandRedoItem variant="button" />
            <MultiselectOptionEdit {...props} />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    const input = screen.getByRole('textbox', { name: '' })
    await userEvent.type(input, 'new label', { skipClick: true })
    await waitFor(() => expect(mockOptionUpdate1.result).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(mockOptionUpdate2.result).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(redoUpdateMock.result).toHaveBeenCalledTimes(1))
  })

  it('should not save if label hasnt changed', async () => {
    const link = ApolloLink.from([
      new DebounceLink(500),
      new MockLink([mockOptionUpdate2])
    ])

    render(
      <MockedProvider link={link}>
        <JourneyProvider value={{ journey: mockJourney, variant: 'admin' }}>
          <EditorProvider>
            <MultiselectOptionEdit {...props} />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    const input = screen.getByRole('textbox', { name: '' })
    await userEvent.type(input, 'test label')
    await waitFor(() => expect(mockOptionUpdate2.result).not.toHaveBeenCalled())
  })
})
