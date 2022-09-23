import { ReactElement } from 'react'
import { parseISO, intlFormat } from 'date-fns'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import TagManager from 'react-gtm-module'
import { useMutation, gql } from '@apollo/client'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import VisibilityIcon from '@mui/icons-material/Visibility'
import Skeleton from '@mui/material/Skeleton'
import NextLink from 'next/link'
import { TemplatePreviewEventCreate } from '../../../../__generated__/TemplatePreviewEventCreate'

export const TEMPLATE_PREVIEW_EVENT_CREATE = gql`
  mutation TemplatePreviewEventCreate($input: TemplatePreviewEventInput!) {
    templatePreviewEventCreate(input: $input) {
      id
      userId
      journeyId
    }
  }
`

export function DatePreview(): ReactElement {
  const { journey } = useJourney()
  const [templatePreviewEventCreate] = useMutation<TemplatePreviewEventCreate>(
    TEMPLATE_PREVIEW_EVENT_CREATE
  )

  async function handleClick(): Promise<void> {
    if (journey == null) return
    const { data } = await templatePreviewEventCreate({
      variables: {
        input: {
          journeyId: journey.id
        }
      }
    })
    if (data?.templatePreviewEventCreate != null) {
      const { id, journeyId, userId } = data.templatePreviewEventCreate
      TagManager.dataLayer({
        dataLayer: {
          event: 'template_preview',
          eventId: id,
          journeyId,
          userId
        }
      })
    }
  }

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      sx={{ alignItems: 'center' }}
    >
      <Typography variant="overline" sx={{ color: 'secondary.light' }}>
        {journey != null ? (
          intlFormat(parseISO(journey.createdAt), {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })
        ) : (
          <Skeleton variant="text" width="100px" />
        )}
      </Typography>
      <NextLink
        href={journey != null ? `/api/preview?slug=${journey.slug}` : ''}
        passHref
      >
        <Button
          startIcon={<VisibilityIcon />}
          variant="outlined"
          size="small"
          color="secondary"
          target="_blank"
          rel="noopener"
          component="a"
          disabled={journey == null}
          style={{ borderRadius: 8 }}
          onClick={handleClick}
        >
          Preview
        </Button>
      </NextLink>
    </Stack>
  )
}
