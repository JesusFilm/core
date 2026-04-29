import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Globe1Icon from '@core/shared/ui/icons/Globe1'

export function JourneyDetails(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const nativeName = journey?.language?.name.find(
    ({ primary }) => !primary
  )?.value

  const localName = journey?.language?.name.find(
    ({ primary }) => primary
  )?.value

  return (
    <>
      {journey != null ? (
        <Stack
          sx={{
            px: { xs: 4, md: 0 },
            py: { xs: 1, md: 0 },
            gap: { xs: 2, md: 0 },
            maxWidth: { xs: 220, md: '100%' }
          }}
        >
          <Stack
            direction="row"
            alignItems={{ xs: 'flex-start', md: 'center' }}
            gap={1}
            sx={{ minWidth: 0 }}
          >
            <Typography
              sx={{
                display: { xs: '-webkit-box', md: 'unset' },
                '-webkit-line-clamp': { xs: '2', md: '1' },
                '-webkit-box-orient': 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                color: 'secondary.dark',
                typography: { xs: 'subtitle2', md: 'subtitle1' },
                minWidth: 0,
                flexShrink: 1
              }}
            >
              {journey.title}
            </Typography>
            {journey.template === true && (
              <Chip
                label={t('TEMPLATE')}
                data-testid="TemplateBadge"
                sx={{
                  flexShrink: 0,
                  height: 28,
                  borderRadius: '4px',
                  bgcolor: '#DEDFE0',
                  color: '#444451',
                  fontFamily: '"Open Sans", sans-serif',
                  fontSize: 14,
                  fontWeight: 600,
                  lineHeight: '20px',
                  '& .MuiChip-label': {
                    px: 1
                  }
                }}
              />
            )}
          </Stack>
          <Box
            sx={{
              display: { xs: '-webkit-box', md: 'flex' },
              typography: { xs: 'caption', md: 'body2' },
              '-webkit-line-clamp': { xs: '2', md: '1' },
              '-webkit-box-orient': 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              color: 'secondary.light'
            }}
          >
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                verticalAlign: { xs: 'bottom', md: 'unset' }
              }}
            >
              <Globe1Icon
                sx={{
                  mr: 1,
                  fontSize: 16,
                  color: 'secondary.main'
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  display: 'inline',
                  color: 'secondary.dark'
                }}
              >
                {localName ?? nativeName}
              </Typography>
              {journey.description !== '' && journey.description != null ? (
                <Typography
                  variant="body2"
                  data-testid="DescriptionDot"
                  sx={{
                    display: 'inline',
                    px: 1,
                    color: 'secondary.dark'
                  }}
                >
                  •
                </Typography>
              ) : null}
            </Box>
            <Typography
              variant="body2"
              data-testid="JourneyDescription"
              sx={{
                display: { xs: 'inline', md: 'unset' },
                color: 'secondary.light',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
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
