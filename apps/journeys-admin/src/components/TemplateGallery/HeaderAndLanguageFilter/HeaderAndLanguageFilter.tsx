import { Box } from '@mui/material'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ComponentProps, ReactElement, ReactNode, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'

import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'

import { useLanguagesQuery } from '../../../libs/useLanguagesQuery'

import { convertLanguagesToOptions } from './convertLanguagesToOptions'
import { LanguageFilterDialog } from './LanguageFilterDialog'

function LocalTypography(
  props: ComponentProps<typeof Typography>
): ReactElement {
  return (
    <>
      <Typography
        {...props}
        variant="h1"
        sx={{
          display: { xs: 'none', lg: 'block' },
          flexShrink: 0,
          ...props.sx
        }}
      />
      <Typography
        {...props}
        variant="h6"
        sx={{
          display: { xs: 'block', lg: 'none' },
          flexShrink: 0,
          ...props.sx
        }}
      />
    </>
  )
}

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
    languageId: '529',
    where: {
      ids: [
        '529',
        '4415',
        '1106',
        '4451',
        '496',
        '20526',
        '584',
        '21028',
        '20615',
        '3934'
      ]
    }
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
    <Box sx={{ flexGrow: 1, flexShrink: 1, flexBasis: '0%' }}>
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
    </Box>
  )

  return (
    <>
      <Stack
        gap={{ xs: 0, md: 2 }}
        alignItems={{ xs: 'start', md: 'center' }}
        direction="row"
        flexWrap={{ xs: 'wrap', md: 'initial' }}
        sx={{
          pb: { xs: 6, md: 9 }
        }}
      >
        {count === 2 && (
          <Trans t={t} values={{ firstLanguage, secondLanguage }}>
            <LocalTypography
              sx={{
                flexBasis: { xs: '100%', md: 'initial' }
              }}
            >
              Journey Templates
            </LocalTypography>
            <LocalTypography color="text.secondary" sx={{ flex: 0 }}>
              in
            </LocalTypography>
            <LocalButton>
              {{ firstLanguage }} {{ secondLanguage }}
            </LocalButton>
          </Trans>
        )}
        {count !== 2 && (
          <Trans t={t} values={{ firstLanguage }} count={count}>
            <LocalTypography
              sx={{
                flexBasis: { xs: '100%', md: 'initial' }
              }}
            >
              Journey Templates
            </LocalTypography>
            <LocalTypography color="text.secondary" sx={{ flex: 0 }}>
              in
            </LocalTypography>
            <LocalButton>{{ firstLanguage }}</LocalButton>
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
