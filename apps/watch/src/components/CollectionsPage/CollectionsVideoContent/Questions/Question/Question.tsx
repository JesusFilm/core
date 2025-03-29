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
        className="w-full text-left group hover:bg-white/5 px-6 xl:px-0 py-3 transition-colors cursor-pointer padded"
      >
        <div className="w-full">
          <div className="flex items-top justify-between">
            <p className="text-md xl:text-lg font-semibold text-stone-100 pr-4 text-balance leading-[1.6] flex ">
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
            <div className="p-2 text-stone-400 group-hover:text-white transition-colors flex ">
              <svg
                className={`w-6 h-6 transform transition-transform ${
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
        <div className="px-6 py-6 pb-12 text-stone-200/80 border-b border-stone-500/20">
          {children}
        </div>
      )}
    </>
  )
}
