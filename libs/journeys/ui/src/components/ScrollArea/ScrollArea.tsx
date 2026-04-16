import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area'
import { CSSProperties, ReactElement, ReactNode } from 'react'

interface ScrollAreaProps {
  children: ReactNode
  style?: CSSProperties
}

const scrollbarStyles: CSSProperties = {
  display: 'flex',
  userSelect: 'none',
  touchAction: 'none',
  padding: 2,
  width: 8
}

const thumbStyles: CSSProperties = {
  position: 'relative',
  flex: 1,
  borderRadius: 9999,
  backgroundColor: 'rgba(0, 0, 0, 0.2)'
}

export function ScrollArea({
  children,
  style
}: ScrollAreaProps): ReactElement {
  return (
    <ScrollAreaPrimitive.Root
      style={{
        overflow: 'hidden',
        ...style
      }}
    >
      <ScrollAreaPrimitive.Viewport
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 'inherit'
        }}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollAreaPrimitive.Scrollbar
        orientation="vertical"
        style={scrollbarStyles}
      >
        <ScrollAreaPrimitive.Thumb style={thumbStyles} />
      </ScrollAreaPrimitive.Scrollbar>
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}
