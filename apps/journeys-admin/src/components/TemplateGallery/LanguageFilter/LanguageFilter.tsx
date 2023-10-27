import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation('apps-journeys-admin')
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
      <Stack alignItems="center" justifyContent="center">
        {!loading && (
          <Typography variant="subtitle3">
            {t('Filter by language:')}
          </Typography>
        )}
        <Button
          variant="outlined"
          size="small"
          onClick={() => setOpen(true)}
          sx={{
            border: 'none',
            '&:hover': {
              border: 'none'
            }
          }}
        >
          <Typography
            variant="subtitle3"
            sx={{
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              overflow: 'hidden'
            }}
          >
            {loading ? <Skeleton width={61} /> : localName ?? nativeName}
          </Typography>
        </Button>
      </Stack>
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
