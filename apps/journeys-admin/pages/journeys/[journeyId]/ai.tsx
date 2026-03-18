import { gql, useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import { ReactElement, useCallback, useEffect, useState } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { useJourneyQuery } from '@core/journeys/ui/useJourneyQuery'
import { JourneySimple } from '@core/shared/ai/journeySimpleTypes'

import {
  GetAiEditorJourney,
  GetAiEditorJourneyVariables
} from '../../../__generated__/GetAiEditorJourney'
import {
  GetJourneySimpleForAiEditor,
  GetJourneySimpleForAiEditorVariables
} from '../../../__generated__/GetJourneySimpleForAiEditor'
import { IdType } from '../../../__generated__/globalTypes'
import { AiChat, AiState } from '../../../src/components/AiEditor/AiChat/AiChat'
import { AiEditorHeader } from '../../../src/components/AiEditor/AiEditorHeader'
import { AiEditorPreview } from '../../../src/components/AiEditor/AiEditorPreview'
import {
  getAuthTokens,
  redirectToLogin,
  toUser
} from '../../../src/libs/auth/getAuthTokens'
import { initAndAuthApp } from '../../../src/libs/initAndAuthApp'

const GET_AI_EDITOR_JOURNEY = gql`
  query GetAiEditorJourney($id: ID!) {
    journey: adminJourney(id: $id, idType: databaseId) {
      id
      title
      description
    }
  }
`

const GET_JOURNEY_SIMPLE_FOR_AI_EDITOR = gql`
  query GetJourneySimpleForAiEditor($id: ID!) {
    journeySimpleGet(id: $id)
  }
`

function AiEditorPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const journeyId = router.query.journeyId as string

  const [currentJourney, setCurrentJourney] = useState<JourneySimple | null>(
    null
  )
  const [proposedJourney, setProposedJourney] = useState<JourneySimple | null>(
    null
  )
  const [aiState, setAiState] = useState<AiState>({
    status: 'idle',
    affectedCardIds: []
  })
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)

  const { data, loading } = useQuery<
    GetAiEditorJourney,
    GetAiEditorJourneyVariables
  >(GET_AI_EDITOR_JOURNEY, {
    variables: { id: journeyId },
    skip: journeyId == null
  })

  const { data: simpleData } = useQuery<
    GetJourneySimpleForAiEditor,
    GetJourneySimpleForAiEditorVariables
  >(GET_JOURNEY_SIMPLE_FOR_AI_EDITOR, {
    variables: { id: journeyId },
    skip: journeyId == null
  })

  const { data: journeyData, refetch: refetchJourney } = useJourneyQuery({
    id: journeyId,
    idType: IdType.databaseId,
    options: { skipRoutingFilter: true }
  })

  // Populate currentJourney from the initial fetch
  useEffect(() => {
    if (simpleData?.journeySimpleGet != null && currentJourney == null) {
      setCurrentJourney(simpleData.journeySimpleGet as JourneySimple)
    }
  }, [simpleData, currentJourney])

  const journey = data?.journey

  const previewJourney = proposedJourney ?? currentJourney

  const selectedCardIndex =
    previewJourney != null && selectedCardId != null
      ? previewJourney.cards.findIndex((c) => c.id === selectedCardId) + 1
      : null

  const handleJourneyUpdated = useCallback(
    (updatedJourney: JourneySimple) => {
      setCurrentJourney(updatedJourney)
      setAiState({ status: 'idle', affectedCardIds: [] })
      void refetchJourney()
    },
    [refetchJourney]
  )

  const handleProposedJourney = useCallback((journey: JourneySimple | null) => {
    setProposedJourney(journey)
  }, [])

  const handleSelectedCardChange = useCallback((cardId: string | null) => {
    setSelectedCardId(cardId)
  }, [])

  const handleClearSelectedCard = useCallback(() => {
    setSelectedCardId(null)
  }, [])

  if (loading || journeyId == null) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <>
      <NextSeo
        title={
          journey?.title != null
            ? t('AI Edit — {{title}}', { title: journey.title })
            : t('AI Editor')
        }
      />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden'
        }}
      >
        <AiEditorHeader
          journeyId={journeyId}
          journeyTitle={journey?.title ?? t('Untitled Journey')}
        />
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <AiChat
            journeyId={journeyId}
            currentJourney={currentJourney}
            selectedCardId={selectedCardId}
            selectedCardIndex={
              selectedCardIndex != null && selectedCardIndex > 0
                ? selectedCardIndex
                : null
            }
            onClearSelectedCard={handleClearSelectedCard}
            onAiState={setAiState}
            onProposedJourney={handleProposedJourney}
            onJourneyUpdated={handleJourneyUpdated}
            sx={{
              width: { xs: '100%', md: '40%' },
              display: {
                xs: selectedCardId != null ? 'none' : 'flex',
                md: 'flex'
              }
            }}
          />
          <JourneyProvider
            value={{ journey: journeyData?.journey, variant: 'admin' }}
          >
            {previewJourney != null ? (
              <AiEditorPreview
                journey={previewJourney}
                aiState={aiState}
                onSelectedCardChange={handleSelectedCardChange}
                sx={{ flex: 1, display: { xs: 'none', md: 'flex' } }}
              />
            ) : (
              <Box
                sx={{
                  flex: 1,
                  display: { xs: 'none', md: 'flex' },
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'background.default'
                }}
              >
                <CircularProgress />
              </Box>
            )}
          </JourneyProvider>
        </Box>
      </Box>
    </>
  )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const journeyId = Array.isArray(ctx.query?.journeyId)
    ? ctx.query.journeyId[0]
    : ctx.query?.journeyId

  if (journeyId == null) return { notFound: true as const }

  const tokens = await getAuthTokens(ctx)
  if (tokens == null) return redirectToLogin(ctx)

  const user = toUser(tokens)
  const { flags, redirect, translations } = await initAndAuthApp({
    user,
    locale: ctx.locale,
    resolvedUrl: ctx.resolvedUrl
  })

  if (redirect != null) return { redirect }

  return {
    props: {
      userSerialized: JSON.stringify(user),
      ...translations,
      flags
    }
  }
}

export default AiEditorPage
