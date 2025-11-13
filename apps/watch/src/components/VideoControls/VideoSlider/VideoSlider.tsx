import * as SliderPrimitive from '@radix-ui/react-slider'
import * as React from 'react'

import { cn } from '@core/shared/uimodern/utils'

const VideoSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      'relative flex w-full touch-none items-center select-none',
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-4! w-full grow cursor-pointer">
      <div className="absolute mt-[7px] h-[2px] w-full grow overflow-hidden bg-stone-50/90" />
      <SliderPrimitive.Range className="from-primary absolute mt-[5px] h-[6px]! rounded-full bg-gradient-to-r via-rose-500 via-[90%] to-orange-600 shadow" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="border-primary bg-primary ring-offset-background focus-visible:ring-ring block h-1 w-3 rounded-full border-2 opacity-0 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
))
VideoSlider.displayName = SliderPrimitive.Root.displayName

export { VideoSlider }
