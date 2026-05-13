import InsertPhotoRoundedIcon from '@mui/icons-material/InsertPhotoRounded'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { alpha } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { intlFormat, isValid, parseISO } from 'date-fns'
import Image from 'next/image'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { abbreviateLanguageName } from '@core/journeys/ui/abbreviateLanguageName'
import Play3Icon from '@core/shared/ui/icons/Play3'

import { GetTemplateGalleryPage_templateGalleryPageBySlug_templates as GalleryTemplate } from '../../../../__generated__/GetTemplateGalleryPage'

// Mirror of `palette[900]` from
// libs/shared/ui/src/libs/themes/base/tokens/colors.ts:10 — the upstream
// "almost black" base token that journeysAdmin re-exports as
// `palette.solid.main`. The public journeys app uses the website theme,
// which doesn't expose this token, so the value is hardcoded here. Keep
// in sync with the base token if it ever changes.
const ADMIN_PALETTE_900 = '#26262E'

interface GalleryTemplateCardProps {
  template: GalleryTemplate
  priority?: boolean
}

export function GalleryTemplateCard({
  template,
  priority = false
}: GalleryTemplateCardProps): ReactElement {
  const { t } = useTranslation('apps-journeys')

  // Read inside the component so test specs can override
  // NEXT_PUBLIC_JOURNEYS_ADMIN_URL via vi.stubEnv / process.env without
  // having to reset module state. Fallback matches the prod admin host.
  const adminUrl =
    process.env.NEXT_PUBLIC_JOURNEYS_ADMIN_URL ?? 'https://admin.nextstep.is'

  const localLanguage = template.language.name.find(
    ({ primary }) => !primary
  )?.value
  const nativeLanguage =
    template.language.name.find(({ primary }) => primary)?.value ?? ''
  const displayLanguage = abbreviateLanguageName(
    localLanguage ?? nativeLanguage
  )

  const parsedCreatedAt =
    template.createdAt != null ? parseISO(String(template.createdAt)) : null
  const date =
    parsedCreatedAt != null && isValid(parsedCreatedAt)
      ? intlFormat(parsedCreatedAt, { month: 'long', year: 'numeric' })
      : null
  const metaParts = [date, displayLanguage].filter(
    (part): part is string => part != null && part !== ''
  )

  const imageSrc = template.primaryImageBlock?.src ?? null
  const imageAlt = template.primaryImageBlock?.alt ?? template.title

  // Deep link into the admin "Use Template" receiver (NES-1608).
  const useTemplateHref = `${adminUrl}/?useTemplate=${encodeURIComponent(template.id)}`
  // Public viewer route on the same root domain (middleware rewrites
  // `/<slug>` → `/home/<slug>`).
  const previewHref = `/${template.slug}`
  const previewLabel = t('Preview')

  return (
    <Stack
      data-testid="GalleryTemplateCard"
      spacing={1.5}
      sx={{
        flex: '0 0 auto',
        width: { xs: 220, sm: 240, md: 260 },
        scrollSnapAlign: 'start'
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          aspectRatio: '3 / 5',
          borderRadius: 3,
          overflow: 'hidden',
          backgroundColor: '#ECECEC',
          color: 'common.white'
        }}
      >
        {imageSrc != null ? (
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            priority={priority}
            sizes="(max-width: 600px) 60vw, (max-width: 900px) 40vw, 260px"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{ position: 'absolute', inset: 0 }}
          >
            <InsertPhotoRoundedIcon
              sx={{ fontSize: 56, color: 'rgba(0, 0, 0, 0.25)' }}
            />
          </Stack>
        )}

        <Box
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            p: 2.5,
            pt: 5,
            background:
              'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 55%, rgba(0,0,0,0) 100%)'
          }}
        >
          <Stack spacing={0.75}>
            {metaParts.length > 0 && (
              <Typography
                sx={{
                  color: 'rgba(255,255,255,0.85)',
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase'
                }}
              >
                {metaParts.join(' · ')}
              </Typography>
            )}
            <Typography
              sx={{
                color: 'common.white',
                fontWeight: 700,
                fontSize: '1.125rem',
                lineHeight: 1.25,
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 2,
                overflow: 'hidden'
              }}
            >
              {template.title}
            </Typography>
            {template.description != null && template.description !== '' && (
              <Typography
                sx={{
                  color: 'rgba(255,255,255,0.85)',
                  fontSize: '0.8125rem',
                  lineHeight: 1.4,
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 2,
                  overflow: 'hidden'
                }}
              >
                {template.description}
              </Typography>
            )}
          </Stack>
        </Box>
      </Box>

      {/*
        Use + Preview sit below the card on the page background. Use is
        the labelled outlined button taking the row; Preview is the
        compact filled icon-button accent. Both open in a new tab so the
        visitor stays on the gallery.
      */}
      <Stack direction="row" spacing={1} alignItems="center">
        <Button
          component="a"
          href={useTemplateHref}
          target="_blank"
          rel="noopener noreferrer"
          variant="outlined"
          fullWidth
          data-testid="GalleryTemplateCardUseButton"
          sx={{
            color: ADMIN_PALETTE_900,
            borderColor: ADMIN_PALETTE_900,
            '&:hover': {
              borderColor: ADMIN_PALETTE_900,
              backgroundColor: alpha(ADMIN_PALETTE_900, 0.06)
            }
          }}
        >
          {t('Use')}
        </Button>
        <IconButton
          component="a"
          href={previewHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={previewLabel}
          data-testid="GalleryTemplateCardPreviewButton"
          sx={{
            backgroundColor: ADMIN_PALETTE_900,
            color: '#FFFFFF',
            borderRadius: 2,
            '&:hover': {
              backgroundColor: '#000000'
            }
          }}
        >
          <Play3Icon />
        </IconButton>
      </Stack>
    </Stack>
  )
}
