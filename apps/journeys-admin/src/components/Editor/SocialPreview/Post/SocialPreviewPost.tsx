import { ReactElement, useEffect, useState } from 'react'
import Image from 'next/image'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/system/Box'
import Stack from '@mui/material/Stack'
import PersonIcon from '@mui/icons-material/Person'
import Avatar from '@mui/material/Avatar'
import { JourneyFields } from '../../../../../__generated__/JourneyFields'

interface SocialPreviewPostProps {
  journey?: JourneyFields
}
export function SocialPreviewPost({
  journey
}: SocialPreviewPostProps): ReactElement {
  const [isEmpty, setIsEmpty] = useState(true)
  useEffect(() => {
    if (
      journey?.seoTitle != null ||
      journey?.seoDescription != null ||
      journey?.primaryImageBlock?.src != null
    ) {
      setIsEmpty(false)
    } else {
      setIsEmpty(true)
    }
  }, [journey, isEmpty])

  return (
    <Stack direction="column" justifyContent="start">
      <Typography variant="subtitle2" sx={{ pb: 4 }}>
        Shared on social media
      </Typography>
      {journey != null && (
        <Card sx={{ width: 240, borderRadius: '12px', px: 2 }} elevation={0}>
          <CardHeader
            sx={{ px: 0 }}
            avatar={
              <Avatar
                sx={{
                  width: 20,
                  height: 20,
                  bgcolor: (theme) => theme.palette.background.default,
                  color: (theme) => theme.palette.background.paper
                }}
              >
                <PersonIcon />
              </Avatar>
            }
            title={
              <Box
                sx={{
                  width: '60px',
                  height: '12px',
                  background: '#EFEFEF',
                  borderRadius: '6px'
                }}
              />
            }
            action={
              <Box
                sx={{
                  width: '12px',
                  height: '12px',
                  background: '#EFEFEF',
                  borderRadius: '6px',
                  mt: '8px',
                  mr: '12px'
                }}
              />
            }
          />
          <CardMedia sx={{ px: 0 }}>
            {isEmpty ? (
              <Box
                sx={{
                  bgcolor: 'rgba(0, 0, 0, 0.1)',
                  width: 224,
                  height: 120,
                  borderRadius: '4px'
                }}
              />
            ) : (
              journey?.primaryImageBlock?.src != null && (
                <Image
                  src={journey?.primaryImageBlock.src}
                  alt={journey?.primaryImageBlock.alt}
                  width={224}
                  height={120}
                  style={{
                    borderRadius: '4px'
                  }}
                />
              )
            )}
          </CardMedia>
          <CardContent sx={{ px: 0 }}>
            <div>
              <Typography variant="body2">YOUR.NEXTSTEP.IS</Typography>
            </div>
            <div>
              {isEmpty ? (
                <Box
                  sx={{
                    width: '224px',
                    height: '12px',
                    background: '#EFEFEF',
                    borderRadius: '6px',
                    mb: 1
                  }}
                />
              ) : (
                <Typography variant="subtitle1">{journey.seoTitle}</Typography>
              )}
            </div>
            <div>
              {isEmpty ? (
                <Box
                  sx={{
                    width: '158px',
                    height: '12px',
                    background: '#EFEFEF',
                    borderRadius: '6px'
                  }}
                />
              ) : (
                <Typography variant="body2">
                  {journey.seoDescription}
                </Typography>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </Stack>
  )
}
