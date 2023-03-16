import { ReactElement } from 'react'
import Image from 'next/image'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/system/Box'
import Stack from '@mui/material/Stack'
import { JourneyFields } from '../../../../../__generated__/JourneyFields'

interface SocialPreviewPostProps {
  journey?: JourneyFields
  avatar: ReactElement
}
export function SocialPreviewPost({
  journey,
  avatar
}: SocialPreviewPostProps): ReactElement {
  return (
    <>
      {journey != null && (
        <Card sx={{ maxWidth: 200, borderRadius: '4px' }}>
          <CardHeader sx={{ px: '8px' }} avatar={avatar}>
            <Stack>
              <Box
                sx={{
                  width: '65px',
                  height: 0,
                  border: '8px solid #C2C2C2'
                }}
              ></Box>
              <div></div>
            </Stack>
          </CardHeader>
          <CardMedia sx={{ px: '8px' }}>
            {journey?.primaryImageBlock?.src == null ? (
              <Box
                sx={{
                  bgcolor: 'rgba(0, 0, 0, 0.1)',
                  width: 180,
                  height: 97,
                  borderRadius: '6px'
                }}
              />
            ) : (
              <Image
                src={journey?.primaryImageBlock.src}
                alt={journey?.primaryImageBlock.alt}
                width={180}
                height={97}
              />
            )}
          </CardMedia>
          <CardContent>
            <div>
              <Typography variant="body1">YOUR.NEXTSTEP.IS</Typography>
            </div>
            <div>
              <Typography variant="body1">{journey.seoTitle}</Typography>
            </div>
            <div>
              <Typography variant="body2">{journey.seoDescription}</Typography>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}
