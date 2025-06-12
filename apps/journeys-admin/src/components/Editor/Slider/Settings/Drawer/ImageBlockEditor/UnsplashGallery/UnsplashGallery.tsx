import { gql, useQuery } from '@apollo/client'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import Plus2Icon from '@core/shared/ui/icons/Plus2'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../../__generated__/BlockFields'
import { ImageBlockUpdateInput } from '../../../../../../../../__generated__/globalTypes'
import {
  ListUnsplashCollectionPhotos,
  ListUnsplashCollectionPhotosVariables
} from '../../../../../../../../__generated__/ListUnsplashCollectionPhotos'
import {
  SearchUnsplashPhotos,
  SearchUnsplashPhotosVariables
} from '../../../../../../../../__generated__/SearchUnsplashPhotos'

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
        raw
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
          raw
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

export interface UnsplashAuthor {
  fullname: string
  username: string
  src: string
}

interface UnsplashGalleryProps {
  selectedBlock?: ImageBlock | null
  onChange: (input: ImageBlockUpdateInput) => void
}

const PER_PAGE = 20

export function UnsplashGallery({
  selectedBlock,
  onChange
}: UnsplashGalleryProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [query, setQuery] = useState('')
  const [collectionId, setCollectionId] = useState(DEFAULT_COLLECTION_ID)

  const {
    data: collectionData,
    loading: loadingCollection,
    fetchMore: fetchMoreCollection
  } = useQuery<
    ListUnsplashCollectionPhotos,
    ListUnsplashCollectionPhotosVariables
  >(LIST_UNSPLASH_COLLECTION_PHOTOS, {
    skip: query !== '',
    notifyOnNetworkStatusChange: true,
    variables: { collectionId, page: 1, perPage: PER_PAGE }
  })

  const {
    data: searchData,
    loading: loadingSearch,
    fetchMore: fetchMoreSearch
  } = useQuery<SearchUnsplashPhotos, SearchUnsplashPhotosVariables>(
    SEARCH_UNSPLASH_PHOTOS,
    {
      skip: query === '',
      notifyOnNetworkStatusChange: true,
      variables: { query, page: 1, perPage: PER_PAGE }
    }
  )

  const loading = query === '' ? loadingCollection : loadingSearch
  const gallery =
    query === ''
      ? (collectionData?.listUnsplashCollectionPhotos ?? [])
      : (searchData?.searchUnsplashPhotos.results ?? [])

  async function handleSubmit(query: string): Promise<void> {
    setQuery(query)
  }

  async function handleFetchMore(): Promise<void> {
    if (query === '') {
      await fetchMoreCollection({
        variables: {
          page: Math.ceil(
            (collectionData?.listUnsplashCollectionPhotos.length ?? 0) /
              PER_PAGE +
              1
          )
        }
      })
    } else {
      await fetchMoreSearch({
        variables: {
          page: Math.ceil(
            (searchData?.searchUnsplashPhotos.results.length ?? 0) / PER_PAGE +
              1
          )
        }
      })
    }
  }

  function handleCollectionChange(id: string): void {
    setCollectionId(id)
    setQuery('')
  }

  return (
    <Stack sx={{ p: 6 }} data-testid="UnsplashGallery">
      <UnsplashSearch value={query} handleSubmit={handleSubmit} />
      <UnsplashCollections
        selectedCollectionId={query === '' ? collectionId : undefined}
        onClick={handleCollectionChange}
      />
      <Stack sx={{ pt: 4, pb: 1 }}>
        <Typography variant="overline" color="primary">
          {t('Unsplash')}
        </Typography>
        <Typography variant="h6">{t('Featured Images')}</Typography>
      </Stack>
      <UnsplashList
        selectedBlock={selectedBlock}
        gallery={gallery}
        onChange={onChange}
      />
      <Button
        variant="outlined"
        onClick={handleFetchMore}
        loading={loading}
        startIcon={<Plus2Icon />}
        size="medium"
      >
        {loading ? t('Loading...') : t('Load More')}
      </Button>
    </Stack>
  )
}
