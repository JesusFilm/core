import Box from '@mui/material/Box'
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

interface LocalTypographyProps extends ComponentProps<typeof Typography> {}

function LocalTypography(props: LocalTypographyProps): ReactElement {
  return (
    <>
      <Typography
        {...props}
        variant="h1"
        sx={{
          display: { xs: 'none', md: 'block' },
          flexShrink: 0,
          ...props.sx
        }}
      />
      <Typography
        {...props}
        variant="h6"
        sx={{
          display: { xs: 'block', md: 'none' },
          flexShrink: 0,
          ...props.sx
        }}
      />
    </>
  )
}

interface LocalButtonProps
  extends Omit<ComponentProps<typeof Button>, 'children'> {
  children?: ComponentProps<typeof Trans>['children']
  loading?: boolean
}

function LocalButton({
  children,
  loading,
  ...props
}: LocalButtonProps): ReactElement {
  return (
    <Box sx={{ flex: 1, overflow: 'hidden' }}>
      <Button
        {...props}
        variant="outlined"
        size="small"
        sx={{
          border: 'none',
          '&:hover': {
            border: 'none'
          },
          px: 1,
          maxWidth: '100%',
          ...props.sx
        }}
      >
        <Typography
          variant="h1"
          sx={{
            display: { xs: 'none', md: 'block' },
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden'
          }}
        >
          {loading === true ? (
            <Skeleton width={61} />
          ) : (
            (children as unknown as ReactNode)
          )}
        </Typography>
        <Typography
          variant="h6"
          sx={{
            display: { xs: 'block', md: 'none' },
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden'
          }}
        >
          {loading === true ? (
            <Skeleton width={61} />
          ) : (
            (children as unknown as ReactNode)
          )}
        </Typography>
        {loading !== true && (
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
        '529', // English
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

  const languageOptions = convertLanguagesToOptions(
    data?.languages.filter(({ id }) => languageIds.includes(id))
  )

  const languageNames = languageOptions.map(
    (languageName) => languageName.localName ?? languageName.nativeName ?? ' '
  )
  const [firstLanguage, secondLanguage] = languageNames
  const count = languageNames.length

  const journeyTemplatesTypographyProps: LocalTypographyProps = {
    sx: { flexBasis: { xs: '100%', md: 'initial' } }
  }
  const inTypographyProps: LocalTypographyProps = {
    color: 'text.secondary',
    sx: { flex: 0 }
  }
  const localButtonProps: LocalButtonProps = {
    loading,
    onClick: () => setOpen(true)
  }

  return (
    <>
      <Stack
        gap={{ xs: 0, md: 2 }}
        alignItems="center"
        direction="row"
        flexWrap={{ xs: 'wrap', md: 'initial' }}
        sx={{ pb: { xs: 6, md: 9 } }}
      >
        {count === 2 && (
          <Trans t={t} values={{ firstLanguage, secondLanguage }}>
            <LocalTypography {...journeyTemplatesTypographyProps}>
              Journey Templates
            </LocalTypography>
            <LocalTypography {...inTypographyProps}>in</LocalTypography>
            <LocalButton {...localButtonProps}>
              {{ firstLanguage }} {{ secondLanguage }}
            </LocalButton>
          </Trans>
        )}
        {count !== 2 && (
          <Trans t={t} values={{ firstLanguage }} count={count}>
            <LocalTypography {...journeyTemplatesTypographyProps}>
              Journey Templates
            </LocalTypography>
            <LocalTypography {...inTypographyProps}>in</LocalTypography>
            <LocalButton {...localButtonProps}>{{ firstLanguage }}</LocalButton>
          </Trans>
        )}
      </Stack>
      <LanguageFilterDialog
        open={open}
        onClose={() => setOpen(false)}
        onChange={onChange}
        languages={data?.languages}
        value={languageOptions}
        loading={loading}
      />
    </>
  )
}
