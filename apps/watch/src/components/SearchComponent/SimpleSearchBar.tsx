<<<<<<< HEAD
import Search1Icon from '@core/shared/ui/icons/Search1'
import X1Icon from '@core/shared/ui/icons/X1'
import { SubmitListener } from '@core/shared/ui/SubmitListener'
import { Button } from '@ui/components/button'
import { Formik } from 'formik'
import { Input } from '@ui/components/input'
import { useTranslation } from 'next-i18next'
import { type FocusEvent, type ReactElement, useState } from 'react'
=======
import { Button } from '@ui/components/button'
import { Input } from '@ui/components/input'
import { Formik } from 'formik'
import { useTranslation } from 'next-i18next'
import { type FocusEvent, type ReactElement, useState } from 'react'

import Search1Icon from '@core/shared/ui/icons/Search1'
import X1Icon from '@core/shared/ui/icons/X1'
import { SubmitListener } from '@core/shared/ui/SubmitListener'
>>>>>>> 211ca2436 (chore: update pnpm lockfile and refactor component imports)

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
              <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex items-center">
                <Search1Icon
                  className={`w-5 h-5 ${isFocused ? 'text-black' : 'text-white'}`}
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
                className={`
                  w-full pl-12 pr-12 py-6 text-lg rounded-[35px] border-none outline-1 outline-white/20 shadow-xl shadow-stone-800/10 
                  bg-white/10 backdrop-blur-[10px] transition-all duration-200
                  text-white placeholder:text-white/70 cursor-text hover:cursor-text focus:cursor-text
                  focus:bg-white/80 focus:text-black focus:placeholder:text-black/60
                  ${values.title.trim().length > 0 ? 'pr-12' : 'pr-4'}
                `}
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
                <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex items-center cursor-pointer">
                  {loading ? (
                    <div
                      className={`w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin ${isFocused ? 'text-black' : 'text-white'}`}
                    />
                  ) : (
                    <button
                      type="button"
                      aria-label="clear search"
                      className={`w-6 h-6 p-0 cursor-pointer hover:opacity-70 flex items-center justify-center ${isFocused ? 'text-black' : 'text-white'}`}
                      onClick={() => {
                        setFieldValue('title', '')
                        if (onSearch) {
                          onSearch('')
                        }
                      }}
                    >
                      <X1Icon className="w-4 h-4" />
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
