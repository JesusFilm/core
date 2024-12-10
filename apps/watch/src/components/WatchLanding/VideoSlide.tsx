import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

interface VideoSlideProps {
  imageUrl: string
  episodeNumber?: number
  title: string
  bgColor?: string
  type?: string
}

export function VideoSlide({
  imageUrl,
  episodeNumber,
  title,
  bgColor,
  type = 'Video'
}: VideoSlideProps): JSX.Element {
  if (bgColor) {
    return (
      <Box
        sx={{
          backgroundColor: bgColor || 'transparent',
          borderRadius: 2,
          overflow: 'hidden',
          p: '4px',
          position: 'relative',
          //   width: 200,
          height: 260
        }}
      >
        <img
          src={imageUrl}
          alt={title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: 6,
            overflow: 'hidden',
            maskImage:
              'linear-gradient(to bottom, rgba(0, 0, 0, 1) 50%, transparent 100%)',
            maskSize: 'cover'
          }}
        />

        <Typography
          variant="overline"
          sx={{
            position: 'absolute',
            color: 'text.primary',
            borderTopLeftRadius: '10px',
            borderBottomRightRadius: '10px',
            top: 0,
            fontWeight: 600,
            letterSpacing: 1,
            px: 4
          }}
        >
          {type}
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{
            position: 'absolute',
            bottom: 2,
            p: 4,
            color: 'text.primary'
          }}
        >
          {title}
        </Typography>
      </Box>
    )
  }

  // Default variant
  return (
    <>
      <Box
        sx={{
          flex: 1,
          borderRadius: 2,
          position: 'relative',
          overflow: 'hidden',
          height: '100%',
          lineHeight: 0,
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 'inherit',
            boxShadow: 'inset 0 0 1px rgba(255, 255, 255, 0.4)',
            zIndex: 1,
            pointerEvents: 'none'
          }
        }}
      >
        <img
          src={imageUrl}
          alt={title}
          style={{
            width: '100%',
            height: '200px',
            objectFit: 'cover'
          }}
        />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 3 }}>
        {episodeNumber !== undefined && (
          <Typography variant="h3" sx={{ color: '#fff', mr: 3, opacity: 0.5 }}>
            {episodeNumber}
          </Typography>
        )}
        <Typography variant="subtitle1" sx={{ color: '#fff' }}>
          {title}
        </Typography>
      </Box>
    </>
  )
}
