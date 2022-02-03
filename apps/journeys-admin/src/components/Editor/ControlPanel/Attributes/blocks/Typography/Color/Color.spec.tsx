import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { EditorProvider, TreeBlock } from '@core/journeys/ui'
import { GetJourney_journey_blocks_TypographyBlock as TypographyBlock } from '../../../../../../../../__generated__/GetJourney'
import { TypographyColor } from '../../../../../../../../__generated__/globalTypes'
import { TYPOGRAPHY_BLOCK_UPDATE_COLOR } from './Color'
import { Color } from '.'

describe('Typography color selector', () => {
  it('should show typography color properties', () => {
    const selectedBlock: TreeBlock<TypographyBlock> = {
      __typename: 'TypographyBlock',
      id: 'id',
      parentBlockId: 'parentBlockId',
      parentOrder: 0,
      align: null,
      color: null,
      content: '',
      variant: null,
      children: []
    }
    const { getByRole } = render(
      <MockedProvider>
        <EditorProvider initialState={{ selectedBlock }}>
          <Color />
        </EditorProvider>
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Primary' })).toHaveClass('Mui-selected')
    expect(getByRole('button', { name: 'Secondary' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Error' })).toBeInTheDocument()
  })

  it('should change the color property', async () => {
    const selectedBlock: TreeBlock<TypographyBlock> = {
      __typename: 'TypographyBlock',
      id: 'id',
      parentBlockId: 'parentBlockId',
      parentOrder: 0,
      align: null,
      color: TypographyColor.error,
      content: '',
      variant: null,
      children: []
    }
    const result = jest.fn(() => ({
      data: {
        typographyBlockUpdate: {
          id: 'id',
          color: TypographyColor.secondary
        }
      }
    }))
    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: TYPOGRAPHY_BLOCK_UPDATE_COLOR,
              variables: {
                id: 'id',
                journeyId: undefined,
                input: {
                  color: TypographyColor.secondary
                }
              }
            },
            result
          }
        ]}
      >
        <EditorProvider initialState={{ selectedBlock }}>
          <Color />
        </EditorProvider>
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Error' })).toHaveClass('Mui-selected')
    fireEvent.click(getByRole('button', { name: 'Secondary' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })
})
