import { ReactElement } from 'react'
import Image from 'next/image'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
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
        <Card sx={{ maxWidth: 200 }}>
          <CardHeader avatar={avatar} />
          {journey?.primaryImageBlock != null && (
            <CardMedia>
              <Image
                src={journey?.primaryImageBlock.src}
                alt={journey?.primaryImageBlock.alt}
                width={180}
                height={97}
              />
            </CardMedia>
          )}
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
