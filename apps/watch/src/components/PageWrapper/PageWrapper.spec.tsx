import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { PageWrapper } from '.'

describe('PageWrapper', () => {
  it('should show logo', () => {
    const { getAllByAltText } = render(
      <MockedProvider>
        <PageWrapper />
      </MockedProvider>
    )
    expect(getAllByAltText('Watch Logo')[0]).toBeInTheDocument()
  })
})
