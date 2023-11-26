import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { FormikValues } from 'formik'
import {
  ComponentProps,
  ReactElement,
  ReactNode,
  useEffect,
  useMemo,
  useState
} from 'react'
import { Trans, useTranslation } from 'react-i18next'

import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'

import { useLanguagesQuery } from '../../../libs/useLanguagesQuery'

import { convertLanguagesToOptions } from './convertLanguagesToOptions'
import { LanguagesFilterPopper } from './LanguagesFilterPopper/LanguagesFilterPopper'

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
            <Skeleton
              sx={{ width: { xs: 145, md: 274 }, height: { xs: 30, md: 36 } }}
            />
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
            <Skeleton
              sx={{ width: { xs: 145, md: 274 }, height: { xs: 30, md: 36 } }}
            />
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
  selectedLanguageIds: string[]
  onChange: (values: string[]) => void
}

export function HeaderAndLanguageFilter({
  selectedLanguageIds,
  onChange
}: LanguageFilterProps): ReactElement {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation('apps-journeys-admin')
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  useEffect(() => {
    const popperAnchor = document?.getElementById('popperAnchorLayer')
    if (popperAnchor != null) setAnchorEl(popperAnchor)
  }, [anchorEl])

  const { data, loading } = useLanguagesQuery({
    languageId: '529',
    where: {
      ids: [
        '529', // English
        '4415', // Italiano, Italian
        '1106', // Deutsch, German, Standard
        '4451', // polski, Polish
        '496', // Français, French
        '20526', // Shqip, Albanian
        '584', // Português, Portuguese, Brazil
        '21028', // Español, Spanish, Latin American
        '20615', // 普通話, Chinese, Mandarin
        '3934' // Русский, Russian
      ]
    }
  })

  const languageOptions = convertLanguagesToOptions(
    data?.languages.filter(({ id }) => selectedLanguageIds.includes(id))
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
    onClick: (e) => {
      setOpen(!open)
    }
  }

  function handleSubmit(values: FormikValues): void {
    const ids = values.languages.map((language) => language.id)
    onChange(ids)
  }

  const options = useMemo(() => {
    return (
      data?.languages?.map(({ id, name }) => {
        const localLanguageName = name.find(({ primary }) => !primary)?.value
        const nativeLanguageName = name.find(({ primary }) => primary)?.value

        return {
          id,
          localName: localLanguageName,
          nativeName: nativeLanguageName
        }
      }) ?? []
    )
  }, [data?.languages])

  const sortedOptions = useMemo(() => {
    if (options.length > 0) {
      return options.sort((a, b) => {
        return (a.localName ?? a.nativeName ?? '').localeCompare(
          b.localName ?? b.nativeName ?? ''
        )
      })
    }
    return []
  }, [options])

  return (
    <>
      <Stack
        gap={{ xs: 0, md: 2 }}
        alignItems="center"
        direction="row"
        flexWrap={{ xs: 'wrap', md: 'initial' }}
        sx={{ pb: { xs: 6, md: 9 }, position: 'relative' }}
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
        <Box
          id="popperAnchorLayer"
          sx={{
            position: 'absolute',
            width: 260,
            backgroundColor: 'transparent',
            left: { xs: '23px', md: '360px' },
            top: { xs: '50px', md: '42px' }
          }}
        />
      </Stack>
      <LanguagesFilterPopper
        initialValues={languageOptions}
        onSubmit={handleSubmit}
        setOpen={setOpen}
        open={open}
        anchorEl={anchorEl}
        sortedLanguages={sortedOptions}
      />
    </>
  )
}
