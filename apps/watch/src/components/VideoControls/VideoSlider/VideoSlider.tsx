import { Range, Root, Thumb, Track } from '@radix-ui/react-slider'
import { ComponentPropsWithoutRef, ComponentRef, forwardRef } from 'react'

import { cn } from '@core/shared/ui-modern/utils'

const VideoSlider = forwardRef<
  ComponentRef<typeof Root>,
  ComponentPropsWithoutRef<typeof Root>
>(({ className, ...props }, ref) => (
  <Root
    ref={ref}
    className={cn(
      'relative flex w-full touch-none items-center select-none',
      className
    )}
    {...props}
  >
    <Track className="relative h-4! w-full grow cursor-pointer">
      <div className="absolute mt-[7px] h-[2px] w-full grow overflow-hidden bg-stone-50/90" />
      <Range className="from-primary absolute mt-[5px] h-[6px]! rounded-full bg-gradient-to-r via-rose-500 via-[90%] to-orange-600 shadow" />
    </Track>
    <Thumb className="border-primary bg-primary ring-offset-background focus-visible:ring-ring block h-1 w-3 rounded-full border-2 opacity-0 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50" />
  </Root>
))
VideoSlider.displayName = Root.displayName

export { VideoSlider }
