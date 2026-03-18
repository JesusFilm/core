import { gql, useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import { ReactElement, useCallback, useState } from 'react'

import { JourneySimple } from '@core/shared/ai/journeySimpleTypes'

import {
  GetAiEditorJourney,
  GetAiEditorJourneyVariables
} from '../../../__generated__/GetAiEditorJourney'
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

function AiEditorPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const journeyId = router.query.journeyId as string

  const [currentJourney, setCurrentJourney] = useState<JourneySimple | null>(
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

  const journey = data?.journey

  const selectedCardIndex =
    currentJourney != null && selectedCardId != null
      ? currentJourney.cards.findIndex((c) => c.id === selectedCardId) + 1
      : null

  const handleJourneyUpdated = useCallback((updatedJourney: JourneySimple) => {
    setCurrentJourney(updatedJourney)
    setAiState({ status: 'idle', affectedCardIds: [] })
  }, [])

  const handleSelectedCardChange = useCallback(
    (cardId: string | null) => {
      setSelectedCardId(cardId)
    },
    []
  )

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
            onJourneyUpdated={handleJourneyUpdated}
            sx={{
              width: { xs: '100%', md: '40%' },
              display: {
                xs: selectedCardId != null ? 'none' : 'flex',
                md: 'flex'
              }
            }}
          />
          {currentJourney != null ? (
            <AiEditorPreview
              journey={currentJourney}
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
              <Typography variant="body2" color="text.secondary" align="center">
                {t('Start chatting to see your journey preview')}
              </Typography>
            </Box>
          )}
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
