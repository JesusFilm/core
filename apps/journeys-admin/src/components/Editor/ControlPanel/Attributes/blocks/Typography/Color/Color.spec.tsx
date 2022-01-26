import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { TYPOGRAPHY_BLOCK_UPDATE } from './Color'
import { Color } from '.'

describe('Typography color selector', () => {
  it('should show typography color properties', () => {
    const { getByRole } = render(
      <MockedProvider>
        <Color id={'typography-color-id'} color={null} />
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Primary' })).toHaveClass('Mui-selected')
    expect(getByRole('button', { name: 'Secondary' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Error' })).toBeInTheDocument()
  })
  it('should change the color property', async () => {
    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: TYPOGRAPHY_BLOCK_UPDATE,
              variables: {
                id: 'typography-color-id',
                journeyId: undefined,
                input: {
                  color: 'secondary'
                }
              }
            },
            result: {
              data: {
                typographyBlockUpdate: {
                  id: 'typography-color-id',
                  color: 'secondary'
                }
              }
            }
          }
        ]}
      >
        <Color id={'typography-color-id'} color={null} />
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Primary' })).toHaveClass('Mui-selected')
    fireEvent.click(getByRole('button', { name: 'Secondary' }))
    await waitFor(() =>
      expect(getByRole('button', { name: 'Secondary' })).toHaveClass(
        'Mui-selected'
      )
    )
  })
})
