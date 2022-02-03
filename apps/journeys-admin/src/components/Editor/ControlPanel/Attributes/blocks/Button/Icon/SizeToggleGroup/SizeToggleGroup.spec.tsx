import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { EditorProvider, TreeBlock } from '@core/journeys/ui'
import { GetJourney_journey_blocks_ButtonBlock as ButtonBlock } from '../../../../../../../../../__generated__/GetJourney'
import { IconSize } from '../../../../../../../../../__generated__/globalTypes'
import { IconType } from '..'
import {
  BUTTON_START_ICON_SIZE_UPDATE,
  BUTTON_END_ICON_SIZE_UPDATE
} from './SizeToggleGroup'
import { SizeToggleGroup } from '.'

describe('Button icon size selector', () => {
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
  it('should show icon size properties', () => {
    const { getByRole } = render(
      <MockedProvider>
        <EditorProvider initialState={{ selectedBlock }}>
          <SizeToggleGroup type={IconType.start} />
        </EditorProvider>
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Default' })).toHaveClass('Mui-selected')
    expect(getByRole('button', { name: 'Medium' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Large' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Small' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Extra Large' })).toBeInTheDocument()
  })
  it('should change the start icon size property', async () => {
    const result = jest.fn(() => ({
      data: {
        buttonBlockUpdate: {
          id: 'id',
          startIcon: { size: IconSize.sm }
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: BUTTON_START_ICON_SIZE_UPDATE,
              variables: {
                id: 'id',
                journeyId: undefined,
                input: {
                  startIcon: {
                    size: IconSize.sm
                  }
                }
              }
            },
            result
          }
        ]}
      >
        <EditorProvider initialState={{ selectedBlock }}>
          <SizeToggleGroup type={IconType.start} />
        </EditorProvider>
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Default' })).toHaveClass('Mui-selected')
    fireEvent.click(getByRole('button', { name: 'Small' }))
    await waitFor(() => expect(() => expect(result).toHaveBeenCalled()))
  })

  it('should change the end icon size property', async () => {
    const result = jest.fn(() => ({
      data: {
        buttonBlockUpdate: {
          id: 'id',
          endIcon: { size: IconSize.sm }
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: BUTTON_END_ICON_SIZE_UPDATE,
              variables: {
                id: 'id',
                journeyId: undefined,
                input: {
                  endIcon: {
                    size: IconSize.sm
                  }
                }
              }
            },
            result
          }
        ]}
      >
        <EditorProvider initialState={{ selectedBlock }}>
          <SizeToggleGroup type={IconType.end} />
        </EditorProvider>
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Default' })).toHaveClass('Mui-selected')
    fireEvent.click(getByRole('button', { name: 'Small' }))
    await waitFor(() => expect(() => expect(result).toHaveBeenCalled()))
  })
})
