import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Checkbox from '@mui/material/Checkbox'
import MuiPopper from '@mui/material/Popper'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { FieldArray, Form, Formik, FormikValues } from 'formik'
import {
  ComponentProps,
  ReactElement,
  ReactNode,
  useMemo,
  useState
} from 'react'
import { Trans, useTranslation } from 'react-i18next'

import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'

import { useLanguagesQuery } from '../../../libs/useLanguagesQuery'

import { convertLanguagesToOptions } from './convertLanguagesToOptions'

const StyledPopperOption = styled(ButtonBase)(() => ({
  backgroundColor: 'transparent',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  flexGrow: 1
}))

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
      setAnchorEl(e.currentTarget)
      setOpen(!open)
    }
  }

  function handleSubmit(values: FormikValues): void {
    const ids = values.languages.map((language) => language.id)
    onChange(ids)
    setOpen((prev) => !prev)
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

      <Formik
        initialValues={{
          languages: languageOptions
        }}
        onSubmit={(values) => handleSubmit(values)}
        enableReinitialize
      >
        {({ values, handleSubmit }) => (
          <>
            <Box
              data-testid="PresentationLayer"
              onClick={async () => {
                await handleSubmit()
              }}
              sx={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: 'transparent',
                zIndex: 9999,
                display: open ? 'block' : 'none'
              }}
            />
            <Form
              style={{
                display: open ? 'block' : 'none',
                width: '100%',
                maxWidth: 'calc(100% - 25px)'
              }}
            >
              <FieldArray name="languages">
                {({ push, remove }) => (
                  <MuiPopper
                    open={open}
                    anchorEl={anchorEl}
                    sx={{
                      zIndex: 9999,
                      py: 2,
                      backgroundColor: 'background.paper',
                      borderRadius: 1,
                      boxShadow: 2,
                      minWidth: 250,
                      width: { xs: '100%', lg: anchorEl?.clientWidth }
                    }}
                    placement="bottom"
                  >
                    <Stack>
                      {sortedOptions.map(({ localName, nativeName, id }) => {
                        function handleChange(): void {
                          values.languages.some(
                            (language) => language.id === id
                          )
                            ? remove(
                                values.languages.findIndex(
                                  (lang) => lang.id === id
                                )
                              )
                            : push({ id, localName, nativeName })
                        }
                        return (
                          <StyledPopperOption
                            value={id}
                            key={id}
                            onClick={handleChange}
                          >
                            <Checkbox
                              name="languages"
                              value={id}
                              icon={
                                <CheckBoxOutlineBlankIcon fontSize="small" />
                              }
                              checkedIcon={<CheckBoxIcon fontSize="small" />}
                              sx={{ mr: 2 }}
                              onChange={handleChange}
                              checked={values?.languages?.some(
                                (language) => language.id === id
                              )}
                            />
                            <Stack alignItems="flex-start" sx={{ pr: 2 }}>
                              <Typography>{localName ?? nativeName}</Typography>
                              {localName != null && nativeName != null && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {nativeName}
                                </Typography>
                              )}
                            </Stack>
                          </StyledPopperOption>
                        )
                      })}
                    </Stack>
                  </MuiPopper>
                )}
              </FieldArray>
            </Form>
          </>
        )}
      </Formik>
    </>
  )
}
