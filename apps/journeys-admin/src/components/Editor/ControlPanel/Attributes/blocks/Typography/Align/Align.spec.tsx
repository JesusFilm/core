import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { TypographyAlign } from '../../../../../../../../__generated__/globalTypes'
import { TYPOGRAPHY_BLOCK_UPDATE } from './Align'
import { Align } from '.'

describe('Typography align selector', () => {
  it('should show typography align properties', () => {
    const { getByRole } = render(
      <MockedProvider>
        <Align id={'text-align-id'} align={null} />
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Left' })).toHaveClass('Mui-selected')
    expect(getByRole('button', { name: 'Right' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Center' })).toBeInTheDocument()
  })
  it('should change the align property', async () => {
    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: TYPOGRAPHY_BLOCK_UPDATE,
              variables: {
                id: 'text-align-id',
                journeyId: undefined,
                input: {
                  align: 'right'
                }
              }
            },
            result: {
              data: {
                typographyBlockUpdate: {
                  id: 'text-align-id',
                  align: 'right'
                }
              }
            }
          }
        ]}
      >
        <Align id={'text-align-id'} align={TypographyAlign.center} />
      </MockedProvider>
    )

    expect(getByRole('button', { name: 'Center' })).toHaveClass('Mui-selected')
    fireEvent.click(getByRole('button', { name: 'Right' }))
    await waitFor(() =>
      expect(getByRole('button', { name: 'Right' })).toHaveClass('Mui-selected')
    )
  })
})
