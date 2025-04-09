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
        className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-xs text-black font-bold uppercase tracking-wider rounded-full bg-white hover:bg-red-500 hover:text-white transition-colors duration-200 cursor-pointer"
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
