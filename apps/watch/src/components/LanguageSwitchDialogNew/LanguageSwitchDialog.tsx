import { gql, useLazyQuery } from '@apollo/client'
import { ThemeProvider } from '@mui/material/styles'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useRef } from 'react'

import { websiteLight } from '@core/shared/ui/themes/website/theme'

import { GetAllLanguages } from '../../../__generated__/GetAllLanguages'
import { useWatch } from '../../libs/watchContext'

import { AudioTrackSelect } from './AudioTrackSelect'
import { SiteLanguageSelect } from './SiteLanguageSelect'
import { SubtitlesSelect } from './SubtitlesSelect'

export const GET_ALL_LANGUAGES = gql`
  query GetAllLanguages {
    languages {
      id
      bcp47
      slug
      name {
        primary
        value
      }
    }
  }
`

interface LanguageSwitchDialogProps {
  open: boolean
  handleClose: () => void
}

export function LanguageSwitchDialog({
  open,
  handleClose
}: LanguageSwitchDialogProps): ReactElement {
  const { t } = useTranslation()
  const router = useRouter()
  const {
    state: { allLanguages },
    dispatch
  } = useWatch()
  const [getAllLanguages, { loading: languagesLoading }] =
    useLazyQuery<GetAllLanguages>(GET_ALL_LANGUAGES, {
      onCompleted: (data) => {
        if (data?.languages && !allLanguages) {
          dispatch({
            type: 'SetAllLanguages',
            allLanguages: data.languages
          })
        }
      }
    })

  const dialogRef = useRef<HTMLDivElement>(null)

  // Fetch languages when dialog opens if needed
  useEffect(() => {
    if (open && !allLanguages && !languagesLoading) {
      void getAllLanguages()
    }
  }, [open, allLanguages, languagesLoading, getAllLanguages])

  // Set router in context when component mounts
  useEffect(() => {
    dispatch({
      type: 'SetRouter',
      router
    })
  }, [router, dispatch])

  return !open ? (
    <></>
  ) : (
    <ThemeProvider theme={websiteLight}>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-gray-900/10 backdrop-blur-sm transition-opacity"
          onClick={handleClose}
          aria-hidden="true"
        />

        {/* Dialog */}
        <div className="flex min-h-full items-center justify-center p-4">
          <div
            ref={dialogRef}
            className="relative w-full max-w-md transform rounded-lg bg-white shadow-xl transition-all"
            role="dialog"
            aria-modal="true"
            aria-label="Language Settings"
          >
            <div className="mt-8 mb-6 flex items-center justify-end">
              <button
                onClick={handleClose}
                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 mx-6"
                aria-label="Close dialog"
              >
                <span className="sr-only">{t('Close')}</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mt-6 mb-8">
              <SiteLanguageSelect />
              <hr className="border-t border-gray-200 w-full my-8" />
              <AudioTrackSelect />
              <SubtitlesSelect />
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}
