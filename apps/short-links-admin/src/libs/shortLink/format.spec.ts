import { formatDomainLabel } from './format'

describe('formatDomainLabel', () => {
  it('shows the prefix after the hostname', () => {
    expect(formatDomainLabel({ hostname: 'jesus.film', pathPrefix: 's' })).toBe(
      'jesus.film/s'
    )
  })

  it('shows the bare hostname for a domain at the root', () => {
    expect(formatDomainLabel({ hostname: 'nxstp.is', pathPrefix: '' })).toBe(
      'nxstp.is'
    )
    expect(formatDomainLabel({ hostname: 'arc.gt', pathPrefix: null })).toBe(
      'arc.gt'
    )
    expect(formatDomainLabel({ hostname: 'arc.gt' })).toBe('arc.gt')
  })

  it('ignores stray slashes', () => {
    expect(
      formatDomainLabel({ hostname: 'jesus.film', pathPrefix: '/s/' })
    ).toBe('jesus.film/s')
  })
})
