import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { getImageProps } from 'next/image'
import { ReactNode } from 'react'

function getBackgroundImage(srcSet = '') {
  const imageSet = srcSet
    .split(', ')
    .map((str) => {
      const [url, dpi] = str.split(' ')
      return `url("${url}") ${dpi}`
    })
    .join(', ')
  return `image-set(${imageSet})`
}

interface SlideWrapperProps {
  children: ReactNode
  bgImage?: string
  bgColor?: string
}

export function SlideWrapper({
  children,
  bgImage,
  bgColor
}: SlideWrapperProps) {
  // const {
  //   props: { srcSet }
  // } = getImageProps({ alt: '', fill: true, src: bgImage ?? '' })
  // const backgroundImage = getBackgroundImage(srcSet)

  return (
    <Stack
      role="region"
      sx={{
        minHeight: '100%',
        width: '100%',
        alignItems: 'center',
        gap: 10,
        transition: 'opacity 100ms',
        transitionDelay: '600ms',
        // backgroundImage,
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: bgColor
      }}
    >
      {/* <Box
        role="presentation"
        sx={{
          position: 'absolute',
          inset: 0,
          transition: 'opacity 100ms',
          transitionDelay: '600ms',
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      /> */}
      <Stack
        sx={{
          alignItems: 'center',
          width: '100%',
          pt: 32,
          maxWidth: '48rem',
          gap: 10
        }}
      >
        {children}
      </Stack>
    </Stack>
  )
}
