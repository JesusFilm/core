import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { EditorProvider, TreeBlock } from '@core/journeys/ui'
import { GetJourney_journey_blocks_ButtonBlock as ButtonBlock } from '../../../../../../../../../__generated__/GetJourney'
import {
  IconColor,
  IconName
} from '../../../../../../../../../__generated__/globalTypes'
import { IconFields } from '../../../../../../../../../__generated__/IconFields'
import { ICON_BLOCK_COLOR_UPDATE } from './ColorToggleGroup'
import { ColorToggleGroup } from '.'

describe('Button color selector', () => {
  const selectedBlock: TreeBlock<ButtonBlock> = {
    __typename: 'ButtonBlock',
    id: 'buttonBlockId',
    parentBlockId: 'parentBlockId',
    parentOrder: 0,
    label: 'test button',
    buttonVariant: null,
    buttonColor: null,
    size: null,
    startIconId: 'icon-id',
    endIconId: null,
    action: null,
    children: []
  }

  it('should change the icon color', async () => {
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

    const result = jest.fn(() => ({
      data: {
        iconBlockUodate: {
          id: 'icon-id',
          journeyId: 'journeyId',
          parentBlockId: 'buttonBlockId',
          name: IconName.ArrowForwardRounded,
          color: IconColor.secondary,
          size: null
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: ICON_BLOCK_COLOR_UPDATE,
              variables: {
                id: 'id',
                input: {
                  color: IconColor.secondary
                }
              }
            },
            result
          }
        ]}
      >
        <EditorProvider initialState={{ selectedBlock }}>
          <ColorToggleGroup iconBlock={icon} />
        </EditorProvider>
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Default' })).toHaveClass('Mui-selected')
    fireEvent.click(getByRole('button', { name: 'Secondary' }))
    await waitFor(() => expect(() => expect(result).toHaveBeenCalled()))
  })
})
