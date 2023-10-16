import { useQuery } from '@apollo/client'
import Button from '@mui/material/Button'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { ReactElement, useState } from 'react'

import Globe1Icon from '@core/shared/ui/icons/Globe1'
import type { Language } from '@core/shared/ui/LanguageAutocomplete'

import { GetLanguages } from '../../../../__generated__/GetLanguages'
import { GET_LANGUAGES } from '../../Editor/EditToolbar/Menu/LanguageMenuItem/LanguageDialog'

const DynamicLanguageFilterDialog = dynamic<{
  open: boolean
  onClose: () => void
  languages?: Language[]
  loading: boolean
}>(
  async () =>
    await import(
      /* webpackChunkName: "AudioLanguageDialog" */
      './LanguageFilterDialog'
    ).then((mod) => mod.LanguageFilterDialog)
)

const DEFAULT_LANGUAGE_ID = '529'

export function LanguageFilter(): ReactElement {
  const { query } = useRouter()
  const [open, setOpen] = useState(false)

  const { data, loading } = useQuery<GetLanguages>(GET_LANGUAGES, {
    variables: { languageId: DEFAULT_LANGUAGE_ID }
  })

  function getLanguage(languageId: string): string | undefined {
    const localName = data?.languages
      ?.find((language) => language?.id === languageId)
      ?.name?.find(({ primary }) => !primary)?.value
    const nativeName = data?.languages
      ?.find((language) => language?.id === languageId)
      ?.name?.find(({ primary }) => primary)?.value

    return localName ?? nativeName
  }

  const languageId =
    query.languageId != null && !Array.isArray(query.languageId)
      ? query.languageId
      : DEFAULT_LANGUAGE_ID

  const language = getLanguage(languageId)

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
        {language}
      </Button>
      {data?.languages != null && !loading && (
        <DynamicLanguageFilterDialog
          open={open}
          onClose={() => setOpen(false)}
          languages={data?.languages}
          loading={loading}
        />
      )}
    </>
  )
}
