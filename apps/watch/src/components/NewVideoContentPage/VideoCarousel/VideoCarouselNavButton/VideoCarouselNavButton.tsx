import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import { ReactElement, forwardRef } from 'react'

interface VideoCarouselNavButtonProps {
  variant: 'prev' | 'next'
  disabled?: boolean
}

export const VideoCarouselNavButton = forwardRef<
  HTMLButtonElement,
  VideoCarouselNavButtonProps
>(function VideoCarouselNavButton(
  { variant, disabled = false },
  ref
): ReactElement {
  const baseClasses = [
    'absolute',
    'z-[1]',
    'flex',
    'justify-center',
    'items-center',
    'text-white',
    'top-0',
    'bottom-0',
    'transition-opacity',
    'duration-200',
    'ease-out',
    'w-[42px]'
  ]

  const opacityClasses = disabled
    ? ['opacity-0']
    : ['opacity-0', 'xl:opacity-100']

  const cursorClasses = disabled
    ? ['cursor-none', 'pointer-events-none']
    : ['cursor-pointer']

  const positionClasses = variant === 'prev' ? ['left-0'] : ['right-0']

  const gradientClasses =
    variant === 'next'
      ? ['bg-gradient-to-r', 'from-transparent', 'to-[#131111]']
      : ['bg-gradient-to-l', 'from-transparent', 'to-[#131111]']

  const allClasses = [
    ...baseClasses,
    ...opacityClasses,
    ...cursorClasses,
    ...positionClasses,
    ...gradientClasses
  ].join(' ')

  return (
    <button
      ref={ref}
      className={`${allClasses} swiper-button-disabled:opacity-0 swiper-button-disabled:cursor-auto swiper-button-disabled:pointer-events-none`}
      data-testid="NavButton"
    >
      {variant === 'prev' ? (
        <NavigateBeforeIcon fontSize="large" />
      ) : (
        <NavigateNextIcon fontSize="large" />
      )}
    </button>
  )
})
