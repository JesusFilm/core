import { ReactElement } from 'react'
import Image, { ImageProps } from 'next/image'
import { styled } from '@mui/material/styles'

const StyledNextImage = styled(Image)({
  filter: 'none !important'
})

export function NextImage({ ...props }: ImageProps): ReactElement {
  return <StyledNextImage {...props} />
}
