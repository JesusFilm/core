import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { EditorProvider, TreeBlock } from '@core/journeys/ui'
import { GetJourney_journey_blocks_ButtonBlock as ButtonBlock } from '../../../../../../../../../__generated__/GetJourney'
import { ButtonColor } from '../../../../../../../../../__generated__/globalTypes'
import { IconType } from '..'
import {
  BUTTON_START_ICON_COLOR_UPDATE,
  BUTTON_END_ICON_COLOR_UPDATE
} from './ColorToggleGroup'
import { ColorToggleGroup } from '.'

describe('Button color selector', () => {
  const selectedBlock: TreeBlock<ButtonBlock> = {
    __typename: 'ButtonBlock',
    id: 'id',
    parentBlockId: 'parentBlockId',
    parentOrder: 0,
    label: 'test button',
    buttonVariant: null,
    buttonColor: null,
    size: null,
    startIcon: null,
    endIcon: null,
    action: null,
    children: []
  }
  it('should show button color properties', () => {
    const { getByRole } = render(
      <MockedProvider>
        <EditorProvider initialState={{ selectedBlock }}>
          <ColorToggleGroup type={IconType.start} />
        </EditorProvider>
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Default' })).toHaveClass('Mui-selected')
    expect(getByRole('button', { name: 'Primary' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Secondary' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Error' })).toBeInTheDocument()
  })

  it('should change the start icon color property', async () => {
    const result = jest.fn(() => ({
      data: {
        buttonBlockUpdate: {
          id: 'id',
          startIcon: { color: ButtonColor.secondary }
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: BUTTON_START_ICON_COLOR_UPDATE,
              variables: {
                id: 'id',
                journeyId: undefined,
                input: {
                  startIcon: {
                    color: ButtonColor.secondary
                  }
                }
              }
            },
            result
          }
        ]}
      >
        <EditorProvider initialState={{ selectedBlock }}>
          <ColorToggleGroup type={IconType.start} />
        </EditorProvider>
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Default' })).toHaveClass('Mui-selected')
    fireEvent.click(getByRole('button', { name: 'Secondary' }))
    await waitFor(() => expect(() => expect(result).toHaveBeenCalled()))
  })

  it('should change the end icon color property', async () => {
    const result = jest.fn(() => ({
      data: {
        buttonBlockUpdate: {
          id: 'id',
          endIcon: { color: ButtonColor.secondary }
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: BUTTON_END_ICON_COLOR_UPDATE,
              variables: {
                id: 'id',
                journeyId: undefined,
                input: {
                  endIcon: {
                    color: ButtonColor.secondary
                  }
                }
              }
            },
            result
          }
        ]}
      >
        <EditorProvider initialState={{ selectedBlock }}>
          <ColorToggleGroup type={IconType.end} />
        </EditorProvider>
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Default' })).toHaveClass('Mui-selected')
    fireEvent.click(getByRole('button', { name: 'Secondary' }))
    await waitFor(() => expect(() => expect(result).toHaveBeenCalled()))
  })
})
