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
            px: { xs: 4, md: 0 },
            py: { xs: 1, md: 0 },
            gap: { xs: 2, md: 0 },
            maxWidth: { xs: 220, md: '100%' }
          }}
        >
          <Typography
            sx={{
              display: { xs: '-webkit-box', md: 'unset' },
              '-webkit-line-clamp': { xs: '2', md: '1' },
              '-webkit-box-orient': 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              color: 'secondary.dark',
              typography: { xs: 'subtitle2', md: 'subtitle1' }
            }}
          >
            {journey.title}
          </Typography>
          <Box
            sx={{
              display: { xs: '-webkit-box', md: 'unset' },
              typography: { xs: 'caption', md: 'body2' },
              '-webkit-line-clamp': { xs: '2', md: '1' },
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
                color: { xs: 'secondary.light', md: 'secondary.main' }
              }}
            />
            <Typography
              sx={{
                display: 'inline',
                typography: { xs: 'caption', md: 'body2' },
                fontWeight: { xs: 600, md: 'initial' },
                color: { xs: 'secondary.light', md: 'secondary.main' }
              }}
            >
              {language}
            </Typography>
            {journey.description !== '' && journey.description != null ? (
              <Typography
                data-testid="DescriptionDot"
                sx={{
                  display: 'inline',
                  typography: { xs: 'caption', md: 'body2' },
                  px: 1,
                  color: 'secondary.light'
                }}
              >
                •
              </Typography>
            ) : null}
            <Typography
              sx={{
                display: { xs: 'inline', md: 'unset' },
                typography: { xs: 'caption', md: 'body2' },
                color: 'secondary.light'
              }}
            >
              {journey.description}
            </Typography>
          </Box>
        </Stack>
      ) : (
        <Stack sx={{ px: 4, py: 1, width: { xs: 220, md: 500 } }}>
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
