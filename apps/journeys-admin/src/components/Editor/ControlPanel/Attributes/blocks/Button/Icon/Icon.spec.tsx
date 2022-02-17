import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { EditorProvider, TreeBlock } from '@core/journeys/ui'
import { GetJourney_journey_blocks_ButtonBlock as ButtonBlock } from '../../../../../../../../__generated__/GetJourney'
import { IconName } from '../../../../../../../../__generated__/globalTypes'
import { IconFields } from '../../../../../../../../__generated__/IconFields'
import {
  ICON_BLOCK_CREATE,
  ICON_BLOCK_NAME_UPDATE,
  BUTTON_BLOCK_ICON_UPDATE
} from './Icon'
import { Icon } from '.'

describe('Icon', () => {
  it('shows color and size props if there is a iconBlock', () => {
    const icon: TreeBlock<IconFields> = {
      id: 'icon-id',
      parentBlockId: 'buttonBlockId',
      parentOrder: null,
      __typename: 'IconBlock',
      iconName: IconName.ArrowForwardRounded,
      iconSize: null,
      iconColor: null,
      children: []
    }
    const { getByText } = render(
      <MockedProvider>
        <Icon iconBlock={icon} type={'start'} />
      </MockedProvider>
    )
    expect(getByText('Color')).toBeInTheDocument()
    expect(getByText('Size')).toBeInTheDocument()
  })

  it('hides color and size propsif there is no iconBlock', () => {
    const { queryByText } = render(
      <MockedProvider>
        <Icon type={'start'} />
      </MockedProvider>
    )
    expect(queryByText('Color')).not.toBeInTheDocument()
    expect(queryByText('Size')).not.toBeInTheDocument()
  })

  it('creates the start icon', async () => {
    const selectedBlock: TreeBlock<ButtonBlock> = {
      __typename: 'ButtonBlock',
      id: 'buttonBlockId',
      parentBlockId: 'parentBlockId',
      parentOrder: 0,
      label: 'test button',
      buttonVariant: null,
      buttonColor: null,
      size: null,
      startIconId: null,
      endIconId: null,
      action: null,
      children: []
    }

    const iconCreateResult = jest.fn(() => ({
      data: {
        iconBlockCreate: {
          id: 'iconBlock.id',
          journeyId: 'journeyId',
          parentBlockId: 'buttonBlockId',
          name: IconName.ArrowForwardRounded,
          color: null,
          size: null
        }
      }
    }))

    const buttonUpdateResult = jest.fn(() => ({
      data: {
        buttonBlockUpdate: {
          id: 'buttonBlockId',
          journeyId: 'journeyId',
          startIconId: 'iconBlock.id',
          endIconId: null
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: ICON_BLOCK_CREATE,
              variables: {
                input: {
                  parentBlockId: selectedBlock.id,
                  name: IconName.ArrowForwardRounded
                }
              }
            },
            result: iconCreateResult
          },
          {
            request: {
              query: BUTTON_BLOCK_ICON_UPDATE,
              variables: {
                id: selectedBlock.id,
                input: {
                  startIconId: 'iconBlock.id',
                  endIconId: null
                }
              }
            },
            result: buttonUpdateResult
          }
        ]}
      >
        <EditorProvider initialState={{ selectedBlock }}>
          <Icon type={'start'} />
        </EditorProvider>
      </MockedProvider>
    )

    fireEvent.mouseDown(getByRole('button', { name: 'icon-name-select' }))
    fireEvent.click(getByRole('option', { name: 'Arrow Forward' }))
    await waitFor(() => expect(iconCreateResult).toHaveBeenCalled())
    await waitFor(() => expect(buttonUpdateResult).toHaveBeenCalled())
  })

  it('creates the end icon', async () => {
    const selectedBlock: TreeBlock<ButtonBlock> = {
      __typename: 'ButtonBlock',
      id: 'buttonBlockId',
      parentBlockId: 'parentBlockId',
      parentOrder: 0,
      label: 'test button',
      buttonVariant: null,
      buttonColor: null,
      size: null,
      startIconId: null,
      endIconId: null,
      action: null,
      children: []
    }

    const iconCreateResult = jest.fn(() => ({
      data: {
        iconBlockCreate: {
          id: 'iconBlock.id',
          journeyId: 'journeyId',
          parentBlockId: 'buttonBlockId',
          name: IconName.ArrowForwardRounded,
          color: null,
          size: null
        }
      }
    }))

    const buttonUpdateResult = jest.fn(() => ({
      data: {
        buttonBlockUpdate: {
          id: 'buttonBlockId',
          journeyId: 'journeyId',
          startIconId: null,
          endIconId: 'iconBlock.id'
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: ICON_BLOCK_CREATE,
              variables: {
                input: {
                  parentBlockId: selectedBlock.id,
                  name: IconName.ArrowForwardRounded
                }
              }
            },
            result: iconCreateResult
          },
          {
            request: {
              query: BUTTON_BLOCK_ICON_UPDATE,
              variables: {
                id: selectedBlock.id,
                input: {
                  startIconId: null,
                  endIconId: 'iconBlock.id'
                }
              }
            },
            result: buttonUpdateResult
          }
        ]}
      >
        <EditorProvider initialState={{ selectedBlock }}>
          <Icon type={'end'} />
        </EditorProvider>
      </MockedProvider>
    )

    fireEvent.mouseDown(getByRole('button', { name: 'icon-name-select' }))
    fireEvent.click(getByRole('option', { name: 'Arrow Forward' }))
    await waitFor(() => expect(iconCreateResult).toHaveBeenCalled())
    await waitFor(() => expect(buttonUpdateResult).toHaveBeenCalled())
  })

  it('deletes the start icon', async () => {
    const selectedBlock: TreeBlock<ButtonBlock> = {
      __typename: 'ButtonBlock',
      id: 'buttonBlockId',
      parentBlockId: 'parentBlockId',
      parentOrder: 0,
      label: 'test button',
      buttonVariant: null,
      buttonColor: null,
      size: null,
      startIconId: 'iconBlock.id',
      endIconId: null,
      action: null,
      children: []
    }

    const icon: TreeBlock<IconFields> = {
      id: 'iconBlock.id',
      parentBlockId: 'buttonBlockId',
      parentOrder: null,
      __typename: 'IconBlock',
      iconName: IconName.ArrowForwardRounded,
      iconSize: null,
      iconColor: null,
      children: []
    }

    const buttonUpdateResult = jest.fn(() => ({
      data: {
        buttonBlockUpdate: {
          id: 'buttonBlockId',
          journeyId: 'journeyId',
          startIconId: null,
          endIconId: null
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: BUTTON_BLOCK_ICON_UPDATE,
              variables: {
                id: selectedBlock.id,
                input: {
                  startIconId: null,
                  endIconId: null
                }
              }
            },
            result: buttonUpdateResult
          }
        ]}
      >
        <EditorProvider initialState={{ selectedBlock }}>
          <Icon iconBlock={icon} type={'start'} />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.mouseDown(getByRole('button', { name: 'icon-name-select' }))
    fireEvent.click(getByRole('option', { name: 'Select an icon...' }))
    await waitFor(() => expect(buttonUpdateResult).toHaveBeenCalled())
  })

  it('deletes the end icon', async () => {
    const selectedBlock: TreeBlock<ButtonBlock> = {
      __typename: 'ButtonBlock',
      id: 'buttonBlockId',
      parentBlockId: 'parentBlockId',
      parentOrder: 0,
      label: 'test button',
      buttonVariant: null,
      buttonColor: null,
      size: null,
      startIconId: null,
      endIconId: 'iconBlock.id',
      action: null,
      children: []
    }

    const icon: TreeBlock<IconFields> = {
      id: 'iconBlock.id',
      parentBlockId: 'buttonBlockId',
      parentOrder: null,
      __typename: 'IconBlock',
      iconName: IconName.ArrowForwardRounded,
      iconSize: null,
      iconColor: null,
      children: []
    }

    const buttonUpdateResult = jest.fn(() => ({
      data: {
        buttonBlockUpdate: {
          id: 'buttonBlockId',
          journeyId: 'journeyId',
          startIconId: null,
          endIconId: null
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: BUTTON_BLOCK_ICON_UPDATE,
              variables: {
                id: selectedBlock.id,
                input: {
                  startIconId: null,
                  endIconId: null
                }
              }
            },
            result: buttonUpdateResult
          }
        ]}
      >
        <EditorProvider initialState={{ selectedBlock }}>
          <Icon iconBlock={icon} type={'end'} />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.mouseDown(getByRole('button', { name: 'icon-name-select' }))
    fireEvent.click(getByRole('option', { name: 'Select an icon...' }))
    await waitFor(() => expect(buttonUpdateResult).toHaveBeenCalled())
  })

  it('changes the icon', async () => {
    const selectedBlock: TreeBlock<ButtonBlock> = {
      __typename: 'ButtonBlock',
      id: 'buttonBlockId',
      parentBlockId: 'parentBlockId',
      parentOrder: 0,
      label: 'test button',
      buttonVariant: null,
      buttonColor: null,
      size: null,
      startIconId: 'iconBlock.id',
      endIconId: null,
      action: null,
      children: []
    }

    const icon: TreeBlock<IconFields> = {
      id: 'iconBlock.id',
      parentBlockId: 'buttonBlockId',
      parentOrder: null,
      __typename: 'IconBlock',
      iconName: IconName.ArrowForwardRounded,
      iconSize: null,
      iconColor: null,
      children: []
    }

    const result = jest.fn(() => ({
      data: {
        iconBlockUpdate: {
          id: 'iconBlock.id',
          journeyId: 'journeyId',
          parentBlockId: 'buttonBlockId',
          name: IconName.BeenhereRounded,
          color: null,
          size: null
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: ICON_BLOCK_NAME_UPDATE,
              variables: {
                id: icon.id,
                input: {
                  name: IconName.BeenhereRounded
                }
              }
            },
            result
          }
        ]}
      >
        <EditorProvider initialState={{ selectedBlock }}>
          <Icon iconBlock={icon} type={'start'} />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.mouseDown(getByRole('button', { name: 'icon-name-select' }))
    fireEvent.click(getByRole('option', { name: 'Been Here' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })
})
