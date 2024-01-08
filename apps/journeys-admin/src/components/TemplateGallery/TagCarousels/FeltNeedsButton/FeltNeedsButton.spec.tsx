import { fireEvent } from '@storybook/testing-library'
import { render } from '@testing-library/react'

import { FeltNeedsButton } from '.'

describe('FeltNeedsButton', () => {
  const name = [
    { __typename: 'Translation' as const, value: 'Acceptance', primary: true }
  ]
  const tag = {
    id: 'tagId',
    __typename: 'Tag' as const,
    name,
    service: null,
    parentId: 'feltNeeds'
  }

  // TODO: Image is missing required "src" property error cause by jest transforming image to a string in test instead of object with src
  it('should render a felt needs button', () => {
    const { getByRole } = render(
      <FeltNeedsButton item={tag} onClick={jest.fn()} />
    )

    expect(
      getByRole('button', { name: 'Acceptance Acceptance Acceptance' })
    ).toBeInTheDocument()
  })

  it('should render loading skeleton if no tag is passed', () => {
    const { getByTestId } = render(
      <FeltNeedsButton item={undefined} onClick={jest.fn()} />
    )

    expect(getByTestId('felt-needs-button-loading')).toBeInTheDocument()
  })

  it('should render nothing if no tag image', () => {
    const { queryByRole, queryByTestId } = render(
      <FeltNeedsButton
        item={{
          ...tag,
          name: [
            {
              __typename: 'Translation' as const,
              value: 'invalid name',
              primary: true
            }
          ]
        }}
        onClick={jest.fn()}
      />
    )
    expect(queryByRole('button')).not.toBeInTheDocument()
    expect(queryByTestId('felt-needs-button-loading')).not.toBeInTheDocument()
  })

  it('should call onClick on button click', () => {
    const onClick = jest.fn()
    const { getByRole } = render(
      <FeltNeedsButton item={tag} onClick={onClick} />
    )

    fireEvent.click(
      getByRole('button', { name: 'Acceptance Acceptance Acceptance' })
    )

    expect(onClick).toHaveBeenCalledWith(tag.id)
  })
})
