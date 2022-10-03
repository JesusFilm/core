import { render } from '@testing-library/react'
import { ContactSupport } from './ContactSupport'

describe('ContactSupport', () => {
  it('should mail support on click', () => {
    const { getByRole } = render(
      <ContactSupport title="Title" description="Description" />
    )

    expect(
      getByRole('heading', { level: 1, name: 'Title' })
    ).toBeInTheDocument()
    expect(
      getByRole('heading', { level: 6, name: 'Description' })
    ).toBeInTheDocument()
    expect(getByRole('link', { name: 'Contact Support' })).toHaveAttribute(
      'href',
      'mailto:support@nextstep.is?subject=Invite request for the NextStep builder'
    )
  })
})
