import { fireEvent } from '@storybook/testing-library'
import { render } from '@testing-library/react'

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

function mockRefinementList() {
  jest.clearAllMocks()
  const onClick = jest.fn()
  const useRefinementListMocked = jest.mocked(useRefinementList)
  useRefinementListMocked.mockReturnValue({
    refine: onClick
  } as unknown as RefinementListRenderState)
  return onClick
}

describe('CollectionButton', () => {
  beforeEach(() => {
    mockRefinementList()
  })

  it('should render a collection button with image', () => {
    const { getByRole } = render(<CollectionButton item={tag} />)

    expect(getByRole('button', { name: 'NUA tag NUA NUA' })).toBeInTheDocument()
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
      />
    )

    expect(getByRole('button', { name: 'New New' })).toBeInTheDocument()
    expect(getByTestId('InsertPhotoRoundedIcon')).toBeInTheDocument()
  })

  it('should render loading skeleton if no tag is passed', () => {
    const onClick = mockRefinementList()

    const { getByTestId, getByRole } = render(
      <CollectionButton item={undefined} />
    )

    expect(getByTestId('collections-button-loading')).toBeInTheDocument()
    fireEvent.click(getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('should call onClick on button click', () => {
    const onClick = mockRefinementList()
    const { getByRole } = render(<CollectionButton item={tag} />)

    fireEvent.click(getByRole('button', { name: 'NUA tag NUA NUA' }))

    expect(onClick).toHaveBeenCalledWith(tag.name[0].value)
  })
})
