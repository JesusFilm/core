import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import {
  ActiveJourneyEditContent,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import EyeOpenIcon from '@core/shared/ui/icons/EyeOpen'

import { useCustomDomainsQuery } from '../../../libs/useCustomDomainsQuery/useCustomDomainsQuery'

import { Analytics } from './Analytics'
import { DeleteBlock } from './DeleteBlock'
import { DuplicateBlock } from './DuplicateBlock'
import { Menu } from './Menu'

export function EditToolbar(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const { state } = useEditor()
  const { data: customDomains, hasCustomDomain } = useCustomDomainsQuery({
    variables: { teamId: journey?.team?.id as string }
  })

  const hostName = hasCustomDomain
    ? new URL('https://' + customDomains?.customDomains[0].name).hostname
    : undefined

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="flex-end"
      flexGrow={1}
    >
      {journey != null && (
        <>
          <Analytics journey={journey} variant="button" />
          <Chip
            icon={<EyeOpenIcon />}
            label={t('Preview')}
            component="a"
            href={`/api/preview?slug=${journey.slug}&hostname=${hostName}`}
            target="_blank"
            variant="outlined"
            clickable
            sx={{
              display: {
                xs: 'none',
                md: 'flex'
              }
            }}
          />
          <IconButton
            aria-label="Preview"
            href={`/api/preview?slug=${journey.slug}&hostname=${hostName}`}
            target="_blank"
            sx={{
              display: {
                xs: 'flex',
                md: 'none'
              }
            }}
          >
            <EyeOpenIcon />
          </IconButton>
        </>
      )}

      <DeleteBlock
        variant="button"
        disabled={
          state.journeyEditContentComponent !== ActiveJourneyEditContent.Canvas
        }
      />
      <DuplicateBlock
        variant="button"
        disabled={
          state.journeyEditContentComponent !==
            ActiveJourneyEditContent.Canvas ||
          state.selectedBlock?.__typename === 'VideoBlock'
        }
      />
      <Menu />
    </Stack>
  )
}
