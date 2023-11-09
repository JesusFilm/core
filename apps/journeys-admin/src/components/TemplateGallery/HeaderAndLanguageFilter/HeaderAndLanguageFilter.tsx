import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement, ReactNode, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'

import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'

import { useLanguagesQuery } from '../../../libs/useLanguagesQuery'

import { convertLanguagesToOptions } from './convertLanguagesToOptions'
import { LanguageFilterDialog } from './LanguageFilterDialog'

interface LanguageFilterProps {
  languageIds: string[]
  onChange: (values: string[]) => void
}

export function HeaderAndLanguageFilter({
  languageIds,
  onChange
}: LanguageFilterProps): ReactElement {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation('apps-journeys-admin')

  const { data, loading } = useLanguagesQuery({
    languageId: '529'
  })

  const languages = convertLanguagesToOptions(
    languageIds,
    data?.languages
  )?.map(
    (languageName) => languageName.localName ?? languageName.nativeName ?? ' '
  )
  const [firstLanguage, secondLanguage] = languages
  const count = languages.length

  const LocalButton = ({ children }): ReactElement => (
    <Button
      variant="outlined"
      size="small"
      onClick={() => setOpen(true)}
      sx={{
        border: 'none',
        '&:hover': {
          border: 'none'
        },
        px: 1
      }}
    >
      <Typography
        variant="h1"
        sx={{
          display: { xs: 'none', lg: 'block' },
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          overflow: 'hidden'
        }}
      >
        {loading ? <Skeleton width={61} /> : children}
      </Typography>
      <Typography
        variant="h6"
        sx={{
          display: { xs: 'block', lg: 'none' },
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          overflow: 'hidden'
        }}
      >
        {loading ? <Skeleton width={61} /> : children}
      </Typography>
      {!loading && (
        <>
          <ChevronDownIcon
            fontSize="large"
            sx={{ display: { xs: 'none', md: 'block' } }}
          />
          <ChevronDownIcon sx={{ display: { xs: 'block', md: 'none' } }} />
        </>
      )}
    </Button>
  )

  const LocalTypography = ({
    children,
    color
  }: {
    children: ReactNode
    color?: string
  }): ReactElement => (
    <>
      <Typography
        variant="h1"
        color={color}
        sx={{
          display: { xs: 'none', lg: 'block' }
        }}
      >
        {children}
      </Typography>
      <Typography
        variant="h6"
        color={color}
        sx={{
          display: { xs: 'block', lg: 'none' }
        }}
      >
        {children}
      </Typography>
    </>
  )

  return (
    <>
      <Stack
        gap={{ xs: 0, md: 2 }}
        alignItems={{ xs: 'start', md: 'center' }}
        sx={{
          pb: { xs: 6, md: 9 },
          flexDirection: { xs: 'column', md: 'row' }
        }}
      >
        {count === 2 && (
          <Trans t={t} values={{ firstLanguage, secondLanguage }}>
            <LocalTypography>Journey Templates</LocalTypography>
            <Stack direction="row" gap={1} alignItems="center">
              <LocalTypography color="text.secondary">in</LocalTypography>
              <LocalButton>
                {{ firstLanguage }} {{ secondLanguage }}
              </LocalButton>
            </Stack>
          </Trans>
        )}
        {count !== 2 && (
          <Trans t={t} values={{ firstLanguage }} count={count}>
            <LocalTypography>Journey Templates</LocalTypography>
            <Stack direction="row" gap={1} alignItems="center">
              <LocalTypography color="text.secondary">in</LocalTypography>
              <LocalButton>{{ firstLanguage }}</LocalButton>
            </Stack>
          </Trans>
        )}
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
