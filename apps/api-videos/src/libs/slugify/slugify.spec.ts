import { slugify } from '.'

describe('slugify', () => {
  it('transforms My Title to my-title', () => {
    expect(slugify('id', 'My Title')).toEqual('my-title')
  })

  it('when slug already used transforms My Title to my-title-2', () => {
    expect(slugify('id', 'My Title', { 'my-title': 'id2' })).toEqual(
      'my-title-2'
    )
  })

  it('when slug already used twice transforms My Title to my-title-3', () => {
    expect(
      slugify('id', 'My Title', { 'my-title': 'id2', 'my-title-2': 'id3' })
    ).toEqual('my-title-3')
  })

  it('removes start characters outside of the unicode letter or number sets', () => {
    expect(slugify('id', '€™ And Test')).toEqual('and-test')
  })

  it('removes end characters outside of the unicode letter or number sets', () => {
    expect(slugify('id', 'Test And €™')).toEqual('test-and')
  })

  it('removes apostrophe s', () => {
    expect(slugify('id', "Bob's and Mary's")).toEqual('bob-and-mary')
  })

  it('removes â€™s', () => {
    expect(slugify('id', 'Bobâ€™s and Maryâ€™s')).toEqual('bob-and-mary')
  })

  it("removes 'â€™,.", () => {
    expect(slugify('id', "Bob And 'â€™,. Mary")).toEqual('bob-and-mary')
  })

  it('replaces space dash with dash', () => {
    expect(slugify('id', 'Bob -And -Mary')).toEqual('bob-and-mary')
  })

  it('replaces dash space with dash', () => {
    expect(slugify('id', 'Bob- And- Mary')).toEqual('bob-and-mary')
  })
})
