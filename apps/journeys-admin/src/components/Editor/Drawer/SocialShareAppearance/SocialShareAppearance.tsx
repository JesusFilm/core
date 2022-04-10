import Box from '@mui/material/Box'
import { ReactElement, useState } from 'react'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import FacebookTwoToneIcon from '@mui/icons-material/FacebookTwoTone'
import TwitterIcon from '@mui/icons-material/Twitter'
import Image from 'next/image'
import ImageIcon from '@mui/icons-material/Image'
import { useJourney } from '../../../../libs/context'

interface SocialShareAppearanceProps {
  id: string
}

export function SocialShareAppearance({
  id
}: SocialShareAppearanceProps): ReactElement {
  const { title, description, primaryImageBlock } = useJourney()

  const [width, setWidth] = useState(280)
  const [height, setHeight] = useState(194)
  return (
    <Box sx={{ px: 6, py: 4 }}>
      <Typography variant="subtitle2" sx={{ pb: 4 }}>
        Social Image
      </Typography>
      <div
        style={{
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          borderRadius: 8,
          width: '100%',
          height: 194,
          marginBottom: 24,
          backgroundColor: '#EFEFEF'
        }}
      >
        {/* Aspect ratio on image not getting preserved */}
        {primaryImageBlock?.src != null ? (
          <Image
            src={primaryImageBlock?.src}
            // src="https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2231&q=80"
            // src="https://images.unsplash.com/photo-1553272725-086100aecf5e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=765&q=80"
            alt="social share image"
            width={width}
            height={height}
            onLoadingComplete={({ naturalWidth, naturalHeight }) => {
              setWidth(naturalWidth)
              setHeight(naturalHeight)
            }}
          />
        ) : (
          <ImageIcon fontSize="large" />
        )}
        <Button
          variant="contained"
          size="small"
          color="secondary"
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 10,
            borderRadius: 4
          }}
          startIcon={<ImageIcon fontSize="small" />}
        >
          <Typography variant="caption">Change</Typography>
        </Button>
      </div>

      <TextField
        variant="filled"
        label="Title"
        helperText="Recommended length: 5 words"
        fullWidth
        value={title}
        sx={{
          pb: 4
        }}
      />
      <TextField
        variant="filled"
        label="Description"
        helperText="Recommended length: up to 18 words"
        fullWidth
        value={description}
        sx={{
          pb: 6
        }}
      />

      <Typography variant="subtitle2" sx={{ pb: 4 }}>
        Share Preview
      </Typography>

      <Stack direction="row" spacing={3}>
        {/* Replace icon when available */}
        <Button startIcon={<FacebookTwoToneIcon sx={{ color: '#0163E0' }} />}>
          <Typography color="secondary">Facebook</Typography>
        </Button>
        {/* Replace icon when available */}
        <Button startIcon={<TwitterIcon sx={{ color: '#47ACDF' }} />}>
          <Typography color="secondary">Twitter</Typography>
        </Button>
      </Stack>
    </Box>
  )
}
