import ArchiveRoundedIcon from '@mui/icons-material/ArchiveRounded'
import CancelRoundedIcon from '@mui/icons-material/CancelRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import EditIcon from '@mui/icons-material/Edit'
import EventRounded from '@mui/icons-material/EventRounded'
import TranslateRounded from '@mui/icons-material/TranslateRounded'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import { intlFormat, isThisYear, parseISO } from 'date-fns'
import { ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { JourneyStatus } from '../../../../../__generated__/globalTypes'
import { JourneyType } from '../../JourneyView'

import { Language } from './Language'

interface JourneyDetailsProps {
  journeyType: JourneyType
  isPublisher?: boolean
}

export function JourneyDetails({
  journeyType,
  isPublisher
}: JourneyDetailsProps): ReactElement {
  const { journey } = useJourney()

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

  return (
    <>
      {journeyType === 'Template' ? (
        <Language isPublisher={isPublisher} />
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
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              mt: 2
            }}
          >
            <TranslateRounded fontSize="small" />
            <Language />
          </Box>
        </>
      )}
    </>
  )
}
