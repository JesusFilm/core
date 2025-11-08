import * as React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'

import { cn } from '@core/shared/uimodern/utils'

const VideoSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      'relative flex w-full touch-none select-none items-center',
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-4! w-full grow cursor-pointer">
      <div className="absolute h-[2px] mt-[7px] w-full grow overflow-hidden bg-stone-50/90" />
      <SliderPrimitive.Range
        className="absolute h-[6px]! mt-[5px] shadow bg-gradient-to-r from-primary via-rose-500 via-[90%] to-orange-600 rounded-full"
      />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-1 w-3 opacity-0 rounded-full border-2 border-primary bg-primary ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
))
VideoSlider.displayName = SliderPrimitive.Root.displayName

export { VideoSlider }

