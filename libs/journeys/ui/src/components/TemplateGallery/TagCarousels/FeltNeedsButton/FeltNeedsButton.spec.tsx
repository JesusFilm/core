import { fireEvent } from '@storybook/testing-library'
import { render, screen } from '@testing-library/react'

import {
  RefinementListItem,
  RefinementListRenderState
} from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
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

const feltNeedsRefinements = [
  {
    count: 1,
    isRefined: true,
    value: 'Anxiety',
    label: 'Anxiety',
    highlighted: 'Anxiety'
  },
  {
    count: 2,
    isRefined: false,
    value: 'Acceptance',
    label: 'Acceptance',
    highlighted: 'Acceptance'
  },
  {
    count: 2,
    isRefined: false,
    value: 'Depression',
    label: 'Depression',
    highlighted: 'Depression'
  }
] as RefinementListItem[]

jest.mock('react-instantsearch')

function mockRefinementList() {
  const onClick = jest.fn()
  const useRefinementListMocked = jest.mocked(useRefinementList)
  useRefinementListMocked.mockReturnValue({
    items: feltNeedsRefinements,
    refine: onClick
  } as unknown as RefinementListRenderState)
  return onClick
}

describe('FeltNeedsButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRefinementList()
  })

  it('should render a felt needs button', () => {
    render(<FeltNeedsButton item={tag} />)

    expect(
      screen.getByRole('button', {
        name: 'Acceptance tag Acceptance Acceptance'
      })
    ).toBeInTheDocument()
    expect(
      screen.queryByTestId('felt-needs-button-loading')
    ).not.toBeInTheDocument()
  })

  it('should render loading skeleton if no tag is passed', () => {
    render(<FeltNeedsButton item={undefined} />)
    expect(screen.getByTestId('felt-needs-button-loading')).toBeInTheDocument()
  })

  it('should render without image', () => {
    render(
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
      screen.getByRole('button', { name: 'invalid name invalid name' })
    ).toBeInTheDocument()
    expect(
      screen.queryByTestId('felt-needs-button-loading')
    ).not.toBeInTheDocument()
  })

  it('should call onClick on button click', () => {
    const onClick = mockRefinementList()
    render(<FeltNeedsButton item={tag} />)
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Acceptance tag Acceptance Acceptance'
      })
    )
    expect(onClick).toHaveBeenCalledWith(tag.name[0].value)
  })

  it('should unrefine others when clicked', () => {
    const onClick = mockRefinementList()
    render(<FeltNeedsButton item={tag} />)
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Acceptance tag Acceptance Acceptance'
      })
    )
    expect(onClick).toHaveBeenCalledWith(feltNeedsRefinements[0].value)
    expect(onClick).toHaveBeenCalledWith(feltNeedsRefinements[1].value)
  })
})
