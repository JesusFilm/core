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

import Play3Icon from '@core/shared/ui/icons/Play3'

import { abbreviateLanguageName } from '../../libs/abbreviateLanguageName'
import {
  GALLERY_CARD_RADIUS,
  PublicGalleryPageItem
} from '../PublicGalleryPage'

import {
  GALLERY_DIVIDER,
  GALLERY_SURFACE_DARK,
  GALLERY_TEXT_PRIMARY
} from './galleryTokens'

interface PublicTemplateGalleryCardProps {
  item: PublicGalleryPageItem
  priority?: boolean
}

const CARD_WIDTH = 273
// The artwork fills the whole card body (above the buttons); the title +
// description are overlaid on a dark gradient at the bottom of it.
const IMAGE_HEIGHT = 380

const lineClamp = (lines: number) =>
  ({
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: lines,
    overflow: 'hidden'
  }) as const

export function PublicTemplateGalleryCard({
  item,
  priority = false
}: PublicTemplateGalleryCardProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')

  const adminUrl =
    process.env.NEXT_PUBLIC_JOURNEYS_ADMIN_URL ?? 'https://admin.nextstep.is'

  const localLanguage = item.languageName?.find(
    ({ primary }) => !primary
  )?.value
  const nativeLanguage =
    item.languageName?.find(({ primary }) => primary)?.value ?? ''
  const displayLanguage = abbreviateLanguageName(
    localLanguage ?? nativeLanguage
  )

  const parsedCreatedAt =
    item.createdAt != null ? parseISO(item.createdAt) : null
  const date =
    parsedCreatedAt != null && isValid(parsedCreatedAt)
      ? intlFormat(parsedCreatedAt, { month: 'long', year: 'numeric' })
      : null
  const metaParts = [date, displayLanguage].filter(
    (part): part is string => part != null && part !== ''
  )

  const imageSrc = item.image?.src ?? null
  const imageAlt = item.image?.alt ?? item.title

  // Deep link into the admin "Use Template" receiver.
  const useTemplateHref = `${adminUrl}/?useTemplate=${encodeURIComponent(item.id)}`
  // Public viewer route on the same root domain.
  const previewHref = `/${item.slug}`
  const previewLabel = t('Preview')

  return (
    <Stack
      data-testid="PublicTemplateGalleryCard"
      spacing={1.5}
      sx={{
        flex: '0 0 auto',
        width: CARD_WIDTH,
        height: '100%',
        p: 1.5,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: GALLERY_DIVIDER,
        borderRadius: GALLERY_CARD_RADIUS,
        boxShadow: '8px 8px 13px rgba(0, 0, 0, 0.08)',
        scrollSnapAlign: 'start'
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: IMAGE_HEIGHT,
          flexShrink: 0,
          borderRadius: 2,
          overflow: 'hidden',
          backgroundColor: '#ECECEC'
        }}
      >
        {imageSrc != null ? (
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            priority={priority}
            sizes="273px"
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
        {/* The artwork fills the whole thumbnail; a dark gradient at the
            bottom keeps the white title + description readable. */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to top, rgba(0, 0, 0, 0.72) 0%, rgba(0, 0, 0, 0.16) 45%, rgba(0, 0, 0, 0) 75%)'
          }}
        />
        <Stack
          spacing={0.75}
          sx={{
            position: 'absolute',
            insetInline: 0,
            bottom: 0,
            p: 2,
            justifyContent: 'flex-end'
          }}
        >
          {metaParts.length > 0 && (
            <Typography variant="overline" sx={{ color: '#EFEFEF', mb: 0 }}>
              {metaParts.join(' • ')}
            </Typography>
          )}
          <Typography
            variant="h5"
            sx={{ color: 'common.white', ...lineClamp(2) }}
          >
            {item.title}
          </Typography>
          {item.description != null && item.description !== '' && (
            <Typography
              variant="body2"
              sx={{ color: 'rgba(255, 255, 255, 0.92)', ...lineClamp(3) }}
            >
              {item.description}
            </Typography>
          )}
        </Stack>
      </Box>

      {/*
        Use + Preview sit at the bottom of the card. Use is the labelled
        outlined button that fills the row; Preview is the compact filled icon
        button. Both open in a new tab so the visitor stays on the gallery.
      */}
      <Stack direction="row" spacing={2} alignItems="stretch">
        <Button
          component="a"
          href={useTemplateHref}
          target="_blank"
          rel="noopener noreferrer"
          variant="outlined"
          fullWidth
          data-testid="GalleryTemplateCardUseButton"
          sx={{
            minHeight: 50,
            borderWidth: 2,
            borderRadius: 2,
            fontWeight: 700,
            textTransform: 'none',
            color: GALLERY_TEXT_PRIMARY,
            borderColor: GALLERY_TEXT_PRIMARY,
            '&:hover': {
              borderWidth: 2,
              borderColor: GALLERY_TEXT_PRIMARY,
              backgroundColor: alpha(GALLERY_TEXT_PRIMARY, 0.06)
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
            width: 50,
            height: 50,
            flexShrink: 0,
            borderRadius: 2,
            backgroundColor: GALLERY_SURFACE_DARK,
            color: 'common.white',
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
