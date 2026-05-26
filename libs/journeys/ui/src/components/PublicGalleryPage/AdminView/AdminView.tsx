import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import Play3Icon from '@core/shared/ui/icons/Play3'

import { PublicGalleryPageData } from '../publicGalleryPageData'

interface AdminViewProps {
  data: PublicGalleryPageData
}

/**
 * Compact, mobile-shaped recreation of the public gallery page used in the
 * admin collection dialog. Read-only and decorative: the Use/Play buttons
 * are non-interactive `Box`es and the whole tree is meant to sit behind an
 * `aria-hidden` wrapper supplied by the consumer. Shares the
 * `PublicGalleryPageData` model with the live `JourneyView` so the two
 * surfaces stay in sync, even though they render quite differently.
 */
export function AdminView({ data }: AdminViewProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')

  return (
    <Box data-testid="PublicGalleryPageAdminView" sx={{ width: '100%' }}>
      <Stack spacing={1.5}>
        <Typography
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 600,
            fontSize: 20,
            lineHeight: 1.2,
            color: '#444451'
          }}
        >
          {data.title !== '' ? data.title : t('Untitled collection')}
        </Typography>
        <Typography
          sx={{
            fontFamily: 'Open Sans, sans-serif',
            fontSize: 14,
            lineHeight: 1.43,
            color: '#444451',
            whiteSpace: 'pre-wrap'
          }}
        >
          {data.description !== ''
            ? data.description
            : t('A short description of your collection will appear here.')}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar
            src={
              data.creatorImageSrc != null && data.creatorImageSrc !== ''
                ? data.creatorImageSrc
                : undefined
            }
            alt={data.creatorImageAlt ?? ''}
            sx={{ width: 32, height: 32 }}
          />
          <Typography
            sx={{
              fontFamily: 'Open Sans, sans-serif',
              fontSize: 14,
              color: '#6d6d7d'
            }}
          >
            {data.creatorName !== '' ? data.creatorName : t('Creator name')}
          </Typography>
        </Stack>
      </Stack>
      <Box
        sx={{
          mt: 2.5,
          // Horizontal scroll for the carousel of selected templates —
          // mirrors the live gallery page layout.
          overflowX: 'auto',
          overflowY: 'hidden',
          mx: -2.5, // bleed past the card padding so cards can
          px: 2.5, // start flush with the card text above
          pb: 2.5 // breathing room below cards so the horizontal
          // scrollbar doesn't sit on the Use/Play buttons
        }}
      >
        <Stack direction="row" spacing={1} sx={{ width: 'fit-content' }}>
          {data.items.length === 0
            ? [0, 1].map((index) => (
                <Box
                  key={`placeholder-${index}`}
                  sx={{
                    width: 160,
                    height: 280,
                    borderRadius: 1.5,
                    bgcolor: 'action.hover',
                    flexShrink: 0,
                    opacity: 0.6
                  }}
                />
              ))
            : data.items.map((item) => (
                <Stack
                  key={item.id}
                  spacing={0.75}
                  sx={{ width: 160, flexShrink: 0 }}
                >
                  <Box
                    sx={{
                      width: '100%',
                      height: 240,
                      borderRadius: 1.5,
                      overflow: 'hidden',
                      position: 'relative',
                      bgcolor: 'action.hover',
                      ...(item.image?.src != null && {
                        backgroundImage: `url(${item.image.src})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      })
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        p: 1,
                        background:
                          'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.16) 50%, rgba(0,0,0,0) 90%)'
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: 'Montserrat, sans-serif',
                          fontWeight: 600,
                          fontSize: 13,
                          lineHeight: 1.25,
                          color: 'white',
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}
                      >
                        {item.title}
                      </Typography>
                    </Box>
                  </Box>
                  {/* Use + Play buttons mirror the live gallery card. They're
                      decorative here — render as Box so they're not
                      keyboard-focusable and assistive tech doesn't announce
                      them as actionable. */}
                  <Stack direction="row" spacing={0.75} aria-hidden="true">
                    <Box
                      sx={{
                        flex: '0 0 auto',
                        width: 96,
                        height: 32,
                        borderRadius: 1,
                        border: '1px solid #444451',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'Montserrat, sans-serif',
                        fontWeight: 700,
                        fontSize: 12,
                        color: '#444451',
                        opacity: 0.6
                      }}
                    >
                      {t('Use')}
                    </Box>
                    <Box
                      sx={{
                        flex: 1,
                        height: 32,
                        borderRadius: 1,
                        bgcolor: '#26262E',
                        color: 'common.white',
                        opacity: 0.6,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Play3Icon sx={{ fontSize: 18 }} />
                    </Box>
                  </Stack>
                </Stack>
              ))}
        </Stack>
      </Box>
    </Box>
  )
}
