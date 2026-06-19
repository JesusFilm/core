'use client'

import { gql, useLazyQuery, useMutation } from '@apollo/client'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import CircularProgress from '@mui/material/CircularProgress'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
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
import { useSnackbar } from 'notistack'
import { ReactElement, useEffect, useMemo, useRef, useState } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

const DEFAULT_LANGUAGE_ID = '529'

export const SEARCH_COUNTRIES = gql`
  query SearchCountriesForLanguageAdmin($term: String, $nameLanguageId: ID) {
    countries(term: $term) {
      id
      name(languageId: $nameLanguageId) {
        value
        primary
      }
    }
  }
`

export const CREATE_COUNTRY_LANGUAGE = gql`
  mutation CreateCountryLanguage($input: CountryLanguageCreateInput!) {
    countryLanguageCreate(input: $input) {
      id
      speakers
      displaySpeakers
      primary
      suggested
      order
      country {
        id
      }
    }
  }
`

export const UPDATE_COUNTRY_LANGUAGE = gql`
  mutation UpdateCountryLanguage($input: CountryLanguageUpdateInput!) {
    countryLanguageUpdate(input: $input) {
      id
      speakers
      displaySpeakers
      primary
      suggested
      order
    }
  }
`

export const DELETE_COUNTRY_LANGUAGE = gql`
  mutation DeleteCountryLanguage($id: ID!) {
    countryLanguageDelete(id: $id) {
      id
    }
  }
`

interface CountryName {
  value: string
  primary: boolean
}

interface CountryOption {
  id: string
  name: CountryName[]
}

export interface CountryLanguageLink {
  id: string
  speakers: number
  displaySpeakers?: number | null
  primary: boolean
  suggested: boolean
  order?: number | null
  country: CountryOption
}

interface LanguageCountryLinksProps {
  languageId: string
  countryLanguages: CountryLanguageLink[]
  onChanged: () => Promise<void>
}

interface RowValues {
  speakers: string
  displaySpeakers: string
  primary: boolean
  suggested: boolean
  order: string
}

interface AddValues extends RowValues {
  country: CountryOption | null
}

function getCountryName(country: CountryOption): string {
  return (
    country.name.find((name) => name.primary)?.value ??
    country.name[0]?.value ??
    country.id
  )
}

function linkToRowValues(link: CountryLanguageLink): RowValues {
  return {
    speakers: String(link.speakers),
    displaySpeakers: link.displaySpeakers?.toString() ?? '',
    primary: link.primary,
    suggested: link.suggested,
    order: link.order?.toString() ?? ''
  }
}

function optionalNumber(value: string): number | null {
  const trimmed = value.trim()
  return trimmed.length === 0 ? null : Number(trimmed)
}

function requiredNumber(value: string): number {
  return Number(value.trim())
}

function valuesAreValid(values: RowValues): boolean {
  return (
    values.speakers.trim().length > 0 &&
    Number.isFinite(requiredNumber(values.speakers)) &&
    requiredNumber(values.speakers) >= 0 &&
    (values.displaySpeakers.trim().length === 0 ||
      (Number.isFinite(optionalNumber(values.displaySpeakers)) &&
        optionalNumber(values.displaySpeakers) != null &&
        optionalNumber(values.displaySpeakers) >= 0)) &&
    (values.order.trim().length === 0 ||
      (Number.isFinite(optionalNumber(values.order)) &&
        optionalNumber(values.order) != null))
  )
}

function rowIsDirty(link: CountryLanguageLink, values: RowValues): boolean {
  return (
    requiredNumber(values.speakers) !== link.speakers ||
    optionalNumber(values.displaySpeakers) !== (link.displaySpeakers ?? null) ||
    values.primary !== link.primary ||
    values.suggested !== link.suggested ||
    optionalNumber(values.order) !== (link.order ?? null)
  )
}

function compareCountryLanguageLinks(
  left: CountryLanguageLink,
  right: CountryLanguageLink
): number {
  if (left.suggested !== right.suggested) return left.suggested ? 1 : -1

  if (left.suggested) {
    const orderDiff = (right.order ?? 0) - (left.order ?? 0)
    if (orderDiff !== 0) return orderDiff
  } else {
    const speakerDiff = right.speakers - left.speakers
    if (speakerDiff !== 0) return speakerDiff
  }

  return left.country.id.localeCompare(right.country.id)
}

function CountryLanguageRow({
  link,
  onSave,
  onDelete
}: {
  link: CountryLanguageLink
  onSave: (id: string, values: RowValues) => Promise<void>
  onDelete: (link: CountryLanguageLink) => void
}): ReactElement {
  const [values, setValues] = useState<RowValues>(() => linkToRowValues(link))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setValues(linkToRowValues(link))
  }, [link])

  const dirty = rowIsDirty(link, values)
  const valid = valuesAreValid(values)

  async function handleSave(): Promise<void> {
    setSaving(true)
    try {
      await onSave(link.id, values)
    } finally {
      setSaving(false)
    }
  }

  return (
    <TableRow>
      <TableCell>
        <Typography variant="body2">{getCountryName(link.country)}</Typography>
        <Typography variant="caption" color="text.secondary">
          {link.country.id}
        </Typography>
      </TableCell>
      <TableCell sx={{ width: 130 }}>
        <TextField
          inputProps={{ 'aria-label': `Speakers for ${link.country.id}` }}
          type="number"
          size="small"
          value={values.speakers}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              speakers: event.target.value
            }))
          }
          fullWidth
        />
      </TableCell>
      <TableCell sx={{ width: 150 }}>
        <TextField
          inputProps={{
            'aria-label': `Display speakers for ${link.country.id}`
          }}
          type="number"
          size="small"
          value={values.displaySpeakers}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              displaySpeakers: event.target.value
            }))
          }
          fullWidth
        />
      </TableCell>
      <TableCell align="center" sx={{ width: 92 }}>
        <Checkbox
          inputProps={{ 'aria-label': `Primary for ${link.country.id}` }}
          checked={values.primary}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              primary: event.target.checked
            }))
          }
        />
      </TableCell>
      <TableCell align="center" sx={{ width: 104 }}>
        <Checkbox
          inputProps={{ 'aria-label': `Suggested for ${link.country.id}` }}
          checked={values.suggested}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              suggested: event.target.checked
            }))
          }
        />
      </TableCell>
      <TableCell sx={{ width: 100 }}>
        <TextField
          inputProps={{ 'aria-label': `Order for ${link.country.id}` }}
          type="number"
          size="small"
          value={values.order}
          onChange={(event) =>
            setValues((current) => ({ ...current, order: event.target.value }))
          }
          fullWidth
        />
      </TableCell>
      <TableCell align="right" sx={{ width: 150 }}>
        <Stack direction="row" justifyContent="flex-end" gap={1}>
          <Button
            size="small"
            variant="contained"
            color="secondary"
            startIcon={<SaveIcon />}
            disabled={!dirty || !valid || saving}
            loading={saving}
            onClick={handleSave}
          >
            Save
          </Button>
          <IconButton
            aria-label={`Delete ${link.country.id}`}
            onClick={() => onDelete(link)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      </TableCell>
    </TableRow>
  )
}

export function LanguageCountryLinks({
  languageId,
  countryLanguages,
  onChanged
}: LanguageCountryLinksProps): ReactElement {
  const { enqueueSnackbar } = useSnackbar()
  const [addValues, setAddValues] = useState<AddValues>({
    country: null,
    speakers: '',
    displaySpeakers: '',
    primary: false,
    suggested: false,
    order: ''
  })
  const [deleteLink, setDeleteLink] = useState<CountryLanguageLink | null>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [searchCountries, { data: countriesData, loading: countriesLoading }] =
    useLazyQuery<
      { countries: CountryOption[] },
      { term?: string; nameLanguageId: string }
    >(SEARCH_COUNTRIES)
  const [createCountryLanguage, { loading: createLoading }] = useMutation(
    CREATE_COUNTRY_LANGUAGE
  )
  const [updateCountryLanguage] = useMutation(UPDATE_COUNTRY_LANGUAGE)
  const [deleteCountryLanguage, { loading: deleteLoading }] = useMutation(
    DELETE_COUNTRY_LANGUAGE
  )

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current != null)
        clearTimeout(searchTimeoutRef.current)
    }
  }, [])

  const countries = countriesData?.countries ?? []
  const linkedCountryIds = useMemo(
    () =>
      new Set(
        countryLanguages
          .filter((link) => link.suggested === addValues.suggested)
          .map((link) => link.country.id)
      ),
    [addValues.suggested, countryLanguages]
  )
  const addValid =
    addValues.country != null &&
    !linkedCountryIds.has(addValues.country.id) &&
    valuesAreValid(addValues)

  const sortedCountryLanguages = useMemo(
    () => [...countryLanguages].sort(compareCountryLanguageLinks),
    [countryLanguages]
  )

  function handleCountrySearch(
    _event: React.SyntheticEvent,
    value: string
  ): void {
    if (searchTimeoutRef.current != null) clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(() => {
      const term = value.trim()
      if (term.length > 0) {
        void searchCountries({
          variables: { term, nameLanguageId: DEFAULT_LANGUAGE_ID }
        })
      }
    }, 300)
  }

  async function handleAddCountry(): Promise<void> {
    if (addValues.country == null || !addValid) return

    await createCountryLanguage({
      variables: {
        input: {
          languageId,
          countryId: addValues.country.id,
          speakers: requiredNumber(addValues.speakers),
          displaySpeakers: optionalNumber(addValues.displaySpeakers),
          primary: addValues.primary,
          suggested: addValues.suggested,
          order: optionalNumber(addValues.order)
        }
      }
    })
    enqueueSnackbar('Country link added', { variant: 'success' })
    setAddValues({
      country: null,
      speakers: '',
      displaySpeakers: '',
      primary: false,
      suggested: false,
      order: ''
    })
    await onChanged()
  }

  async function handleSaveCountryLink(
    id: string,
    values: RowValues
  ): Promise<void> {
    await updateCountryLanguage({
      variables: {
        input: {
          id,
          speakers: requiredNumber(values.speakers),
          displaySpeakers: optionalNumber(values.displaySpeakers),
          primary: values.primary,
          suggested: values.suggested,
          order: optionalNumber(values.order)
        }
      }
    })
    enqueueSnackbar('Country link saved', { variant: 'success' })
    await onChanged()
  }

  async function handleDeleteCountryLink(): Promise<void> {
    if (deleteLink == null) return

    await deleteCountryLanguage({ variables: { id: deleteLink.id } })
    enqueueSnackbar('Country link removed', { variant: 'success' })
    setDeleteLink(null)
    await onChanged()
  }

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, overflow: 'hidden' }}>
      <Stack spacing={2}>
        <Typography component="h3" variant="h6">
          Countries
        </Typography>

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.5}
          alignItems={{ md: 'center' }}
          sx={{ width: '100%' }}
        >
          <Autocomplete<CountryOption, false, false, false>
            sx={{ minWidth: { md: 280 }, flex: 1, width: '100%' }}
            options={countries}
            loading={countriesLoading}
            value={addValues.country}
            onInputChange={handleCountrySearch}
            onChange={(_event, country) =>
              setAddValues((current) => ({ ...current, country }))
            }
            getOptionLabel={(option) => getCountryName(option)}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            getOptionDisabled={(option) => linkedCountryIds.has(option.id)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Add country"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {countriesLoading ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  )
                }}
              />
            )}
            renderOption={(props, option) => {
              const { key, ...optionProps } = props
              return (
                <Box key={key} component="li" {...optionProps}>
                  <Typography variant="body2">
                    {getCountryName(option)}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ ml: 1 }}
                  >
                    {option.id}
                  </Typography>
                </Box>
              )
            }}
            noOptionsText="Search by country name or ID"
          />
          <TextField
            label="Speakers"
            type="number"
            size="small"
            value={addValues.speakers}
            onChange={(event) =>
              setAddValues((current) => ({
                ...current,
                speakers: event.target.value
              }))
            }
            sx={{ width: { xs: '100%', md: 140 } }}
          />
          <TextField
            label="Display"
            type="number"
            size="small"
            value={addValues.displaySpeakers}
            onChange={(event) =>
              setAddValues((current) => ({
                ...current,
                displaySpeakers: event.target.value
              }))
            }
            sx={{ width: { xs: '100%', md: 130 } }}
          />
          <TextField
            label="Order"
            type="number"
            size="small"
            value={addValues.order}
            onChange={(event) =>
              setAddValues((current) => ({
                ...current,
                order: event.target.value
              }))
            }
            sx={{ width: { xs: '100%', md: 100 } }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={addValues.primary}
                onChange={(event) =>
                  setAddValues((current) => ({
                    ...current,
                    primary: event.target.checked
                  }))
                }
              />
            }
            label="Primary"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={addValues.suggested}
                onChange={(event) =>
                  setAddValues((current) => ({
                    ...current,
                    suggested: event.target.checked,
                    country: null
                  }))
                }
              />
            }
            label="Suggested"
          />
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            disabled={!addValid || createLoading}
            loading={createLoading}
            onClick={handleAddCountry}
            sx={{ alignSelf: { xs: 'stretch', md: 'center' } }}
          >
            Add
          </Button>
        </Stack>

        {sortedCountryLanguages.length === 0 ? (
          <Typography color="text.secondary">
            No countries linked yet.
          </Typography>
        ) : (
          <TableContainer sx={{ width: '100%', overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 860 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Country</TableCell>
                  <TableCell>Speakers</TableCell>
                  <TableCell>Display</TableCell>
                  <TableCell align="center">Primary</TableCell>
                  <TableCell align="center">Suggested</TableCell>
                  <TableCell>Order</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedCountryLanguages.map((link) => (
                  <CountryLanguageRow
                    key={link.id}
                    link={link}
                    onSave={handleSaveCountryLink}
                    onDelete={setDeleteLink}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Stack>

      <Dialog
        open={deleteLink != null}
        onClose={() => setDeleteLink(null)}
        dialogTitle={{ title: 'Remove Country Link', closeButton: true }}
        dialogAction={{
          onSubmit: handleDeleteCountryLink,
          submitLabel: 'Remove',
          closeLabel: 'Cancel'
        }}
        loading={deleteLoading}
      >
        Remove{' '}
        {deleteLink == null
          ? 'this country'
          : getCountryName(deleteLink.country)}{' '}
        from this language?
      </Dialog>
    </Paper>
  )
}
