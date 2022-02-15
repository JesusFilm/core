import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { EditorProvider, TreeBlock } from '@core/journeys/ui'
import { GetJourney_journey_blocks_ButtonBlock as ButtonBlock } from '../../../../../../../../__generated__/GetJourney'
import { IconName } from '../../../../../../../../__generated__/globalTypes'
import { START_ICON_UPDATE, END_ICON_UPDATE } from './Icon'
import { Icon, IconType } from '.'

describe('Button Icon selector', () => {
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

  it('should open menu when an icon is selected', async () => {
    const { getByRole, getByText, queryByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: START_ICON_UPDATE,
              variables: {
                id: 'id',
                journeyId: undefined,
                input: {
                  startIcon: { name: IconName.ArrowForwardRounded }
                }
              }
            },
            result: {
              data: {
                buttonBlockUpdate: {
                  id: 'id',
                  startIcon: { name: IconName.ArrowForwardRounded }
                }
              }
            }
          }
        ]}
      >
        <EditorProvider initialState={{ selectedBlock }}>
          <Icon iconType={IconType.start} />
        </EditorProvider>
      </MockedProvider>
    )

    expect(queryByText('Color')).not.toBeInTheDocument()
    expect(queryByText('Size')).not.toBeInTheDocument()

    fireEvent.mouseDown(getByRole('button', { name: 'icon-name-select' }))
    fireEvent.click(getByRole('option', { name: 'Arrow Forward' }))

    await waitFor(() => expect(getByText('Color')).toBeInTheDocument())
    await waitFor(() => expect(getByText('Size')).toBeInTheDocument())
  })

  it('should change the start icon', async () => {
    const result = jest.fn(() => ({
      data: {
        buttonBlockUpdate: {
          id: 'id',
          startIcon: { name: IconName.ArrowForwardRounded }
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: START_ICON_UPDATE,
              variables: {
                id: 'id',
                journeyId: undefined,
                input: {
                  startIcon: { name: IconName.ArrowForwardRounded }
                }
              }
            },
            result
          }
        ]}
      >
        <EditorProvider initialState={{ selectedBlock }}>
          <Icon iconType={IconType.start} />
        </EditorProvider>
      </MockedProvider>
    )

    fireEvent.mouseDown(getByRole('button', { name: 'icon-name-select' }))
    await waitFor(() => expect(() => expect(result).toHaveBeenCalled()))
  })

  it('should change the end icon', async () => {
    const result = jest.fn(() => ({
      data: {
        buttonBlockUpdate: {
          id: 'id',
          endIcon: { name: IconName.ArrowForwardRounded }
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: END_ICON_UPDATE,
              variables: {
                id: 'id',
                journeyId: undefined,
                input: {
                  endIcon: { name: IconName.ArrowForwardRounded }
                }
              }
            },
            result
          }
        ]}
      >
        <EditorProvider initialState={{ selectedBlock }}>
          <Icon iconType={IconType.end} />
        </EditorProvider>
      </MockedProvider>
    )

    fireEvent.mouseDown(getByRole('button', { name: 'icon-name-select' }))
    await waitFor(() => expect(() => expect(result).toHaveBeenCalled()))
  })
})
