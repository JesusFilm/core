import { gql, useMutation, useQuery } from '@apollo/client'
import LoadingButton from '@mui/lab/LoadingButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'

import {
  ListUnsplashCollectionPhotos_listUnsplashCollectionPhotos as CollectionPhotos,
  ListUnsplashCollectionPhotos
} from '../../../../../../../../__generated__/ListUnsplashCollectionPhotos'
import { SearchUnsplashPhotos } from '../../../../../../../../__generated__/SearchUnsplashPhotos'
import { TriggerUnsplashDownload } from '../../../../../../../../__generated__/TriggerUnsplashDownload'

import { UnsplashCollections } from './UnsplashCollections'
import { UnsplashList } from './UnsplashList'
import { UnsplashSearch } from './UnsplashSearch'

const DEFAULT_COLLECTION_ID = '4924556'

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
      links {
        download_location
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
        links {
          download_location
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

export const TRIGGER_UNSPLASH_DOWNLOAD = gql`
  mutation TriggerUnsplashDownload($url: String!) {
    triggerUnsplashDownload(url: $url)
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
  const { t } = useTranslation('apps-journeys-admin')
  const [query, setQuery] = useState<string>()
  const [page, setPage] = useState(1)
  const [collectionId, setCollectionId] = useState(DEFAULT_COLLECTION_ID)

  useEffect(() => {
    setPage(1)
  }, [collectionId])

  const [triggerUnsplashDownload] = useMutation<TriggerUnsplashDownload>(
    TRIGGER_UNSPLASH_DOWNLOAD
  )

  const {
    data: collectionData,
    loading: loadingCollection,
    refetch: refetchCollection,
    fetchMore: fetchMoreCollection
  } = useQuery<ListUnsplashCollectionPhotos>(LIST_UNSPLASH_COLLECTION_PHOTOS, {
    skip: query != null,
    notifyOnNetworkStatusChange: true,
    variables: { collectionId, page, perPage: 20 }
  })

  const {
    data: searchData,
    loading: loadingSearch,
    refetch: refetchSearch,
    fetchMore: fetchMoreSearch
  } = useQuery<SearchUnsplashPhotos>(SEARCH_UNSPLASH_PHOTOS, {
    skip: query == null,
    notifyOnNetworkStatusChange: true,
    variables: { query, page, perPage: 20 }
  })

  async function handleChange(
    src: string,
    unsplashAuthor: UnsplashAuthor,
    downloadLocation: string,
    blurhash?: string,
    width?: number,
    height?: number
  ): Promise<void> {
    onChange(src, unsplashAuthor, blurhash, width, height)
    await triggerUnsplashDownload({ variables: { url: downloadLocation } })
  }

  async function handleSubmit(query: string): Promise<void> {
    setPage(1)
    const variables = { page: 1, perPage: 20 }
    if (query == null) {
      await refetchCollection({ collectionId, ...variables })
    } else {
      await refetchSearch({ query, ...variables })
    }
    setQuery(query)
  }

  async function handleFetchMore(): Promise<void> {
    const newPage = page + 1
    const variables = { page: newPage, perPage: 20 }
    if (query == null) {
      await fetchMoreCollection({
        variables: { collectionId, ...variables },
        updateQuery: (prevResult, { fetchMoreResult }) => {
          // bandage fix, prev result initially returns null for page 1
          if (prevResult.listUnsplashCollectionPhotos == null && page === 1) {
            return {
              listUnsplashCollectionPhotos: [
                ...(collectionData?.listUnsplashCollectionPhotos as CollectionPhotos[]),
                ...fetchMoreResult.listUnsplashCollectionPhotos
              ]
            }
          } else {
            return {
              listUnsplashCollectionPhotos: [
                ...fetchMoreResult.listUnsplashCollectionPhotos
              ]
            }
          }
        }
      })
    } else {
      await fetchMoreSearch({
        variables: { query, ...variables }
      })
    }
    setPage(newPage)
  }

  function handleCollectionChange(id: string, query: string): void {
    setCollectionId(id)
    setQuery(query)
  }

  return (
    <Stack sx={{ p: 6 }} data-testid="UnsplashGallery">
      <UnsplashSearch value={query} handleSubmit={handleSubmit} />
      <UnsplashCollections onClick={handleCollectionChange} />
      <Stack sx={{ pt: 4, pb: 1 }}>
        <Typography variant="overline" color="primary">
          {t('Unsplash')}
        </Typography>
        <Typography variant="h6">{t('Featured Images')}</Typography>
      </Stack>
      {query == null && collectionData != null && (
        <UnsplashList
          gallery={collectionData.listUnsplashCollectionPhotos}
          onChange={handleChange}
        />
      )}
      {query != null && searchData != null && (
        <UnsplashList
          gallery={searchData.searchUnsplashPhotos.results}
          onChange={handleChange}
        />
      )}
      <LoadingButton
        variant="outlined"
        disabled={loadingCollection || loadingSearch}
        onClick={handleFetchMore}
        size="medium"
      >
        {loadingCollection || loadingSearch ? t('Loading...') : t('Load More')}
      </LoadingButton>
    </Stack>
  )
}
