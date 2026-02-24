import { Formik } from 'formik'
import { useTranslation } from 'next-i18next'
import { type FocusEvent, type ReactElement, useState } from 'react'

import Search1Icon from '@core/shared/ui/icons/Search1'
import X1Icon from '@core/shared/ui/icons/X1'
import { SubmitListener } from '@core/shared/ui/SubmitListener'
import { Input } from '@core/shared/ui-modern/components/input'

interface SimpleSearchBarProps {
  loading?: boolean
  value?: string
  onSearch?: (query: string) => void
  props?: { inputRef?: React.RefObject<HTMLInputElement | null> }
  onFocus?: (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onBlur?: (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}

export function SimpleSearchBar({
  loading = false,
  value = '',
  onSearch,
  props,
  onFocus,
  onBlur
}: SimpleSearchBarProps): ReactElement {
  const { t } = useTranslation('apps-watch')
  const [isFocused, setIsFocused] = useState(false)

  function handleSubmit(values: { title: string }): void {
    if (onSearch) {
      onSearch(values.title)
    }
  }

  return (
    <div data-testid="SearchBar">
      <Formik
        initialValues={{
          title: value
        }}
        enableReinitialize
        onSubmit={handleSubmit}
      >
        {({
          values,
          handleChange,
          handleBlur: formikHandleBlur,
          setFieldValue
        }) => (
          <>
            <div className="relative">
              <div className="absolute top-1/2 left-4 z-10 flex -translate-y-1/2 items-center">
                <Search1Icon
                  className={`h-5 w-5 ${isFocused ? 'text-black' : 'text-white'}`}
                />
              </div>
              <Input
                ref={props?.inputRef}
                data-testid="SearchBarInput"
                value={values.title}
                name="title"
                type="text"
                placeholder={t('Search videos by keyword...')}
                autoComplete="off"
                className={`w-full cursor-text rounded-[35px] border-none bg-white/10 py-3 pr-12 pl-12 text-lg text-white shadow-xl shadow-stone-800/10 outline-1 outline-white/20 backdrop-blur-[10px] transition-all duration-200 placeholder:text-white/70 hover:cursor-text focus:cursor-text focus:bg-white/80 focus:text-black focus:outline-none focus:placeholder:text-black/60 focus-visible:outline-none ${values.title.trim().length > 0 ? 'pr-12' : 'pr-4'} `}
                onChange={(event) => {
                  // Only update the form value, don't trigger search
                  handleChange(event)
                }}
                onBlur={(event) => {
                  setIsFocused(false)
                  formikHandleBlur(event)
                  onBlur?.(event)
                }}
                onFocus={(event) => {
                  setIsFocused(true)
                  onFocus?.(event)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    if (onSearch) {
                      onSearch(values.title)
                    }
                  }
                }}
              />
              {values.title.trim().length > 0 && (
                <div className="absolute top-1/2 right-4 z-10 flex -translate-y-1/2 cursor-pointer items-center">
                  {loading ? (
                    <div
                      className={`h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent ${isFocused ? 'text-black' : 'text-white'}`}
                    />
                  ) : (
                    <button
                      type="button"
                      aria-label="clear search"
                      className={`flex h-6 w-6 cursor-pointer items-center justify-center p-0 hover:opacity-70 ${isFocused ? 'text-black' : 'text-white'}`}
                      onClick={() => {
                        void setFieldValue('title', '')
                        if (onSearch) {
                          onSearch('')
                        }
                      }}
                    >
                      <X1Icon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
            <SubmitListener />
          </>
        )}
      </Formik>
    </div>
  )
}
