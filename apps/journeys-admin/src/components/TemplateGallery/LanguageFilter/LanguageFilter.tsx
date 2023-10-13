import { useQuery } from '@apollo/client'
import Button from '@mui/material/Button'
import castArray from 'lodash/castArray'
import { useRouter } from 'next/router'
import { ReactElement, useState } from 'react'

import Globe1Icon from '@core/shared/ui/icons/Globe1'

import { GetLanguages } from '../../../../__generated__/GetLanguages'
import { GET_LANGUAGES } from '../../Editor/EditToolbar/Menu/LanguageMenuItem/LanguageDialog'

import { LanguageFilterDialog } from './LanguageFilterDialog'

const DEFAULT_LANGUAGE_ID = '529'

export function LanguageFilter(): ReactElement {
  const { query } = useRouter()
  const [open, setOpen] = useState(false)

  const languageIds = castArray(query.languageIds)

  const { data, loading } = useQuery<GetLanguages>(GET_LANGUAGES, {
    variables: { languageId: DEFAULT_LANGUAGE_ID }
  })

  // make into a helper function?
  function getLanguage(languageId: string): string | undefined {
    const localName = data?.languages
      ?.find((language) => language?.id === languageId)
      ?.name?.find(({ primary }) => !primary)?.value
    const nativeName = data?.languages
      ?.find((language) => language?.id === languageId)
      ?.name?.find(({ primary }) => primary)?.value

    return localName ?? nativeName
  }

  // clean up
  function getLanguageNames(): string | undefined {
    const defaultLanguage = getLanguage(DEFAULT_LANGUAGE_ID)

    const multipleLanguages = languageIds.map((languageId) =>
      getLanguage(languageId)
    )

    if (multipleLanguages.length > 2) {
      return `${multipleLanguages[0] ?? ''}, ${multipleLanguages[1] ?? ''}, +${
        multipleLanguages.length - 2
      }`
    }
    if (multipleLanguages.length === 2) {
      return `${multipleLanguages[0] ?? ''}, ${multipleLanguages[1] ?? ''}`
    }

    if (multipleLanguages.length === 1) {
      return multipleLanguages[0]
    }
    return defaultLanguage
  }

  const languages = getLanguageNames()

  return (
    <>
      <Button
        data-testid="LanguageFilterButton"
        variant="outlined"
        onClick={() => setOpen(true)}
        startIcon={<Globe1Icon />}
        sx={{
          border: 'none',
          '&:hover': {
            border: 'none'
          }
        }}
      >
        {languages}
      </Button>
      <LanguageFilterDialog
        open={open}
        onClose={() => setOpen(false)}
        languages={data?.languages}
        loading={loading}
      />
    </>
  )
}
