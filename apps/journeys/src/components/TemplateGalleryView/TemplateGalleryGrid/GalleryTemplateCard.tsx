import InsertPhotoRoundedIcon from '@mui/icons-material/InsertPhotoRounded'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { intlFormat, isValid, parseISO } from 'date-fns'
import Image from 'next/image'
import { ReactElement } from 'react'

import { abbreviateLanguageName } from '@core/journeys/ui/abbreviateLanguageName'

import { GetTemplateGalleryPage_templateGalleryPageBySlug_templates as GalleryTemplate } from '../../../../__generated__/GetTemplateGalleryPage'

interface GalleryTemplateCardProps {
  template: GalleryTemplate
  priority?: boolean
}

export function GalleryTemplateCard({
  template,
  priority = false
}: GalleryTemplateCardProps): ReactElement {
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

  return (
    <Box
      data-testid="GalleryTemplateCard"
      sx={{
        position: 'relative',
        flex: '0 0 auto',
        width: { xs: 220, sm: 240, md: 260 },
        aspectRatio: '3 / 5',
        borderRadius: 3,
        overflow: 'hidden',
        backgroundColor: '#ECECEC',
        color: 'common.white',
        scrollSnapAlign: 'start'
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
  )
}
