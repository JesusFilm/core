import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
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
        <Stack
          data-testid="JourneyDetails"
          sx={{
            px: { xs: 4, sm: 0 },
            py: { xs: 1, sm: 0 },
            gap: { xs: 2, sm: 0 },
            width: { xs: 220, sm: '100%' }
          }}
        >
          <Typography
            sx={{
              display: { xs: '-webkit-box', sm: 'unset' },
              '-webkit-line-clamp': { xs: '2', sm: '1' },
              '-webkit-box-orient': 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              color: 'secondary.dark',
              typography: { xs: 'subtitle2', sm: 'subtitle1' }
            }}
          >
            {journey.title}
          </Typography>
          <Box
            sx={{
              display: { xs: '-webkit-box', sm: 'unset' },
              typography: { xs: 'caption', sm: 'body2' },
              '-webkit-line-clamp': { xs: '2', sm: '1' },
              '-webkit-box-orient': 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              color: 'secondary.light'
            }}
          >
            <Globe1Icon
              sx={{
                position: 'relative',
                top: '3px',
                mr: 1,
                fontSize: 16,
                color: { xs: 'secondary.light', sm: 'secondary.main' }
              }}
            />
            <Typography
              sx={{
                display: 'inline',
                typography: { xs: 'caption', sm: 'body2' },
                fontWeight: { xs: 600, sm: 'initial' },
                color: { xs: 'secondary.light', sm: 'secondary.main' }
              }}
            >
              {language}
            </Typography>
            {journey.description !== '' && journey.description != null ? (
              <Typography
                data-testid="DescriptionDot"
                sx={{
                  display: 'inline',
                  typography: { xs: 'caption', sm: 'body2' },
                  px: 1,
                  color: 'secondary.light'
                }}
              >
                •
              </Typography>
            ) : null}
            <Typography
              sx={{
                display: { xs: 'inline', sm: 'unset' },
                typography: { xs: 'caption', sm: 'body2' },
                color: 'secondary.light'
              }}
            >
              {journey.description}
            </Typography>
          </Box>
        </Stack>
      ) : (
        <Stack sx={{ px: 4, py: 1, width: { xs: 220, sm: 500 } }}>
          <Typography variant="subtitle2">
            <Skeleton width="40%" />
          </Typography>
          <Typography variant="caption">
            <Skeleton width="80%" />
          </Typography>
        </Stack>
      )}
    </>
  )
}
