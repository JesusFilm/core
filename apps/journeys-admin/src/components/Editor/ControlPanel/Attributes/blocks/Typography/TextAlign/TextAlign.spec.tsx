import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { TypographyAlign } from '../../../../../../../../__generated__/globalTypes'
import { TYPOGRAPHY_BLOCK_UPDATE } from './TextAlign'
import { TextAlign } from '.'

describe('TextAlign drawer', () => {
  it('should show default values', () => {
    const { getByRole } = render(
      <MockedProvider>
        <TextAlign id={'text-align-id'} align={null} />
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Left' })).toHaveClass('Mui-selected')
    expect(getByRole('button', { name: 'Right' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Center' })).toBeInTheDocument()
  })
  it('should select the clicked button', async () => {
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
        <TextAlign id={'text-align-id'} align={TypographyAlign.center} />
      </MockedProvider>
    )

    expect(getByRole('button', { name: 'Center' })).toHaveClass('Mui-selected')
    fireEvent.click(getByRole('button', { name: 'Right' }))
    await waitFor(() =>
      expect(getByRole('button', { name: 'Right' })).toHaveClass('Mui-selected')
    )
  })
})
