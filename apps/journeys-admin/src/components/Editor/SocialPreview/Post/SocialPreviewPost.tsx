import { ReactElement } from 'react'
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
  return (
    <Box sx={{ width: 256, mx: 'auto' }}>
      <Stack direction="column" justifyContent="start" alignContent="center">
        <Typography variant="caption" sx={{ pb: 4 }} textAlign="center">
          Social media preview
        </Typography>
        {journey != null && (
          <Card
            sx={{ width: 240, borderRadius: '12px', px: 2, display: 'block' }}
            elevation={0}
          >
            <CardHeader
              sx={{ px: 0, pb: 2 }}
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
            <CardMedia
              sx={{
                px: 0,
                pt: 0,
                width: 224,
                height: 120,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {journey.primaryImageBlock?.src == null ? (
                <Box
                  data-testid="social-preview-post-empty"
                  display="block"
                  width={224}
                  height={120}
                  bgcolor="rgba(0, 0, 0, 0.1)"
                  borderRadius="4px"
                />
              ) : (
                <Image
                  src={journey.primaryImageBlock.src}
                  alt={journey.primaryImageBlock.alt}
                  width={224}
                  height={120}
                  style={{
                    borderRadius: '4px'
                  }}
                />
              )}
            </CardMedia>
            <CardContent sx={{ px: 0, pt: 0 }}>
              <Typography
                variant="body2"
                sx={{
                  fontSize: 7,
                  fontWeight: 400,
                  lineHeight: '10px',
                  color: '#6D6D7D'
                }}
              >
                YOUR.NEXTSTEP.IS
              </Typography>
              {journey.seoTitle == null ? (
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
                <Typography
                  variant="subtitle1"
                  sx={{ fontSize: 9, lineHeight: '12px', color: '#26262E' }}
                >
                  {journey.seoTitle}
                </Typography>
              )}
              {journey.seoDescription == null ? (
                <Box
                  sx={{
                    width: '158px',
                    height: '12px',
                    background: '#EFEFEF',
                    borderRadius: '6px'
                  }}
                />
              ) : (
                <Typography
                  variant="body2"
                  sx={{ fontSize: 8, lineHeight: '12px', color: '#6D6D7D' }}
                >
                  {journey.seoDescription}
                </Typography>
              )}
            </CardContent>
          </Card>
        )}
      </Stack>
    </Box>
  )
}
