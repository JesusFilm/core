import { fireEvent } from '@storybook/testing-library'
import { render, screen } from '@testing-library/react'

import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import { useRefinementList } from 'react-instantsearch'
import { CollectionButton } from '.'

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

jest.mock('react-instantsearch')

const mockUseRefinementList = useRefinementList as jest.MockedFunction<
  typeof useRefinementList
>

function mockRefinementList() {
  const onClick = jest.fn()
  mockUseRefinementList.mockReturnValue({
    refine: onClick
  } as unknown as RefinementListRenderState)
  return onClick
}

describe('CollectionButton', () => {
  beforeEach(() => {
    mockRefinementList()
  })

  it('should render a collection button with image', () => {
    render(<CollectionButton item={tag} />)

    expect(
      screen.getByRole('button', { name: 'NUA tag NUA NUA' })
    ).toBeInTheDocument()
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('should render a collection button with placeholder', () => {
    render(
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
      />
    )

    expect(screen.getByRole('button', { name: 'New New' })).toBeInTheDocument()
    expect(screen.getByTestId('InsertPhotoRoundedIcon')).toBeInTheDocument()
  })

  it('should render loading skeleton if no tag is passed', () => {
    const onClick = mockRefinementList()

    render(<CollectionButton item={undefined} />)

    expect(screen.getByTestId('collections-button-loading')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('should call onClick on button click', () => {
    const onClick = mockRefinementList()
    render(<CollectionButton item={tag} />)

    fireEvent.click(screen.getByRole('button', { name: 'NUA tag NUA NUA' }))

    expect(onClick).toHaveBeenCalledWith(tag.name[0].value)
  })
})
