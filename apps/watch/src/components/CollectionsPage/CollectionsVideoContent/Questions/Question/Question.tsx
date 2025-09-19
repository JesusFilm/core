import { ReactElement, ReactNode } from 'react'

import { Icon } from '@core/shared/ui/icons/Icon'

interface QuestionProps {
  question: string
  isOpen: boolean
  onToggle: () => void
  children: ReactNode
}

export function Question({
  question,
  isOpen,
  onToggle,
  children
}: QuestionProps): ReactElement {
  return (
    <>
      <button
        onClick={onToggle}
        className="group padded w-full cursor-pointer rounded-lg py-3 text-left transition-colors hover:bg-white/5"
      >
        <div className="w-full">
          <div className="items-top flex justify-between">
            <p className="text-md flex leading-[1.6] font-semibold text-stone-100 sm:pr-4 md:text-lg md:text-balance">
              <Icon
                name="HelpSquareContained"
                sx={{
                  opacity: 0.2,
                  mr: 6,
                  mt: 1
                }}
              />{' '}
              {question}
            </p>
            <div className="flex hidden p-2 text-stone-400 transition-colors group-hover:text-white sm:block">
              <svg
                className={`h-6 w-6 transform transition-transform ${
                  isOpen ? 'rotate-180' : ''
                }`}
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"
                />
              </svg>
            </div>
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="padded border-b border-stone-500/20 py-6 pb-12 text-stone-200/80">
          {children}
        </div>
      )}
    </>
  )
}
