import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { intlFormat, parseISO } from 'date-fns'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'

import GridEmptyIcon from '@core/shared/ui/icons/GridEmpty'
import { NextImage } from '@core/shared/ui/NextImage'

import { useJourneyQuery } from '../../libs/useJourneyQuery'

export function TemplateSnippet(): ReactElement {
  const router = useRouter()

  function getTemplateId(): string | undefined {
    const url = router.query.redirect as string | undefined
    const pathnameParts = url?.split('/')
    if (url?.includes('templates') === true && pathnameParts != null) {
      const idIndex = pathnameParts.indexOf('templates') + 1
      const id = pathnameParts[idIndex]
      return id.split('?')[0]
    }
  }

  const { data } = useJourneyQuery({ id: getTemplateId() ?? '' })

  return (
    <Container
      sx={{
        px: { xs: 6, sm: 8 },
        pt: 10
      }}
    >
      <Stack
        direction="row"
        sx={{
          gap: { xs: 4, sm: 7 }
        }}
      >
        <Box sx={{ flexShrink: 0, width: { xs: 107, sm: 244 } }}>
          <Stack
            sx={{
              position: 'relative',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden',
              width: { xs: 107, sm: 244 },
              height: { xs: 107, sm: 244 },
              borderRadius: 3
            }}
          >
            {data?.journey.primaryImageBlock?.src != null ? (
              <NextImage
                src={data?.journey.primaryImageBlock.src}
                alt={data?.journey.primaryImageBlock.alt}
                placeholder="blur"
                blurDataURL={data?.journey.primaryImageBlock.blurhash}
                layout="fill"
                objectFit="cover"
                priority
              />
            ) : data?.journey != null ? (
              <GridEmptyIcon fontSize="large" />
            ) : (
              <Skeleton
                data-testid="SnippetImageSkeleton"
                variant="rectangular"
                sx={{
                  width: '100%',
                  height: '100%'
                }}
              />
            )}
          </Stack>
        </Box>
        <Stack
          direction="column"
          sx={{
            width: '100%',
            flexShrink: 1
          }}
        >
          <Typography
            variant="overline"
            sx={{
              color: 'secondary.light'
            }}
            noWrap
          >
            {data?.journey.createdAt != null ? (
              intlFormat(parseISO(data?.journey.createdAt), {
                month: 'long',
                year: 'numeric'
              })
            ) : (
              <Skeleton sx={{ width: '35%', maxWidth: 150 }} />
            )}
          </Typography>
          <Typography variant="h1" sx={{ pb: 4 }}>
            {data?.journey.title != null ? (
              data?.journey.title
            ) : (
              <Skeleton
                data-testid="TemplateSnippetTitleSkeleton"
                sx={{
                  transform: 'scale(1, 0.8)',
                  width: '50%',
                  height: 38,
                  maxWidth: 400
                }}
              />
            )}
          </Typography>
        </Stack>
      </Stack>
    </Container>
  )
}
