import { fireEvent } from '@storybook/testing-library'
import { render } from '@testing-library/react'

import { FeltNeedsButton } from '.'

describe('FeltNeedsButton', () => {
  const name = [
    { __typename: 'TagName' as const, value: 'Acceptance', primary: true }
  ]
  const tag = {
    id: 'tagId',
    __typename: 'Tag' as const,
    name,
    service: null,
    parentId: 'feltNeeds'
  }

  it('should render a felt needs button', () => {
    const { getByRole, queryByTestId } = render(
      <FeltNeedsButton item={tag} onClick={jest.fn()} />
    )

    expect(
      getByRole('button', { name: 'Acceptance tag Acceptance Acceptance' })
    ).toBeInTheDocument()
    expect(queryByTestId('felt-needs-button-loading')).not.toBeInTheDocument()
  })

  it('should render loading skeleton if no tag is passed', () => {
    const { getByTestId } = render(
      <FeltNeedsButton item={undefined} onClick={jest.fn()} />
    )
    expect(getByTestId('felt-needs-button-loading')).toBeInTheDocument()
  })

  it('should render without image', () => {
    const { getByRole, queryByTestId } = render(
      <FeltNeedsButton
        item={{
          ...tag,
          name: [
            {
              __typename: 'TagName' as const,
              value: 'invalid name',
              primary: true
            }
          ]
        }}
        onClick={jest.fn()}
      />
    )
    expect(
      getByRole('button', { name: 'invalid name invalid name' })
    ).toBeInTheDocument()
    expect(queryByTestId('felt-needs-button-loading')).not.toBeInTheDocument()
  })

  it('should call onClick on button click', () => {
    const onClick = jest.fn()
    const { getByRole } = render(
      <FeltNeedsButton item={tag} onClick={onClick} />
    )

    fireEvent.click(
      getByRole('button', { name: 'Acceptance tag Acceptance Acceptance' })
    )

    expect(onClick).toHaveBeenCalledWith(tag.id)
  })
})
