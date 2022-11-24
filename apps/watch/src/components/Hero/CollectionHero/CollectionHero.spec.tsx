import { render } from '@testing-library/react'
import { CollectionHero } from '.'

describe('CollectionHero', () => {
  it('should render hero for a collection', () => {
    const { getByText } = render(
      <CollectionHero
        title="Title"
        imageSrc="https://images.unsplash.com/photo-1669111958756-13b1d5be9110?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=4140&q=80"
        type="collection"
        length={4}
      />
    )

    expect(getByText('collection')).toBeInTheDocument()
  })

  it('should render hero for a series', () => {
    const { getByText } = render(
      <CollectionHero
        title="Title"
        imageSrc="https://images.unsplash.com/photo-1669111958756-13b1d5be9110?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=4140&q=80"
        type="series"
        length={4}
      />
    )

    expect(getByText('series')).toBeInTheDocument()
  })
})
