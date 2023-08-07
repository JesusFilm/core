import { fireEvent, render } from '@testing-library/react'

import { SearchUnsplashPhotos_searchUnsplashPhotos_results } from '../../../../../../__generated__/SearchUnsplashPhotos'

import { UnsplashList } from './UnsplashList'

describe('UnsplashList', () => {
  const unsplashImage = {
    __typename: 'UnsplashPhoto',
    id: 1,
    width: 6240,
    height: 4160,
    alt_description: 'white dome building during daytime',
    urls: {
      small:
        'https://images.unsplash.com/photo-1618777618311-92f986a6519d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0MDIyMzR8MHwxfGNvbGxlY3Rpb258MXw0OTI0NTU2fHx8fHwyfHwxNjc0Nzc0Mjk4&ixlib=rb-4.0.3&q=80&w=400'
    },
    links: {
      download_location:
        'https://api.unsplash.com/collections/4924556/photos?client_id=fpXMSrVxk3ByFvwCqpoQgcIa6P5hX4xqdkSbmfjBBHY'
    },
    user: {
      first_name: 'Levi Meir',
      last_name: 'Clancy',
      username: 'levimeirclancy'
    },
    color: '#262626'
  }

  it('should call onChange on image click', () => {
    const onChange = jest.fn()
    const { getByAltText, getByRole, getByTestId } = render(
      <UnsplashList
        gallery={[
          unsplashImage as unknown as SearchUnsplashPhotos_searchUnsplashPhotos_results
        ]}
        onChange={onChange}
      />
    )
    expect(getByRole('list')).toBeInTheDocument()
    fireEvent.click(getByRole('button'))
    expect(onChange).toHaveBeenCalled()
    expect(
      getByAltText('white dome building during daytime')
    ).toBeInTheDocument()
    expect(getByTestId('image-1')).toHaveStyle('border: 2px solid #C52D3A')
  })
})
