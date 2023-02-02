import { ReactElement, useEffect, useState } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import LoadingButton from '@mui/lab/LoadingButton'

import fetch from 'node-fetch'
import { UnsplashSearch } from './UnsplashSearch'
import { UnsplashList } from './UnsplashList'

export interface UnsplashImage {
  id: number
  width: number
  height: number
  alt_description: string
  urls: {
    small: string
  }
  user: {
    first_name: string
    last_name: string
    username: string
  }
  color: string | null
}

export function UnsplashGallery(): ReactElement {
  const [gallery, setGallery] = useState<UnsplashImage[]>()
  const [query, setQuery] = useState<string>()
  const [page, setPage] = useState(1)
  const accessKey = '7MUdE7NO3RSHYD3gefyyPD3nSBOK4vziireH3tnj9L0'

  // TODO:
  // Move accessKey to doppler
  // On Image Click - Sets the unsplash image to be in the image block

  const fetchCollection = async (): Promise<void> => {
    const collectionData = await (
      await fetch(
        `https://api.unsplash.com/collections/4924556/photos?page=1&per_page=20&client_id=${accessKey}`
      )
    ).json()
    setGallery(collectionData)
  }

  const handleSubmit = async (image: string): Promise<void> => {
    const searchData = await (
      await fetch(
        `https://api.unsplash.com/search/photos?query=${image}&page=1&per_page=20&client_id=${accessKey}`
      )
    ).json()
    setQuery(image)
    setGallery(searchData.results)
  }

  const fetchMore = async (): Promise<void> => {
    setPage(page + 1)
    if (query == null) return
    // todo: load more on collection
    const loadData = await (
      await fetch(
        `https://api.unsplash.com/search/photos?query=${query}&page=${page + 1
        }&per_page=20&client_id=${accessKey}`
      )
    ).json()
    setGallery((prevGallery) => [...prevGallery, ...loadData.results])
  }

  useEffect(() => {
    void fetchCollection()
  }, [])

  return (
    <Stack sx={{ pt: 3 }}>
      <UnsplashSearch handleSubmit={handleSubmit} />
      <Stack spacing={2} sx={{ py: 6 }}>
        <Typography variant="overline" color="primary">
          Unsplash
        </Typography>
        <Typography variant="h6">Featured Images</Typography>
      </Stack>
      {gallery != null && <UnsplashList gallery={gallery} />}
      <LoadingButton variant="outlined" onClick={fetchMore} size="medium">
        Load More
      </LoadingButton>
    </Stack>
  )
}
