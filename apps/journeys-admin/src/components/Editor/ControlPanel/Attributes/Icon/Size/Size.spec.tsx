import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { EditorProvider, TreeBlock } from '@core/journeys/ui'
import {
  IconSize,
  IconName
} from '../../../../../../../__generated__/globalTypes'
import { GetJourney_journey_blocks_ButtonBlock as ButtonBlock } from '../../../../../../../__generated__/GetJourney'
import { Size, ICON_BLOCK_SIZE_UPDATE } from './Size'

describe('Size', () => {
  it('should change the icon size', async () => {
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
      children: [
        {
          __typename: 'IconBlock',
          id: 'iconBlock.id',
          parentBlockId: null,
          parentOrder: null,
          iconName: IconName.ArrowForwardRounded,
          iconSize: null,
          iconColor: null,
          children: []
        }
      ]
    }

    const result = jest.fn(() => ({
      data: {
        iconBlockUpdate: {
          id: 'iconBlock.id',
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
                id: 'iconBlock.id',
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
          <Size id={'iconBlock.id'} size={IconSize.md} />
        </EditorProvider>
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Medium' })).toHaveClass('Mui-selected')
    fireEvent.click(getByRole('button', { name: 'Small' }))
    await waitFor(() => expect(() => expect(result).toHaveBeenCalled()))
  })
})
