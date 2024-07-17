import { fireEvent } from '@storybook/testing-library'
import { render } from '@testing-library/react'

import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import { useRefinementList } from 'react-instantsearch'
import { FeltNeedsButton } from '.'

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

jest.mock('react-instantsearch')

function mockRefinementList() {
  jest.clearAllMocks()
  const onClick = jest.fn()
  const useRefinementListMocked = jest.mocked(useRefinementList)
  useRefinementListMocked.mockReturnValue({
    refine: onClick
  } as unknown as RefinementListRenderState)
  return onClick
}

describe('FeltNeedsButton', () => {
  beforeEach(() => {
    mockRefinementList()
  })

  it('should render a felt needs button', () => {
    const { getByRole, queryByTestId } = render(<FeltNeedsButton item={tag} />)

    expect(
      getByRole('button', { name: 'Acceptance tag Acceptance Acceptance' })
    ).toBeInTheDocument()
    expect(queryByTestId('felt-needs-button-loading')).not.toBeInTheDocument()
  })

  it('should render loading skeleton if no tag is passed', () => {
    const { getByTestId } = render(<FeltNeedsButton item={undefined} />)
    expect(getByTestId('felt-needs-button-loading')).toBeInTheDocument()
  })

  it('should render without image', () => {
    const { getByRole, queryByTestId } = render(
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
      />
    )
    expect(
      getByRole('button', { name: 'invalid name invalid name' })
    ).toBeInTheDocument()
    expect(queryByTestId('felt-needs-button-loading')).not.toBeInTheDocument()
  })

  it('should call onClick on button click', () => {
    const onClick = mockRefinementList()

    const { getByRole } = render(<FeltNeedsButton item={tag} />)

    fireEvent.click(
      getByRole('button', { name: 'Acceptance tag Acceptance Acceptance' })
    )

    expect(onClick).toHaveBeenCalledWith(tag.name[0].value)
  })
})
