import { Range, Root, Thumb, Track } from '@radix-ui/react-slider'
import React from 'react'

import { cn } from '@core/shared/uimodern/utils'

const VideoSlider = React.forwardRef<
  React.ElementRef<typeof Root>,
  React.ComponentPropsWithoutRef<typeof Root>
>(({ className, ...props }, ref) => (
  <Root
    ref={ref}
    className={cn(
      'relative flex w-full touch-none select-none items-center',
      className
    )}
    {...props}
  >
    <Track className="relative h-4! w-full grow cursor-pointer">
      <div className="absolute h-[2px] mt-[7px] w-full grow overflow-hidden bg-stone-50/90" />
      <Range
        className="absolute h-[6px]! mt-[5px] shadow bg-gradient-to-r from-primary via-rose-500 via-[90%] to-orange-600 rounded-full"
      />
    </Track>
    <Thumb className="block h-1 w-3 opacity-0 rounded-full border-2 border-primary bg-primary ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
  </Root>
))
VideoSlider.displayName = Root.displayName

export { VideoSlider }

