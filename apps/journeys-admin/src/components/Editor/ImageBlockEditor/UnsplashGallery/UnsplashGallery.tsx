import { ReactElement, useState } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import LoadingButton from '@mui/lab/LoadingButton'
import { gql, useQuery } from '@apollo/client'

import { ListUnsplashCollectionPhotos } from '../../../../../__generated__/ListUnsplashCollectionPhotos'
import { SearchUnsplashPhotos } from '../../../../../__generated__/SearchUnsplashPhotos'
import { UnsplashSearch } from './UnsplashSearch'
import { UnsplashList } from './UnsplashList'

export const LIST_UNSPLASH_COLLECTION_PHOTOS = gql`
  query ListUnsplashCollectionPhotos(
    $collectionId: String!
    $page: Int
    $perPage: Int
  ) {
    listUnsplashCollectionPhotos(
      collectionId: $collectionId
      page: $page
      perPage: $perPage
    ) {
      id
      alt_description
      blur_hash
      width
      height
      urls {
        small
        regular
      }
      user {
        first_name
        last_name
        username
      }
    }
  }
`

export const SEARCH_UNSPLASH_PHOTOS = gql`
  query SearchUnsplashPhotos($query: String!, $page: Int, $perPage: Int) {
    searchUnsplashPhotos(query: $query, page: $page, perPage: $perPage) {
      results {
        id
        alt_description
        blur_hash
        width
        height
        urls {
          small
          regular
        }
        user {
          first_name
          last_name
          username
        }
      }
    }
  }
`

export interface UnsplashAuthor {
  fullname: string
  username: string
}

interface UnsplashGalleryProps {
  onChange: (
    src: string,
    unsplashAuthor: UnsplashAuthor,
    blurhash?: string,
    width?: number,
    height?: number
  ) => void
}

export function UnsplashGallery({
  onChange
}: UnsplashGalleryProps): ReactElement {
  const [query, setQuery] = useState<string>()
  const [page, setPage] = useState(1)
  const {
    data: listData,
    refetch: refetchList,
    fetchMore: fetchMoreList
  } = useQuery<ListUnsplashCollectionPhotos>(LIST_UNSPLASH_COLLECTION_PHOTOS, {
    variables: { collectionId: '4924556', page, perPage: 20 },
    skip: query != null
  })
  const {
    data: searchData,
    refetch: refetchSearch,
    fetchMore: fetchMoreSearch
  } = useQuery<SearchUnsplashPhotos>(SEARCH_UNSPLASH_PHOTOS, {
    variables: { query, page, perPage: 20 },
    skip: query == null
  })

  const handleSubmit = (value: string): void => {
    if (value == null) {
      void refetchList({ collectionId: '4924556', page: 1, perPage: 20 })
    } else {
      void refetchSearch({ query: value, page: 1, perPage: 20 })
    }
    setQuery(value)
    setPage(1)
  }

  const nextPage = (): void => {
    if (query == null) {
      void fetchMoreList({
        variables: { collectionId: '4924556', page: page + 1, perPage: 20 }
      })
    } else {
      void fetchMoreSearch({
        variables: { query, page: page + 1, perPage: 20 }
      })
    }
    setPage(page + 1)
  }

  return (
    <Stack sx={{ pt: 6, px: 6 }}>
      <UnsplashSearch value={query} handleSubmit={handleSubmit} />
      <Stack sx={{ pt: 6, pb: 1 }}>
        <Typography variant="overline" color="primary">
          Unsplash
        </Typography>
        <Typography variant="h6">Featured Images</Typography>
      </Stack>
      {query == null && listData != null && (
        <UnsplashList
          gallery={listData.listUnsplashCollectionPhotos}
          onChange={onChange}
        />
      )}
      {query != null && searchData != null && (
        <UnsplashList
          gallery={searchData.searchUnsplashPhotos.results}
          onChange={onChange}
        />
      )}
      <LoadingButton
        variant="outlined"
        onClick={nextPage}
        size="medium"
        sx={{ mb: 9 }}
      >
        Load More
      </LoadingButton>
    </Stack>
  )
}
