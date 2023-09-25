import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'

import { TemplateSections } from './TemplateSections'

describe('TemplateSections', () => {
  it('should render Featured and New templates', () => {
    const { getByRole } = render(
      <MockedProvider>
        <TemplateSections />
      </MockedProvider>
    )
    expect(getByRole('heading', { name: 'Featured & New' })).toBeInTheDocument()
  })

  it('should render Most Relevant Templates when tag Ids are provided', () => {
    const { getByRole, queryByRole } = render(
      <MockedProvider>
        <TemplateSections tags={['767561ca-3f63-46f4-b2a0-3a37f891632a']} />
      </MockedProvider>
    )
    expect(getByRole('heading', { name: 'Most Relevant' })).toBeInTheDocument()
    expect(
      queryByRole('heading', { name: 'Featured & New' })
    ).not.toBeInTheDocument()
  })
})
