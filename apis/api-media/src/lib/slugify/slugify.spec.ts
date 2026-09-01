import { isPublicSlug, slugify } from '.'

describe('slugify', () => {
  it('transforms My Title to my-title', () => {
    expect(slugify('id', 'My Title')).toBe('my-title')
  })

  it('when slug already used transforms My Title to my-title-2', () => {
    expect(slugify('id', 'My Title', { 'my-title': 'id2' })).toBe('my-title-2')
  })

  it('when slug already used twice transforms My Title to my-title-3', () => {
    expect(
      slugify('id', 'My Title', { 'my-title': 'id2', 'my-title-2': 'id3' })
    ).toBe('my-title-3')
  })

  it('removes start characters outside of the unicode letter or number sets', () => {
    expect(slugify('id', '€™ And Test')).toBe('and-test')
  })

  it('removes end characters outside of the unicode letter or number sets', () => {
    expect(slugify('id', 'Test And €™')).toBe('test-and')
  })

  it('removes apostrophe s', () => {
    expect(slugify('id', "Bob's and Mary's")).toBe('bob-and-mary')
  })

  it('removes â€™s', () => {
    expect(slugify('id', 'Bobâ€™s and Maryâ€™s')).toBe('bob-and-mary')
  })

  it("removes 'â€™,.", () => {
    expect(slugify('id', "Bob And 'â€™,. Mary")).toBe('bob-and-mary')
  })

  it('replaces space dash with dash', () => {
    expect(slugify('id', 'Bob -And -Mary')).toBe('bob-and-mary')
  })

  it('replaces dash space with dash', () => {
    expect(slugify('id', 'Bob- And- Mary')).toBe('bob-and-mary')
  })
})

describe('isPublicSlug', () => {
  it('accepts an already public-style slug', () => {
    expect(isPublicSlug('know-god')).toBe(true)
  })

  it('rejects an internal-style slug with underscores and mixed case', () => {
    expect(isPublicSlug('Nua_Know_God')).toBe(false)
  })

  it('rejects uppercase letters', () => {
    expect(isPublicSlug('Know-God')).toBe(false)
  })

  it('rejects underscores even when already lowercase', () => {
    expect(isPublicSlug('know_god')).toBe(false)
  })

  it('rejects spaces', () => {
    expect(isPublicSlug('know god')).toBe(false)
  })
})
