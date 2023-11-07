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

  const { filteredLanguages, loading } = useLanguagesQuery({
    languageId: '529'
  })

  const formatLanguages = (): string => {
    const languageNames = getLanguages(languageIds, filteredLanguages)?.map(
      (languageName) => languageName.localName ?? languageName.nativeName ?? ' '
    )
    if (languageNames.length === 0) {
      return 'All Languages'
    }
    if (languageNames.length > 2) {
      const remaining = languageNames.length - 2
      return `${languageNames.slice(0, 2).join(', ')}, +${remaining}`
    }
    return languageNames.join(', ')
  }
  const languageNames = formatLanguages()

  return (
    <>
      <Stack direction="row" alignItems="center" justifyContent="center">
        {!loading && (
          <Typography variant="subtitle3" sx={{ flexShrink: 0 }}>
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
        languages={filteredLanguages}
        languageIds={languageIds}
        loading={loading}
      />
    </>
  )
}
