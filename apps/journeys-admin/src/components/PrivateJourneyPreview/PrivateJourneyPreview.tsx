import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { TreeBlock, transformer } from '@core/journeys/ui/block'
import { ChatOverlayProvider } from '@core/journeys/ui/ChatOverlayProvider'
import { Conductor } from '@core/journeys/ui/Conductor'
import { googleFontsHref } from '@core/journeys/ui/fonts/googleFontsHref'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JOURNEY_FIELDS } from '@core/journeys/ui/JourneyProvider/journeyFields'
import { StepFields } from '@core/journeys/ui/Step/__generated__/StepFields'
import { WebsiteView } from '@core/journeys/ui/WebsiteView'

import {
  GetPrivateJourneyPreview,
  GetPrivateJourneyPreviewVariables
} from '../../../__generated__/GetPrivateJourneyPreview'
import { useAuth } from '../../libs/auth'

export const GET_PRIVATE_JOURNEY_PREVIEW = gql`
  ${JOURNEY_FIELDS}
  query GetPrivateJourneyPreview($id: ID!, $expectedRevision: String) {
    journey: journeyPreview(id: $id, expectedRevision: $expectedRevision) {
      ...JourneyFields
    }
  }
`

export function PrivateJourneyPreview({
  journeyId,
  revision
}: {
  journeyId: string
  revision?: string
}): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const { user } = useAuth()
  const { data, loading, error } = useQuery<
    GetPrivateJourneyPreview,
    GetPrivateJourneyPreviewVariables
  >(GET_PRIVATE_JOURNEY_PREVIEW, {
    variables: { id: journeyId, expectedRevision: revision },
    fetchPolicy: 'no-cache',
    skip: user == null || user.isAnonymous,
    ssr: false
  })
  if (user == null || user.isAnonymous || error)
    return (
      <Alert severity="error">
        {t(
          'Preview unavailable. Check your access or request a new preview of the saved draft.'
        )}
      </Alert>
    )
  if (loading || !data)
    return <CircularProgress aria-label={t('Loading preview')} />
  const journey = data.journey
  const blocks = transformer(journey.blocks ?? [])
  const step =
    blocks.find((block) => block.id === router.query.stepId) ?? blocks[0]
  if (!step)
    return (
      <Alert severity="info">{t('This journey has no saved cards.')}</Alert>
    )
  return (
    <Stack>
      <Head>
        <link rel="stylesheet" href={googleFontsHref(journey.journeyTheme)} />
      </Head>
      <Alert
        severity="info"
        action={
          <Button
            component="a"
            href={`/journeys/${encodeURIComponent(journeyId)}`}
          >
            {t('Open in Admin')}
          </Button>
        }
      >
        {t(
          'Private preview of saved content. Visitor events, submissions and external actions are disabled. Publish from the Admin editor.'
        )}
      </Alert>
      <Box
        onClickCapture={(event) => {
          if ((event.target as Element).closest('a')) {
            event.preventDefault()
            event.stopPropagation()
          }
        }}
      >
        <JourneyProvider value={{ journey, renderMode: 'preview' }}>
          <ChatOverlayProvider journeyId={journey.id}>
            {journey.website === true ? (
              <WebsiteView
                blocks={blocks}
                stepBlock={step as TreeBlock<StepFields>}
              />
            ) : (
              <Conductor blocks={blocks} startStepId={step.id} />
            )}
          </ChatOverlayProvider>
        </JourneyProvider>
      </Box>
    </Stack>
  )
}
