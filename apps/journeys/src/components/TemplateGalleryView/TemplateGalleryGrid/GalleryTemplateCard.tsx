import InsertPhotoRoundedIcon from '@mui/icons-material/InsertPhotoRounded'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import { ReactElement } from 'react'

import { abbreviateLanguageName } from '@core/journeys/ui/abbreviateLanguageName'

import { GetTemplateGalleryPage_templateGalleryPageBySlug_templates as GalleryTemplate } from '../../../../__generated__/GetTemplateGalleryPage'

interface GalleryTemplateCardProps {
  template: GalleryTemplate
  href: string
  priority?: boolean
}

export function GalleryTemplateCard({
  template,
  href,
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

  const imageSrc = template.primaryImageBlock?.src ?? null
  const imageAlt = template.primaryImageBlock?.alt ?? template.title

  return (
    <Card
      data-testid="GalleryTemplateCard"
      sx={{
        height: '100%',
        backgroundColor: 'transparent',
        boxShadow: 'none',
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      <Box
        component="a"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={template.title}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          color: 'inherit',
          textDecoration: 'none',
          '&:focus-visible': {
            outline: '2px solid',
            outlineColor: (theme) => theme.palette.primary.main,
            outlineOffset: 2,
            borderRadius: 2
          }
        }}
      >
        <Box
          sx={{
            position: 'relative',
            aspectRatio: '1 / 1',
            borderRadius: 2,
            overflow: 'hidden',
            backgroundColor: 'background.default'
          }}
        >
          {imageSrc != null ? (
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              priority={priority}
              sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, (max-width: 1200px) 33vw, 25vw"
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <Stack
              alignItems="center"
              justifyContent="center"
              sx={{ width: '100%', height: '100%' }}
            >
              <InsertPhotoRoundedIcon
                sx={{ fontSize: 48, color: 'text.secondary' }}
              />
            </Stack>
          )}
        </Box>
        <Stack spacing={1} sx={{ py: 2 }}>
          {displayLanguage != null && (
            <Typography
              variant="overline"
              sx={{ color: (theme) => theme.palette.grey[700] }}
            >
              {displayLanguage}
            </Typography>
          )}
          <Typography
            variant="subtitle1"
            sx={{
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
              variant="body2"
              color="text.secondary"
              sx={{
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 3,
                overflow: 'hidden'
              }}
            >
              {template.description}
            </Typography>
          )}
        </Stack>
      </Box>
    </Card>
  )
}
