import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Globe1Icon from '@core/shared/ui/icons/Globe1'

export function JourneyDetails(): ReactElement {
  const { journey } = useJourney()
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const language = journey?.language.name.find(
    ({ primary }) => primary != null
  )?.value

  const titleVariant = smUp ? 'subtitle1' : 'subtitle2'
  const languageVariant = smUp ? 'body2' : 'caption'

  return (
    <>
      {journey != null ? (
        <Stack
          sx={{
            px: 4,
            py: 1,
            spacing: { xs: 2, sm: 0 },
            width: { xs: 220, sm: '100%' }
          }}
        >
          <Typography
            variant={titleVariant}
            sx={{
              display: { xs: '-webkit-box', sm: 'unset' },
              '-webkit-line-clamp': { xs: '2', sm: '1' },
              '-webkit-box-orient': 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              color: 'secondary.dark'
            }}
          >
            {journey.title}
          </Typography>
          <Box
            sx={{
              display: { xs: '-webkit-box', sm: 'unset' },
              '-webkit-line-clamp': { xs: '2', sm: '1' },
              '-webkit-box-orient': 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              color: 'secondary.light',
              typography: { xs: 'caption', sm: 'body2' }
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
              variant={languageVariant}
              sx={{
                display: 'inline',
                fontWeight: { xs: 600, sm: 'initial' },
                color: { xs: 'secondary.light', sm: 'secondary.main' }
              }}
            >
              {language}
            </Typography>
            {journey.description !== '' && journey.description != null ? (
              <Typography
                data-testid="DescriptionDot"
                variant={languageVariant}
                sx={{ display: 'inline', px: 1, color: 'secondary.light' }}
              >
                •
              </Typography>
            ) : null}
            <Typography
              variant={languageVariant}
              sx={{
                display: { xs: 'inline', sm: 'unset' },
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
