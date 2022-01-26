import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { TYPOGRAPHY_BLOCK_UPDATE } from './Variant'
import { Variant } from '.'

describe('Typography variant selector', () => {
  it('should show variant properties', () => {
    const { getByRole } = render(
      <MockedProvider>
        <Variant id={'typograpgy-variant-id'} variant={null} />
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Body 1' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Header 1' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Header 2' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Header 3' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Header 4' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Header 5' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Header 6' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Subtitle 1' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Subtitle 2' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Overline' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Caption' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Body 2' })).toHaveClass('Mui-selected')
  })
  it('should change the variant property', async () => {
    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: TYPOGRAPHY_BLOCK_UPDATE,
              variables: {
                id: 'typography-variant-id',
                journeyId: undefined,
                input: {
                  variant: 'overline'
                }
              }
            },
            result: {
              data: {
                typographyBlockUpdate: {
                  id: 'typography-variant-id',
                  variant: 'overline'
                }
              }
            }
          }
        ]}
      >
        <Variant id={'typography-variant-id'} variant={null} />
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Body 2' })).toHaveClass('Mui-selected')
    fireEvent.click(getByRole('button', { name: 'Overline' }))
    await waitFor(() =>
      expect(getByRole('button', { name: 'Overline' })).toHaveClass(
        'Mui-selected'
      )
    )
  })
})
