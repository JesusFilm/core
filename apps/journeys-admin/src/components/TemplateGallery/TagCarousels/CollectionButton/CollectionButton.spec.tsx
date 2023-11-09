import { fireEvent } from '@storybook/testing-library'
import { render } from '@testing-library/react'

import { CollectionButton } from '.'

describe('CollectionButton', () => {
  const name = [
    { __typename: 'Translation' as const, value: 'NUA', primary: true }
  ]
  const tag = {
    id: 'tagId',
    __typename: 'Tag' as const,
    name,
    service: null,
    parentId: 'collection'
  }

  it('should render a collection button with image', () => {
    const { getByRole } = render(
      <CollectionButton item={tag} onClick={jest.fn()} />
    )

    expect(getByRole('button', { name: 'NUA NUA' })).toBeInTheDocument()
    expect(getByRole('img')).toBeInTheDocument()
  })

  it('should render a collection button with placeholder', () => {
    const { getByRole, getByTestId } = render(
      <CollectionButton
        item={{
          ...tag,
          name: [
            {
              __typename: 'Translation' as const,
              value: 'New',
              primary: true
            }
          ]
        }}
        onClick={jest.fn()}
      />
    )

    expect(getByRole('button', { name: 'New New' })).toBeInTheDocument()
    expect(getByTestId('InsertPhotoRoundedIcon')).toBeInTheDocument()
  })

  it('should render loading skeleton if no tag is passed', () => {
    const onClick = jest.fn()

    const { getByTestId, getByRole } = render(
      <CollectionButton item={undefined} onClick={onClick} />
    )

    expect(getByTestId('collections-button-loading')).toBeInTheDocument()
    fireEvent.click(getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('should call onClick on button click', () => {
    const onClick = jest.fn()
    const { getByRole } = render(
      <CollectionButton item={tag} onClick={onClick} />
    )

    fireEvent.click(getByRole('button', { name: 'NUA NUA' }))

    expect(onClick).toHaveBeenCalledWith(tag.id)
  })
})
