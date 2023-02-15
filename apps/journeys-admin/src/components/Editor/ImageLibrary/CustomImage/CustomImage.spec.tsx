import { render, fireEvent } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { CustomImage } from '.'

describe('CustomImage', () => {
  it('should render custom url image upload', () => {
    const { getByRole, getByText } = render(
      <MockedProvider>
        <CustomImage onChange={jest.fn()} />
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Add image by URL' }))
    expect(getByText('Paste URL of image...'))
  })
})
