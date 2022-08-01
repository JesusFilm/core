import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { isThisYear, parseISO, intlFormat } from 'date-fns'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { transformer } from '@core/journeys/ui/transformer'
import type { TreeBlock } from '@core/journeys/ui/block'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { useRouter } from 'next/router'
import { BlockFields_StepBlock as StepBlock } from '../../../__generated__/BlockFields'
import { CardView } from '../CardView'
import { Properties } from './Properties'

export function TemplateView(): ReactElement {
  const { journey } = useJourney()
  const router = useRouter()
  const blocks =
    journey?.blocks != null
      ? (transformer(journey.blocks) as Array<TreeBlock<StepBlock>>)
      : undefined

  return (
    <Box sx={{ mr: { sm: '328px' }, mb: '80px' }}>
      <Stack
        direction="row"
        spacing={10}
        sx={{
          px: 14,
          py: 17,
          backgroundColor: 'background.paper'
        }}
      >
        {journey?.primaryImageBlock?.src != null ? (
          <Box
            component="img"
            src={journey.primaryImageBlock.src}
            alt={journey.primaryImageBlock.alt}
            style={{
              width: 213,
              height: 167,
              objectFit: 'cover',
              borderRadius: 12
            }}
          />
        ) : (
          <Skeleton variant="rectangular" width={213} height={167} />
        )}
        <Stack direction="column" spacing={2}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Typography variant="overline">
              {journey != null ? (
                intlFormat(parseISO(journey.createdAt), {
                  month: 'long',
                  day: 'numeric',
                  year: isThisYear(parseISO(journey.createdAt))
                    ? undefined
                    : 'numeric'
                })
              ) : (
                <Skeleton variant="text" width="80%" />
              )}
            </Typography>
            {journey != null ? (
              <Button
                startIcon={<VisibilityIcon />}
                variant="outlined"
                size="small"
                onClick={async () =>
                  await router.push(`/api/preview?slug=${journey?.slug}`)
                }
              >
                Preview
              </Button>
            ) : (
              <Skeleton variant="rectangular" width="10%" />
            )}
          </Box>
          <Typography variant="h1">
            {journey != null ? (
              journey.title
            ) : (
              <Skeleton variant="text" width="40%" />
            )}
          </Typography>
          <Typography variant="body2">
            {journey != null ? (
              journey.description
            ) : (
              <Skeleton variant="text" width="60%" />
            )}
          </Typography>
        </Stack>
      </Stack>
      <Properties />
      <>
        <CardView blocks={blocks} />
      </>
    </Box>
  )
}
