import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { EditorProvider, TreeBlock } from '@core/journeys/ui'
import {
  IconColor,
  IconName
} from '../../../../../../../__generated__/globalTypes'
import { IconFields } from '../../../../../../../__generated__/IconFields'
import { Color, ICON_BLOCK_COLOR_UPDATE } from './Color'

describe('Color', () => {
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
        iconBlockUpdate: {
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
                id: 'icon-id',
                input: {
                  color: IconColor.secondary
                }
              }
            },
            result
          }
        ]}
      >
        <EditorProvider>
          <Color iconBlock={icon} />
        </EditorProvider>
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Default' })).toHaveClass('Mui-selected')
    fireEvent.click(getByRole('button', { name: 'Secondary' }))
    await waitFor(() => expect(() => expect(result).toHaveBeenCalled()))
  })
})
