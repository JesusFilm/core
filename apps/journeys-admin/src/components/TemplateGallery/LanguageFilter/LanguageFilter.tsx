import { useQuery } from '@apollo/client'
import Button from '@mui/material/Button'
import dynamic from 'next/dynamic'
import { ReactElement, useState } from 'react'

import Globe1Icon from '@core/shared/ui/icons/Globe1'

import { GetLanguages } from '../../../../__generated__/GetLanguages'
import { GET_LANGUAGES } from '../../Editor/EditToolbar/Menu/LanguageMenuItem/LanguageDialog'

import type { LanguageFilterDialogProps } from './LanguageFilterDialog'

const DynamicLanguageFilterDialog = dynamic<LanguageFilterDialogProps>(
  async () =>
    await import(
      /* webpackChunkName: "AudioLanguageDialog" */
      './LanguageFilterDialog'
    ).then((mod) => mod.LanguageFilterDialog)
)

interface LanguageFilterProps {
  languageId: string
  onChange: (value) => void
}

export function LanguageFilter({
  languageId,
  onChange
}: LanguageFilterProps): ReactElement {
  const [open, setOpen] = useState(false)

  const { data, loading } = useQuery<GetLanguages>(GET_LANGUAGES, {
    variables: { languageId }
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
          onChange={onChange}
          languages={data?.languages}
          loading={loading}
        />
      )}
    </>
  )
}
