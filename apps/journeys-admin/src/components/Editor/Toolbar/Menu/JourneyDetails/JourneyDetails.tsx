import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Globe1Icon from '@core/shared/ui/icons/Globe1'

export function JourneyDetails(): ReactElement {
  const { journey } = useJourney()
  const language = journey?.language.name.find(
    ({ primary }) => primary != null
  )?.value

  return (
    <>
      {journey != null ? (
        <Stack spacing={2} sx={{ px: 4, py: 1 }}>
          <Typography
            variant="subtitle2"
            sx={{
              display: '-webkit-box',
              '-webkit-line-clamp': '2',
              '-webkit-box-orient': 'vertical',
              overflow: 'hidden',
              color: 'secondary.dark'
            }}
          >
            {journey.title}
          </Typography>
          <Box>
            <Globe1Icon
              sx={{
                position: 'relative',
                top: '3px',
                mr: 1,
                fontSize: 16,
                color: 'secondary.light'
              }}
            />
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: 'secondary.light'
              }}
            >
              {language}
            </Typography>
            {journey.description !== '' && journey.description != null ? (
              <Typography
                data-testid="DescriptionDot"
                variant="caption"
                sx={{ display: 'inline', px: 1, color: 'secondary.light' }}
              >
                •
              </Typography>
            ) : null}
            <Typography
              variant="caption"
              sx={{ display: 'inline', color: 'secondary.light' }}
            >
              {journey.description}
            </Typography>
          </Box>
        </Stack>
      ) : null}
    </>
  )
}
