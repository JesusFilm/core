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
})
