'use client'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'

import { PublishedChip } from '../../../../../../components/PublishedChip'
import { useAdminVideo } from '../../../../../../libs/useAdminVideo'

export function VideoView(): ReactElement {
  const params = useParams<{ videoId: string; locale: string }>()
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations()

  const { data } = useAdminVideo({
    variables: { videoId: params?.videoId as string }
  })

  const handleEdit = (): void => {
    router.push(`${pathname}/edit`)
  }

  return (
    <Stack
      gap={2}
      sx={{ width: '100%', maxWidth: 1700 }}
      data-testid="VideoView"
    >
      <Stack
        gap={2}
        direction="row"
        flexWrap="wrap"
        sx={{ mb: 2, alignItems: 'center' }}
      >
        <Typography variant="h4">{data?.adminVideo.title[0].value}</Typography>
        <PublishedChip published={data?.adminVideo.published ?? false} />
        <Button
          onClick={handleEdit}
          variant="outlined"
          size="small"
          sx={{ ml: 'auto', width: 'min-width' }}
        >
          {t('Edit')}
        </Button>
      </Stack>
      <Stack gap={2} sx={{ flexDirection: { xs: 'column', sm: 'row' } }}>
        <Box
          sx={{
            position: 'relative',
            height: 225,
            width: { xs: 'auto', sm: 400 },
            borderRadius: 2,
            overflow: 'hidden',
            flexShrink: 0
          }}
        >
          <Image
            src={data?.adminVideo.images[0].mobileCinematicHigh as string}
            alt={`${data?.adminVideo.imageAlt[0].value}`}
            layout="fill"
            objectFit="cover"
            priority
          />
        </Box>
        <Box sx={{ width: '100%' }}>
          <Stack direction="column" sx={{ width: '100%' }}>
            <Box sx={{ width: '100%' }}>
              <Typography variant="body1">
                {data?.adminVideo.description[0].value}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Stack>
    </Stack>
  )
}
