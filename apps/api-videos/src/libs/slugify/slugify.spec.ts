import { slugify } from '.'

describe('slugify', () => {
  it('transforms My Title to my-title', () => {
    expect(slugify('My Title')).toEqual('my-title')
  })

  it('when slug already used transforms My Title to my-title-2', () => {
    expect(slugify('My Title', ['my-title'])).toEqual('my-title-2')
  })

  it('when slug already used twice transforms My Title to my-title-3', () => {
    expect(slugify('My Title', ['my-title', 'my-title-2'])).toEqual(
      'my-title-3'
    )
  })

  it('removes start characters outside of the unicode letter or number sets', () => {
    expect(slugify('€™ And Test')).toEqual('and-test')
  })

  it('removes end characters outside of the unicode letter or number sets', () => {
    expect(slugify('Test And €™')).toEqual('test-and')
  })

  it('removes apostrophe s', () => {
    expect(slugify("Bob's and Mary's")).toEqual('bob-and-mary')
  })

  it('removes â€™s', () => {
    expect(slugify('Bobâ€™s and Maryâ€™s')).toEqual('bob-and-mary')
  })

  it("removes 'â€™,.", () => {
    expect(slugify("Bob And 'â€™,. Mary")).toEqual('bob-and-mary')
  })

  it('replaces space dash with dash', () => {
    expect(slugify('Bob -And -Mary')).toEqual('bob-and-mary')
  })

  it('replaces dash space with dash', () => {
    expect(slugify('Bob- And- Mary')).toEqual('bob-and-mary')
  })
})
