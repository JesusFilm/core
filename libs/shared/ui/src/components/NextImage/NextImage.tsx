import { ReactElement } from 'react'
import Image, { ImageProps } from 'next/image'
import { styled } from '@mui/material/styles'

const StyledNextImage = styled(Image)({
  filter: 'none !important'
})

// Safari doesn't yet support priority image loading
// https://bugs.webkit.org/show_bug.cgi?id=231150
export function NextImage({ priority, ...props }: ImageProps): ReactElement {
  return <StyledNextImage {...props} />
}
