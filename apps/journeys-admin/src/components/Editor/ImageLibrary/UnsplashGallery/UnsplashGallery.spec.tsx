import { render, waitFor } from '@testing-library/react'
import { rest } from 'msw'
import { mswServer } from '../../../../../test/mswServer'
import { UnsplashGallery } from '.'

describe('UnsplashGallery', () => {
  const unsplashImage = {
    id: 'dLAN46E5wVw',
    width: '6240',
    height: '4160',
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

  const getCollection = rest.get(
    'https://api.unsplash.com/collections/4924556/photos?page=1&per_page=1&client_id=',
    (_req, res, ctx) => {
      return res(ctx.json([unsplashImage]))
    }
  )

  const fetchSearchRequest = rest.get(
    'https://api.unsplash.com/search/photos?query=cat&page=1&per_page=1&client_id=',
    (_req, res, ctx) => {
      return res(
        ctx.json({
          results: [unsplashImage]
        })
      )
    }
  )

  // TODO: move unsplash accessKey to doppler then tests would pass

  it('should return a collection of images from unsplash', async () => {
    mswServer.use(getCollection)
    const { getByRole, getByText } = render(<UnsplashGallery />)
    await waitFor(() => expect(getByRole('list')).toBeInTheDocument())
    expect(getByText('Levi Meir Clancy')).toBeInTheDocument()
  })

  it('should search images from unsplash', async () => {
    mswServer.use(fetchSearchRequest)
    const { getByRole, getAllByText } = render(<UnsplashGallery />)
    await waitFor(() => expect(getByRole('list')).toBeInTheDocument())
    expect(getAllByText('Levi Meir Clancy')[0]).toBeInTheDocument()
  })
})
