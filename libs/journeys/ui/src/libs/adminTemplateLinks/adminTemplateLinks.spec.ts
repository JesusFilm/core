import {
  buildCustomizeHref,
  buildUseTemplateHref,
  sanitiseAdminBase
} from './adminTemplateLinks'

describe('sanitiseAdminBase', () => {
  it('returns the origin of a valid absolute url', () => {
    expect(sanitiseAdminBase('https://admin.nextstep.is/some/path')).toBe(
      'https://admin.nextstep.is'
    )
  })

  it('re-prepends https:// for schemeless values', () => {
    expect(sanitiseAdminBase('admin.staging.local')).toBe(
      'https://admin.staging.local'
    )
  })

  it('trims whitespace and slashes in the fallback path', () => {
    expect(sanitiseAdminBase('  admin.staging.local/  ')).toBe(
      'https://admin.staging.local'
    )
  })
})

describe('buildUseTemplateHref', () => {
  it('builds the deep link from a valid base', () => {
    expect(
      buildUseTemplateHref('https://admin.nextstep.is', 'template-1')
    ).toBe('https://admin.nextstep.is/?useTemplate=template-1')
  })

  it('falls back to an absolute https href for schemeless bases', () => {
    expect(buildUseTemplateHref('admin.staging.local', 'template-1')).toBe(
      'https://admin.staging.local/?useTemplate=template-1'
    )
  })
})

describe('buildCustomizeHref', () => {
  it('builds the customize entry point from a valid base', () => {
    expect(buildCustomizeHref('https://admin.nextstep.is', 'template-1')).toBe(
      'https://admin.nextstep.is/templates/template-1/customize'
    )
  })

  it('falls back to an absolute https href for schemeless bases', () => {
    expect(buildCustomizeHref('admin.staging.local', 'template-1')).toBe(
      'https://admin.staging.local/templates/template-1/customize'
    )
  })

  it('encodes the journey id', () => {
    expect(buildCustomizeHref('https://admin.nextstep.is', 'a/b')).toBe(
      'https://admin.nextstep.is/templates/a%2Fb/customize'
    )
  })
})
