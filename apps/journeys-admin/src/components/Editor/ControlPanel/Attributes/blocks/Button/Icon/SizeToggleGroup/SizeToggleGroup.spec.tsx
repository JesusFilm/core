import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { EditorProvider, TreeBlock } from '@core/journeys/ui'
import { GetJourney_journey_blocks_ButtonBlock as ButtonBlock } from '../../../../../../../../../__generated__/GetJourney'
import {
  IconSize,
  IconName
} from '../../../../../../../../../__generated__/globalTypes'
import { IconFields } from '../../../../../../../../../__generated__/IconFields'
import { ICON_BLOCK_SIZE_UPDATE } from './SizeToggleGroup'
import { SizeToggleGroup } from '.'

describe('Button icon size selector', () => {
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

  it('should change the  icon size', async () => {
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
        iconBlockUpdate: {
          id: 'icon-id',
          journeyId: 'journeyId',
          parentBlockId: 'buttonBlockId',
          name: IconName.ArrowForwardRounded,
          color: null,
          size: IconSize.sm
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: ICON_BLOCK_SIZE_UPDATE,
              variables: {
                id: 'id',
                input: {
                  size: IconSize.sm
                }
              }
            },
            result
          }
        ]}
      >
        <EditorProvider initialState={{ selectedBlock }}>
          <SizeToggleGroup iconBlock={icon} />
        </EditorProvider>
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Medium' })).toHaveClass('Mui-selected')
    fireEvent.click(getByRole('button', { name: 'Small' }))
    await waitFor(() => expect(() => expect(result).toHaveBeenCalled()))
  })
})
