import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'

import { FeaturedAndNewTemplates } from './FeaturedAndNewTemplates'

describe('TemplateSections', () => {
  it('should render Featured and New templates', () => {
    const { getByRole } = render(
      <MockedProvider>
        <FeaturedAndNewTemplates />
      </MockedProvider>
    )
    expect(getByRole('heading', { name: 'Featured & New' })).toBeInTheDocument()
  })
})
