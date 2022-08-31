import { isThisYear, parseISO, intlFormat } from 'date-fns'
import { ReactElement, useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import ArchiveRoundedIcon from '@mui/icons-material/ArchiveRounded'
import EditIcon from '@mui/icons-material/Edit'
import CancelRoundedIcon from '@mui/icons-material/CancelRounded'
import EventRounded from '@mui/icons-material/EventRounded'
import TranslateRounded from '@mui/icons-material/TranslateRounded'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { JourneyStatus } from '../../../../../__generated__/globalTypes'
import { TemplateLanguage } from './TemplateLanguage'

interface JourneyDetailsProps {
  isPublisher?: boolean
}

export function JourneyDetails({
  isPublisher
}: JourneyDetailsProps): ReactElement {
  const { journey } = useJourney()
  const [localLanguage, setLocalLanguage] = useState<string | undefined>()
  const [nativeLanguage, setNativeLanguage] = useState<string | undefined>()

  const options = [
    {
      journeyStatus: JourneyStatus.draft,
      text: 'Draft',
      icon: <EditIcon color="warning" fontSize="small" />
    },
    {
      journeyStatus: JourneyStatus.published,
      text: 'Published',
      icon: <CheckCircleRoundedIcon color="success" fontSize="small" />
    },
    {
      journeyStatus: JourneyStatus.archived,
      text: 'Archived',
      icon: <ArchiveRoundedIcon color="disabled" fontSize="small" />
    },
    {
      journeyStatus: JourneyStatus.trashed,
      text: 'Trash',
      icon: <CancelRoundedIcon color="error" fontSize="small" />
    }
  ]

  const currentStatus = options.find(
    (option) => option.journeyStatus === journey?.status
  )

  useEffect(() => {
    setLocalLanguage(
      journey?.language.name.find(({ primary }) => !primary)?.value
    )
    setNativeLanguage(
      journey?.language.name.find(({ primary }) => primary)?.value
    )
  }, [journey])
  return (
    <>
      {journey?.template === true ? (
        <TemplateLanguage
          isPublisher={isPublisher}
          localLanguage={localLanguage}
          nativeLanguage={nativeLanguage}
        />
      ) : (
        <>
          <Box sx={{ display: 'flex', flexDirection: 'row' }}>
            {journey != null && currentStatus != null ? (
              <>{currentStatus.icon}</>
            ) : (
              <EditIcon fontSize="small" />
            )}

            <Typography variant="body2" data-testid="status" sx={{ ml: 2 }}>
              {journey != null && currentStatus != null ? (
                currentStatus.text
              ) : (
                <Skeleton variant="text" width={30} />
              )}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'row', mt: 2 }}>
            <EventRounded fontSize="small" />
            <Typography
              variant="body2"
              data-testid="created-at-date"
              sx={{ ml: 2 }}
            >
              {journey != null ? (
                intlFormat(parseISO(journey.createdAt), {
                  day: 'numeric',
                  month: 'long',
                  year: isThisYear(parseISO(journey.createdAt))
                    ? undefined
                    : 'numeric'
                })
              ) : (
                <Skeleton variant="text" width={120} />
              )}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'row', mt: 2 }}>
            <TranslateRounded fontSize="small" />
            <Typography variant="body2" sx={{ ml: 2 }}>
              {journey != null ? (
                <span>
                  {localLanguage ?? nativeLanguage}
                  {localLanguage != null &&
                    localLanguage !== nativeLanguage &&
                    nativeLanguage && <span>&nbsp;({nativeLanguage})</span>}
                </span>
              ) : (
                <Skeleton variant="text" width={40} />
              )}
            </Typography>
          </Box>
        </>
      )}
    </>
  )
}
