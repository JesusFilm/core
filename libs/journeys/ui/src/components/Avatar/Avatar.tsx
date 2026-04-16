import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { CSSProperties, ReactElement } from 'react'

interface AvatarProps {
  src?: string
  alt?: string
  fallback: string
  size?: number
  style?: CSSProperties
}

export function Avatar({
  src,
  alt,
  fallback,
  size = 32,
  style
}: AvatarProps): ReactElement {
  return (
    <AvatarPrimitive.Root
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        verticalAlign: 'middle',
        overflow: 'hidden',
        userSelect: 'none',
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: '#e0e0e0',
        flexShrink: 0,
        ...style
      }}
    >
      {src != null && (
        <AvatarPrimitive.Image
          src={src}
          alt={alt ?? fallback}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: 'inherit'
          }}
        />
      )}
      <AvatarPrimitive.Fallback
        delayMs={600}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#6D28D9',
          color: 'white',
          fontSize: size * 0.4,
          fontWeight: 600,
          lineHeight: 1
        }}
      >
        {fallback}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  )
}
