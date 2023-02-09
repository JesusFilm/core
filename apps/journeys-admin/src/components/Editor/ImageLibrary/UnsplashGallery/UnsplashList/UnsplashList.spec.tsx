import { render } from '@testing-library/react'
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
    user: {
      first_name: 'Levi Meir',
      last_name: 'Clancy',
      username: 'levimeirclancy'
    },
    color: '#262626'
  }

  it('should return a list of unsplash images', () => {
    const { getByRole, getByText } = render(
      <UnsplashList
        gallery={[
          unsplashImage as unknown as SearchUnsplashPhotos_searchUnsplashPhotos_results
        ]}
      />
    )
    expect(getByRole('list')).toBeInTheDocument()
    expect(getByText('Levi Meir Clancy')).toBeInTheDocument()
  })
})
