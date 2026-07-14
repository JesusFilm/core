'use client'

import { gql, useMutation, useQuery } from '@apollo/client'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Form, Formik } from 'formik'
import NextLink from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack'
import { ReactElement, ReactNode, useMemo } from 'react'

import { CancelButton } from '../../../../../components/CancelButton'
import { SaveButton } from '../../../../../components/SaveButton'
import {
  DEFAULT_LANGUAGE_ID,
  GET_LANGUAGE_STUDIO_MANAGED_FILMS,
  LANGUAGE_STUDIO_MANAGED_FILM_IDS,
  LINKED_LANGUAGE_STUDIO_MANAGED_FILMS_LABEL,
  getLanguageStudioManagedFilmPath,
  getLinkedLanguageStudioManagedFilmsForLanguage
} from '../../_LanguageStudioManagedFilms/languageStudioManagedFilms'
import type {
  GetLanguageStudioManagedFilmsData,
  GetLanguageStudioManagedFilmsVariables
} from '../../_LanguageStudioManagedFilms/languageStudioManagedFilms'
import {
  CountryLanguageLink,
  LanguageCountryLinks
} from '../_LanguageCountryLinks'

export const GET_LANGUAGE = gql`
  query GetLanguageForAdmin($id: ID!, $nameLanguageId: ID) {
    language(id: $id) {
      id
      bcp47
      iso3
      slug
      name(languageId: $nameLanguageId) {
        id
        languageId
        value
        primary
      }
      nativeName: name(primary: true) {
        id
        languageId
        value
        primary
      }
      countryLanguages {
        id
        speakers
        displaySpeakers
        primary
        suggested
        order
        country {
          id
          name(languageId: $nameLanguageId) {
            value
            primary
          }
        }
      }
    }
  }
`

export const UPDATE_LANGUAGE = gql`
  mutation UpdateLanguage($input: LanguageUpdateInput!) {
    languageUpdate(input: $input) {
      id
      bcp47
      iso3
    }
  }
`

export const UPDATE_LANGUAGE_NAME = gql`
  mutation UpdateLanguageName($input: LanguageNameUpdateInput!) {
    languageNameUpdate(input: $input) {
      id
      name {
        id
        languageId
        value
        primary
      }
    }
  }
`

interface LanguageName {
  id: string
  languageId: string
  value: string
  primary: boolean
}

interface Language {
  id: string
  bcp47?: string | null
  iso3?: string | null
  slug?: string | null
  name: LanguageName[]
  nativeName: LanguageName[]
  countryLanguages: CountryLanguageLink[]
}

interface GetLanguageData {
  language?: Language | null
}

interface GetLanguageVariables {
  id: string
  nameLanguageId: string
}

interface LanguageFormValues {
  name: string
  nativeName: string
  bcp47: string
  iso3: string
}

function getPrimaryName(names: LanguageName[]): LanguageName | undefined {
  return names.find((name) => name.primary) ?? names[0]
}

function getLocalizedName(names: LanguageName[]): LanguageName | undefined {
  return (
    names.find((name) => name.languageId === DEFAULT_LANGUAGE_ID) ??
    getPrimaryName(names)
  )
}

function LanguageEditorShell({
  children
}: {
  children: ReactNode
}): ReactElement {
  return (
    <Stack
      sx={{
        width: '100%',
        maxWidth: { sm: '100%', md: '900px' },
        alignSelf: 'stretch',
        pt: { xs: 4, md: 0 }
      }}
      spacing={2}
    >
      {children}
    </Stack>
  )
}

export function LanguageForm(): ReactElement {
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const { languageId } = useParams<{ languageId: string }>()

  const { data, loading, refetch } = useQuery<
    GetLanguageData,
    GetLanguageVariables
  >(GET_LANGUAGE, {
    variables: { id: languageId, nameLanguageId: DEFAULT_LANGUAGE_ID }
  })
  const { data: linkedFilmsData, loading: linkedFilmsLoading } = useQuery<
    GetLanguageStudioManagedFilmsData,
    GetLanguageStudioManagedFilmsVariables
  >(GET_LANGUAGE_STUDIO_MANAGED_FILMS, {
    variables: {
      ids: LANGUAGE_STUDIO_MANAGED_FILM_IDS,
      languageId: DEFAULT_LANGUAGE_ID
    }
  })

  const [updateLanguage] = useMutation(UPDATE_LANGUAGE)
  const [updateLanguageName] = useMutation(UPDATE_LANGUAGE_NAME)

  const language = data?.language
  const localizedName = useMemo(
    () => getLocalizedName(language?.name ?? []),
    [language?.name]
  )
  const primaryName = useMemo(
    () => getPrimaryName(language?.nativeName ?? []),
    [language?.nativeName]
  )
  const linkedFilms = useMemo(
    () =>
      getLinkedLanguageStudioManagedFilmsForLanguage(
        linkedFilmsData,
        languageId
      ),
    [linkedFilmsData?.adminVideos, languageId]
  )

  const initialValues: LanguageFormValues = {
    name: localizedName?.value ?? '',
    nativeName: primaryName?.value ?? '',
    bcp47: language?.bcp47 ?? '',
    iso3: language?.iso3 ?? ''
  }

  if (loading) {
    return (
      <LanguageEditorShell>
        <Typography>Loading language...</Typography>
      </LanguageEditorShell>
    )
  }

  if (language == null) {
    return (
      <LanguageEditorShell>
        <Typography>Language not found</Typography>
      </LanguageEditorShell>
    )
  }

  const loadedLanguage = language

  async function handleSubmit(values: LanguageFormValues): Promise<void> {
    const nextValues = {
      name: values.name.trim(),
      nativeName: values.nativeName.trim(),
      bcp47: values.bcp47.trim(),
      iso3: values.iso3.trim()
    }

    if (
      nextValues.bcp47 !== initialValues.bcp47 ||
      nextValues.iso3 !== initialValues.iso3
    ) {
      await updateLanguage({
        variables: {
          input: {
            id: loadedLanguage.id,
            bcp47: nextValues.bcp47,
            iso3: nextValues.iso3
          }
        }
      })
    }

    if (nextValues.name !== initialValues.name) {
      await updateLanguageName({
        variables: {
          input: {
            languageId: loadedLanguage.id,
            nameLanguageId: localizedName?.languageId ?? DEFAULT_LANGUAGE_ID,
            value: nextValues.name
          }
        }
      })
    }

    if (nextValues.nativeName !== initialValues.nativeName) {
      await updateLanguageName({
        variables: {
          input: {
            languageId: loadedLanguage.id,
            value: nextValues.nativeName
          }
        }
      })
    }

    enqueueSnackbar('Language saved', { variant: 'success' })
    await refetch()
  }

  return (
    <LanguageEditorShell>
      <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 1 }}>
        <Typography component="h2" variant="h6">
          {initialValues.name || loadedLanguage.id}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/languages')}
        >
          Back
        </Button>
      </Stack>

      <Paper sx={{ p: 3 }}>
        <Typography component="h3" variant="h6" sx={{ mb: 2 }}>
          Language Details
        </Typography>
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validate={(values) => {
            const errors: Partial<Record<keyof LanguageFormValues, string>> = {}
            if (values.name.trim().length === 0) {
              errors.name = 'Language name is required'
            }
            if (values.nativeName.trim().length === 0) {
              errors.nativeName = 'Native name is required'
            }
            return errors
          }}
          onSubmit={handleSubmit}
        >
          {({
            values,
            errors,
            touched,
            dirty,
            isSubmitting,
            isValid,
            handleChange,
            resetForm
          }) => (
            <Form>
              <Stack spacing={2}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="ID"
                    value={loadedLanguage.id}
                    disabled
                    fullWidth
                  />
                  <TextField
                    label="Slug"
                    value={loadedLanguage.slug ?? ''}
                    disabled
                    fullWidth
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    id="name"
                    name="name"
                    label="Language name"
                    value={values.name}
                    onChange={handleChange}
                    error={touched.name === true && errors.name != null}
                    helperText={touched.name === true ? errors.name : undefined}
                    fullWidth
                  />
                  <TextField
                    id="nativeName"
                    name="nativeName"
                    label="Native name"
                    value={values.nativeName}
                    onChange={handleChange}
                    error={
                      touched.nativeName === true && errors.nativeName != null
                    }
                    helperText={
                      touched.nativeName === true
                        ? errors.nativeName
                        : undefined
                    }
                    fullWidth
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    id="bcp47"
                    name="bcp47"
                    label="BCP 47"
                    value={values.bcp47}
                    onChange={handleChange}
                    fullWidth
                  />
                  <TextField
                    id="iso3"
                    name="iso3"
                    label="ISO 3"
                    value={values.iso3}
                    onChange={handleChange}
                    fullWidth
                  />
                </Stack>
                <Divider />
                <Stack direction="row" justifyContent="flex-end" gap={1}>
                  <CancelButton show={dirty} handleCancel={() => resetForm()} />
                  <SaveButton
                    disabled={!isValid || isSubmitting || !dirty}
                    loading={isSubmitting}
                  />
                </Stack>
              </Stack>
            </Form>
          )}
        </Formik>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography component="h3" variant="h6" sx={{ mb: 2 }}>
          {LINKED_LANGUAGE_STUDIO_MANAGED_FILMS_LABEL}
        </Typography>
        {linkedFilmsLoading ? (
          <Typography color="text.secondary">
            Loading film version...
          </Typography>
        ) : linkedFilms.length === 0 ? (
          <Typography color="text.secondary">-</Typography>
        ) : (
          <TableContainer>
            <Table
              size="small"
              aria-label={LINKED_LANGUAGE_STUDIO_MANAGED_FILMS_LABEL}
            >
              <TableHead>
                <TableRow>
                  <TableCell>Film</TableCell>
                  <TableCell>Actual Version Number</TableCell>
                  <TableCell>Video ID</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {linkedFilms.map((linkedFilm) => (
                  <TableRow
                    key={`${linkedFilm.videoId}-${linkedFilm.variant.id}`}
                  >
                    <TableCell>{linkedFilm.title}</TableCell>
                    <TableCell>
                      <Link
                        component={NextLink}
                        href={getLanguageStudioManagedFilmPath({
                          videoId: linkedFilm.videoId,
                          variantId: linkedFilm.variant.id
                        })}
                      >
                        {linkedFilm.variant.version}
                      </Link>
                    </TableCell>
                    <TableCell>{linkedFilm.videoId}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <LanguageCountryLinks
        languageId={loadedLanguage.id}
        countryLanguages={loadedLanguage.countryLanguages}
        onChanged={async () => {
          await refetch()
        }}
      />
    </LanguageEditorShell>
  )
}

export { GET_LANGUAGE_STUDIO_MANAGED_FILMS }
