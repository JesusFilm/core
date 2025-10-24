import {
  Range as SliderPrimitiveRange,
  Root as SliderPrimitiveRoot,
  Thumb as SliderPrimitiveThumb,
  Track as SliderPrimitiveTrack
} from '@radix-ui/react-slider'
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from 'react'

import { cn } from '../../libs/cn/cn'

type SliderProps = ComponentPropsWithoutRef<typeof SliderPrimitiveRoot>

const Slider = forwardRef<
  ElementRef<typeof SliderPrimitiveRoot>,
  SliderProps
>(function Slider({ className, ...props }, ref) {
  return (
    <SliderPrimitiveRoot
      ref={ref}
      className={cn(
        'relative flex w-full touch-none select-none items-center',
        className
      )}
      {...props}
    >
      <SliderPrimitiveTrack className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted">
        <SliderPrimitiveRange className="absolute h-full bg-primary" />
      </SliderPrimitiveTrack>
      <SliderPrimitiveThumb className="block size-5 rounded-full border-2 border-background bg-primary text-primary-foreground shadow transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
    </SliderPrimitiveRoot>
  )
})

export { Slider }
