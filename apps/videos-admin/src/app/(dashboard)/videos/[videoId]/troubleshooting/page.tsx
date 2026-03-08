'use client'

import { useLazyQuery, useMutation } from '@apollo/client'
import Stack from '@mui/material/Stack'
import { useParams } from 'next/navigation'
import { ReactElement, useState } from 'react'

import { graphql } from '@core/shared/gql'

import { TroubleshootingActions } from './_TroubleshootingActions/TroubleshootingActions'
import { TroubleshootingFeedback } from './_TroubleshootingFeedback/TroubleshootingFeedback'
import {
  CheckVideoInAlgoliaResult,
  CheckVideoVariantsInAlgoliaResult,
  TroubleshootingResults
} from './_TroubleshootingResults/TroubleshootingResults'

const GET_VIDEO_LANGUAGES = graphql(`
  query GetVideoLanguages($videoId: ID!) {
    adminVideo(id: $videoId) {
      id
      title {
        value
      }
      availableLanguages
    }
  }
`)

const FIX_VIDEO_LANGUAGES = graphql(`
  mutation FixVideoLanguages($videoId: ID!) {
    fixVideoLanguages(videoId: $videoId)
  }
`)

const CHECK_VIDEO_IN_ALGOLIA = graphql(`
  query CheckVideoInAlgolia($videoId: ID!) {
    checkVideoInAlgolia(videoId: $videoId) {
      ok
      error
      mismatches {
        field
        expected
        actual
      }
      recordUrl
    }
  }
`)

const CHECK_VIDEO_VARIANTS_IN_ALGOLIA = graphql(`
  query CheckVideoVariantsInAlgolia($videoId: ID!) {
    checkVideoVariantsInAlgolia(videoId: $videoId) {
      ok
      missingVariants
      browseUrl
    }
  }
`)

const UPDATE_VIDEO_ALGOLIA_INDEX = graphql(`
  mutation UpdateVideoAlgoliaIndex($videoId: ID!) {
    updateVideoAlgoliaIndex(videoId: $videoId)
  }
`)

const UPDATE_VIDEO_VARIANT_ALGOLIA_INDEX = graphql(`
  mutation UpdateVideoVariantAlgoliaIndex($videoId: ID!) {
    updateVideoVariantAlgoliaIndex(videoId: $videoId)
  }
`)

export default function TroubleshootingPage(): ReactElement {
  const { videoId } = useParams<{ videoId: string }>()
  const [lastUpdateVideoAlgoliaSucceeded, setLastUpdateVideoAlgoliaSucceeded] =
    useState<boolean | null>(null)
  const [
    lastUpdateVariantsAlgoliaSucceeded,
    setLastUpdateVariantsAlgoliaSucceeded
  ] = useState<boolean | null>(null)

  const [getLanguages, { data, loading, error }] = useLazyQuery(
    GET_VIDEO_LANGUAGES,
    {
      variables: { videoId }
    }
  )

  const [
    fixLanguages,
    { loading: fixLoading, error: fixError, data: fixData }
  ] = useMutation(FIX_VIDEO_LANGUAGES, {
    variables: { videoId },
    refetchQueries: [
      {
        query: GET_VIDEO_LANGUAGES,
        variables: { videoId }
      }
    ]
  })

  const [
    checkVideoInAlgolia,
    {
      data: algoliaVideoData,
      loading: algoliaVideoLoading,
      error: algoliaVideoError
    }
  ] = useLazyQuery(CHECK_VIDEO_IN_ALGOLIA, {
    variables: { videoId }
  })

  const [
    checkVideoVariantsInAlgolia,
    {
      data: algoliaVariantsData,
      loading: algoliaVariantsLoading,
      error: algoliaVariantsError
    }
  ] = useLazyQuery(CHECK_VIDEO_VARIANTS_IN_ALGOLIA, {
    variables: { videoId }
  })

  const [
    updateVideoAlgolia,
    { loading: updateVideoAlgoliaLoading, error: updateVideoAlgoliaError }
  ] = useMutation(UPDATE_VIDEO_ALGOLIA_INDEX, {
    variables: { videoId },
    onCompleted: () => {
      setLastUpdateVideoAlgoliaSucceeded(true)
    },
    onError: () => {
      setLastUpdateVideoAlgoliaSucceeded(false)
    },
    refetchQueries: [
      {
        query: CHECK_VIDEO_IN_ALGOLIA,
        variables: { videoId }
      }
    ]
  })

  const [
    updateVideoVariantsAlgolia,
    { loading: updateVariantsAlgoliaLoading, error: updateVariantsAlgoliaError }
  ] = useMutation(UPDATE_VIDEO_VARIANT_ALGOLIA_INDEX, {
    variables: { videoId },
    onCompleted: () => {
      setLastUpdateVariantsAlgoliaSucceeded(true)
    },
    onError: () => {
      setLastUpdateVariantsAlgoliaSucceeded(false)
    },
    refetchQueries: [
      {
        query: CHECK_VIDEO_VARIANTS_IN_ALGOLIA,
        variables: { videoId }
      }
    ]
  })

  const handleFetchLanguages = (): void => {
    void getLanguages()
  }

  const handleFixLanguages = (): void => {
    void fixLanguages()
  }

  const handleCheckAlgoliaVideo = (): void => {
    void checkVideoInAlgolia()
  }

  const handleCheckAlgoliaVariants = (): void => {
    void checkVideoVariantsInAlgolia()
  }

  const handleUpdateVideoAlgolia = (): void => {
    setLastUpdateVideoAlgoliaSucceeded(null)
    void updateVideoAlgolia()
  }

  const handleUpdateVariantsAlgolia = (): void => {
    setLastUpdateVariantsAlgoliaSucceeded(null)
    void updateVideoVariantsAlgolia()
  }

  const algoliaVideoResult = (algoliaVideoData?.checkVideoInAlgolia ??
    null) as unknown as CheckVideoInAlgoliaResult | null
  const algoliaVariantsResult =
    (algoliaVariantsData?.checkVideoVariantsInAlgolia ??
      null) as unknown as CheckVideoVariantsInAlgoliaResult | null

  const videoTitle =
    (data?.adminVideo.title as Array<{ value: string }> | undefined)?.[0]
      ?.value ?? 'N/A'
  const availableLanguages =
    (data?.adminVideo.availableLanguages as string[] | undefined) ?? []

  return (
    <Stack spacing={4}>
      <TroubleshootingActions
        loadingLanguages={loading}
        fixingLanguages={fixLoading}
        checkingAlgoliaVideo={algoliaVideoLoading}
        checkingAlgoliaVariants={algoliaVariantsLoading}
        updatingAlgoliaVideo={updateVideoAlgoliaLoading}
        updatingAlgoliaVariants={updateVariantsAlgoliaLoading}
        handleFetchLanguages={handleFetchLanguages}
        handleFixLanguages={handleFixLanguages}
        handleCheckAlgoliaVideo={handleCheckAlgoliaVideo}
        handleCheckAlgoliaVariants={handleCheckAlgoliaVariants}
        handleUpdateVideoAlgolia={handleUpdateVideoAlgolia}
        handleUpdateVariantsAlgolia={handleUpdateVariantsAlgolia}
      />

      <TroubleshootingFeedback
        loadingLanguages={loading}
        fixingLanguages={fixLoading}
        checkingAlgoliaVideo={algoliaVideoLoading}
        checkingAlgoliaVariants={algoliaVariantsLoading}
        updatingAlgoliaVideo={updateVideoAlgoliaLoading}
        updatingAlgoliaVariants={updateVariantsAlgoliaLoading}
        languagesErrorMessage={error?.message}
        fixLanguagesErrorMessage={fixError?.message}
        algoliaVideoErrorMessage={algoliaVideoError?.message}
        algoliaVariantsErrorMessage={algoliaVariantsError?.message}
        updateVideoErrorMessage={updateVideoAlgoliaError?.message}
        updateVariantsErrorMessage={updateVariantsAlgoliaError?.message}
        showFixSuccess={fixData != null}
        showUpdateVideoSuccess={
          lastUpdateVideoAlgoliaSucceeded === true &&
          updateVideoAlgoliaError == null
        }
        showUpdateVariantsSuccess={
          lastUpdateVariantsAlgoliaSucceeded === true &&
          updateVariantsAlgoliaError == null
        }
      />

      <TroubleshootingResults
        showAlgoliaVideoStatus={algoliaVideoData != null}
        algoliaVideoResult={algoliaVideoResult}
        showAlgoliaVariantsStatus={algoliaVariantsData != null}
        algoliaVariantsResult={algoliaVariantsResult}
        showVideoInformation={data != null}
        videoTitle={videoTitle}
        availableLanguages={availableLanguages}
      />
    </Stack>
  )
}
