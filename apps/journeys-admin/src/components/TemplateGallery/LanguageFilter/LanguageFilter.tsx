import { useQuery } from '@apollo/client'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import dynamic from 'next/dynamic'
import { ReactElement, useState } from 'react'

import AddSquare4Icon from '@core/shared/ui/icons/AddSquare4'

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

  const { data, loading } = useQuery<GetLanguages>(GET_LANGUAGES)

  const localName = data?.languages
    ?.find((language) => language?.id === languageId)
    ?.name?.find(({ primary }) => !primary)?.value
  const nativeName = data?.languages
    ?.find((language) => language?.id === languageId)
    ?.name?.find(({ primary }) => primary)?.value

  return (
    <>
      <Button
        variant="outlined"
        onClick={() => setOpen(true)}
        startIcon={<AddSquare4Icon />}
        sx={{
          border: 'none',
          '&:hover': {
            border: 'none'
          }
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden'
          }}
        >
          {localName ?? nativeName}
        </Typography>
      </Button>
      {data?.languages != null && !loading && (
        <DynamicLanguageFilterDialog
          open={open}
          onClose={() => setOpen(false)}
          onChange={onChange}
          languages={data?.languages}
          languageId={languageId}
          loading={loading}
        />
      )}
    </>
  )
}
