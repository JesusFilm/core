import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { Header } from '../Header'
import { PageWrapper } from '.'

describe('PageWrapper', () => {
  it('should show logo', () => {
    const { getAllByAltText } = render(
      <MockedProvider>
        <PageWrapper header={<Header />} />
      </MockedProvider>
    )
    expect(getAllByAltText('Watch Logo')[0]).toBeInTheDocument()
  })
})
