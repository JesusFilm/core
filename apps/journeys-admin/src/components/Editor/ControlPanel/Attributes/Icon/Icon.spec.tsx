import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { EditorProvider, TreeBlock } from '@core/journeys/ui'
import { IconName } from '../../../../../../__generated__/globalTypes'
import { IconFields } from '../../../../../../__generated__/IconFields'
import { GetJourney_journey_blocks_ButtonBlock as ButtonBlock } from '../../../../../../__generated__/GetJourney'
import { ICON_BLOCK_NAME_UPDATE } from './Icon'
import { Icon } from '.'

describe('Icon', () => {
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

  const selectedBlock: TreeBlock<ButtonBlock> = {
    __typename: 'ButtonBlock',
    id: 'id',
    parentBlockId: 'parentBlockId',
    parentOrder: 0,
    label: 'test button',
    buttonVariant: null,
    buttonColor: null,
    size: null,
    startIconId: null,
    endIconId: null,
    action: null,
    children: [icon]
  }

  it('shows toggle options if there is a icon', () => {
    const { getByText } = render(
      <MockedProvider>
        <EditorProvider initialState={{ selectedBlock }}>
          <Icon id={icon.id} />
        </EditorProvider>
      </MockedProvider>
    )
    expect(getByText('Color')).toBeInTheDocument()
  })

  it('hides toggle options if there is no icon ', () => {
    const testIcon = {
      ...icon,
      iconName: null
    }

    const testSelectedBlock = {
      ...selectedBlock,
      children: [testIcon]
    }

    const { queryByText } = render(
      <MockedProvider>
        <EditorProvider initialState={{ selectedBlock: testSelectedBlock }}>
          <Icon id={testIcon.id} />
        </EditorProvider>
      </MockedProvider>
    )
    expect(queryByText('Color')).not.toBeInTheDocument()
  })

  it('adds icon when selecting an icon', async () => {
    const testIcon = {
      ...icon,
      iconName: null
    }

    const testSelectedBlock = {
      ...selectedBlock,
      children: [testIcon]
    }

    const result = jest.fn(() => ({
      data: {
        iconBlockUpdate: {
          id: 'iconBlock.id',
          journeyId: 'journeyId',
          parentBlockId: 'buttonBlockId',
          name: IconName.ArrowForwardRounded,
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
                  name: IconName.ArrowForwardRounded
                }
              }
            },
            result
          }
        ]}
      >
        <EditorProvider initialState={{ selectedBlock: testSelectedBlock }}>
          <Icon id={testIcon.id} />
        </EditorProvider>
      </MockedProvider>
    )

    fireEvent.mouseDown(getByRole('button', { name: 'icon-name' }))
    fireEvent.click(getByRole('option', { name: 'Arrow Forward' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('removes icon when selecing the default option', async () => {
    const result = jest.fn(() => ({
      data: {
        iconBlockUpdate: {
          id: 'iconBlock.id',
          journeyId: 'journeyId',
          parentBlockId: 'buttonBlockId',
          name: null,
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
                  name: null
                }
              }
            },
            result
          }
        ]}
      >
        <EditorProvider initialState={{ selectedBlock }}>
          <Icon id={icon.id} />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.mouseDown(getByRole('button', { name: 'icon-name' }))
    fireEvent.click(getByRole('option', { name: 'Select an icon...' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('changes the icon when selecting a different icon', async () => {
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
          <Icon id={icon.id} />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.mouseDown(getByRole('button', { name: 'icon-name' }))
    fireEvent.click(getByRole('option', { name: 'Been Here' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })
})
