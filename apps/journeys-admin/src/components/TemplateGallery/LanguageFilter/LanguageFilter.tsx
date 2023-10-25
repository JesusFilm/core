import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import { ReactElement, useState } from 'react'

import AddSquare4Icon from '@core/shared/ui/icons/AddSquare4'

import { useLanguagesQuery } from '../../../libs/useLanguagesQuery'

import { LanguageFilterDialog } from './LanguageFilterDialog'

interface LanguageFilterProps {
  languageId: string
  onChange: (value) => void
}

export function LanguageFilter({
  languageId,
  onChange
}: LanguageFilterProps): ReactElement {
  const [open, setOpen] = useState(false)

  const { data, loading } = useLanguagesQuery({ languageId: '529' })

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
          {loading ? <Skeleton width={61} /> : localName ?? nativeName}
        </Typography>
      </Button>
      <LanguageFilterDialog
        open={open}
        onClose={() => setOpen(false)}
        onChange={onChange}
        languages={data?.languages}
        languageId={languageId}
        loading={loading}
      />
    </>
  )
}
