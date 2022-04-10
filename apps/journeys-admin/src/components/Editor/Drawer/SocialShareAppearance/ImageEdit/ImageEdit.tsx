import { ReactElement, useState } from 'react'
import Image from 'next/image'
import ImageIcon from '@mui/icons-material/Image'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { useJourney } from '../../../../../libs/context'

export function ImageEdit(): ReactElement {
  const { primaryImageBlock } = useJourney()
  const [width, setWidth] = useState(280)
  const [height, setHeight] = useState(194)
  return (
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
  )
}
