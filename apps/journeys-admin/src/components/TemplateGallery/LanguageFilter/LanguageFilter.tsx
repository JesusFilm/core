import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useLanguagesQuery } from '../../../libs/useLanguagesQuery'

import { getLanguages } from './getLanguages'
import { LanguageFilterDialog } from './LanguageFilterDialog'

interface LanguageFilterProps {
  languageIds: string[]
  onChange: (values: string[]) => void
}

export function LanguageFilter({
  languageIds,
  onChange
}: LanguageFilterProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [open, setOpen] = useState(false)

  const { data, loading } = useLanguagesQuery({ languageId: '529' })

  const languageNames = getLanguages(languageIds, data?.languages)
    ?.map(
      (languageName) => languageName.localName ?? languageName.nativeName ?? ' '
    )
    .join(', ')

  return (
    <>
      <Stack direction="row" alignItems="center" justifyContent="center">
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
            {loading ? <Skeleton width={61} /> : languageNames}
          </Typography>
        </Button>
      </Stack>
      <LanguageFilterDialog
        open={open}
        onClose={() => setOpen(false)}
        onChange={onChange}
        languages={data?.languages}
        languageIds={languageIds}
        loading={loading}
      />
    </>
  )
}
