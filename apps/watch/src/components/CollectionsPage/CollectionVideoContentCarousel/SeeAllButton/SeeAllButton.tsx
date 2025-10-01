import { ReactElement } from 'react'

import Play3 from '@core/shared/ui/icons/Play3'

interface SeeAllButtonProps {
  /**
   * The text to display in the button
   */
  text: string
  /**
   * The function to call when the button is clicked
   */
}

export const SeeAllButton = ({ text }: SeeAllButtonProps): ReactElement => {
  return (
    <a
      href="https://www.jesusfilm.org/watch?utm_source=jesusfilm-watch"
      target="_blank"
    >
      <button
        aria-label="See all videos"
        tabIndex={0}
        className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold tracking-wider text-black uppercase transition-colors duration-200 hover:bg-red-500 hover:text-white"
      >
        <Play3
          name="Play3"
          sx={{
            width: 16,
            height: 16
          }}
        />
        <span>{text}</span>
      </button>
    </a>
  )
}
