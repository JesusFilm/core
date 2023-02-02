import { ReactElement, useCallback, useEffect, useState } from 'react'
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
  const [collections, setCollections] = useState<UnsplashImage[]>()
  const [searchResults, setSearchResults] = useState<UnsplashImage[]>()
  const [query, setQuery] = useState<string | null>()
  const [page, setPage] = useState(1)
  const accessKey = '7MUdE7NO3RSHYD3gefyyPD3nSBOK4vziireH3tnj9L0'
  // todo: key is just here temporarily, needs to be moved to doppler

  const fetchCollection = useCallback(async (): Promise<void> => {
    const collectionData = await (
      await fetch(
        `https://api.unsplash.com/collections/4924556/photos?page=${page}&per_page=20&client_id=${accessKey}`
      )
    ).json()
    setCollections((prevValue) => [...(prevValue ?? []), ...collectionData])
  }, [page])

  const fetchSearchResults = useCallback(async (): Promise<void> => {
    if (query == null) return
    const searchData = await (
      await fetch(
        `https://api.unsplash.com/search/photos?query=${query}&page=${page}&per_page=20&client_id=${accessKey}`
      )
    ).json()
    setSearchResults((prevValue) => [
      ...(prevValue ?? []),
      ...searchData.results
    ])
  }, [page, query])

  useEffect(() => {
    if (query == null) {
      void fetchCollection()
    } else {
      void fetchSearchResults()
    }
  }, [query, page, fetchCollection, fetchSearchResults])

  const handleSubmit = (value: string): void => {
    if (query !== value) {
      setSearchResults(undefined)
    }
    setQuery(value)
    setPage(1)
  }

  const fetchMore = (): void => {
    setPage(page + 1)
  }

  return (
    <Stack sx={{ pt: 3 }}>
      <UnsplashSearch value={query} handleSubmit={handleSubmit} />
      <Stack spacing={2} sx={{ py: 6 }}>
        <Typography variant="overline" color="primary">
          Unsplash
        </Typography>
        <Typography variant="h6">Featured Images</Typography>
      </Stack>
      {query == null
        ? collections != null && <UnsplashList gallery={collections} />
        : searchResults != null && <UnsplashList gallery={searchResults} />}
      <LoadingButton variant="outlined" onClick={fetchMore} size="medium">
        Load More
      </LoadingButton>
    </Stack>
  )
}
