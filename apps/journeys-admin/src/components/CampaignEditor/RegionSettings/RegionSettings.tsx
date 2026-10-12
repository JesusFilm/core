import { CombinedGraphQLErrors } from '@apollo/client'
import Autocomplete from '@mui/material/Autocomplete'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { useSnackbar } from 'notistack'
import {
  FocusEvent,
  KeyboardEvent,
  ReactElement,
  useEffect,
  useState
} from 'react'

import { GetCampaign_campaign_regions as CampaignRegion } from '../../../../__generated__/GetCampaign'
import { GetCampaignCountries_countries as Country } from '../../../../__generated__/GetCampaignCountries'
import { useCampaignCountriesQuery } from '../../../libs/useCampaignCountriesQuery'
import { useCampaignRegionCountryAddMutation } from '../../../libs/useCampaignRegionCountryAddMutation'
import { useCampaignRegionCountryRemoveMutation } from '../../../libs/useCampaignRegionCountryRemoveMutation'
import { useCampaignRegionUpdateMutation } from '../../../libs/useCampaignRegionUpdateMutation'
import { shapeSlug } from '../Settings'

export const REGION_NAME_MAX_LENGTH = 60
const SLUG_MAX_LENGTH = 200

type RegionField = 'name' | 'slug' | 'countryId'

interface RegionSettingsProps {
  region: CampaignRegion
}

function countryName(country: Pick<Country, 'id' | 'name'>): string {
  return country.name[0]?.value ?? country.id
}

function fieldErrorOf(
  error: unknown
): { field: string; message: string } | null {
  if (!CombinedGraphQLErrors.is(error)) return null
  const graphQLError = error.errors.find(
    (candidate) => typeof candidate.extensions?.field === 'string'
  )
  if (graphQLError == null) return null
  return {
    field: graphQLError.extensions?.field as string,
    message: graphQLError.message
  }
}

/**
 * Region settings: the name and slug saved through `campaignRegionUpdate`
 * as each field commits, and the country chips picked from api-languages'
 * countries, added and removed one row at a time. Never Commands, so undo
 * does not touch them; the only pre-validation is the pure length rule and
 * the API's own messages are shown verbatim under the field that failed.
 */
export function RegionSettings({ region }: RegionSettingsProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const [name, setName] = useState(region.name)
  const [slug, setSlug] = useState(region.slug)
  const [errors, setErrors] = useState<Partial<Record<RegionField, string>>>({})
  const [regionUpdate] = useCampaignRegionUpdateMutation()
  const [countryAdd] = useCampaignRegionCountryAddMutation()
  const [countryRemove] = useCampaignRegionCountryRemoveMutation()
  const { data: countriesData, loading: countriesLoading } =
    useCampaignCountriesQuery()
  const countries = countriesData?.countries ?? []
  const chosen = [...region.countries].sort((a, b) => a.order - b.order)
  const chosenIds = new Set(chosen.map((country) => country.countryId))

  useEffect(() => {
    setName(region.name)
  }, [region.name])
  useEffect(() => {
    setSlug(region.slug)
  }, [region.slug])

  function setFieldError(field: RegionField, message?: string): void {
    setErrors((previous) => ({ ...previous, [field]: message }))
  }

  function showError(error: unknown, fallback: string): void {
    const fieldError = fieldErrorOf(error)
    if (
      fieldError != null &&
      (fieldError.field === 'name' ||
        fieldError.field === 'slug' ||
        fieldError.field === 'countryId')
    ) {
      setFieldError(fieldError.field, fieldError.message)
      return
    }
    enqueueSnackbar(error instanceof Error ? error.message : fallback, {
      variant: 'error',
      preventDuplicate: true
    })
  }

  function preValidate(
    field: 'name' | 'slug',
    value: string
  ): string | undefined {
    if (value === '')
      return field === 'name' ? t('Name is required') : t('Slug is required')
    const max = field === 'name' ? REGION_NAME_MAX_LENGTH : SLUG_MAX_LENGTH
    if ([...value].length > max)
      return t('Max {{count}} characters', { count: max })
    return undefined
  }

  async function save(field: 'name' | 'slug', rawValue: string): Promise<void> {
    const value =
      field === 'slug' ? rawValue.replace(/-+$/, '') : rawValue.trim()
    if (field === 'slug') setSlug(value)
    if (value === region[field]) {
      setFieldError(field, undefined)
      return
    }
    const message = preValidate(field, value)
    if (message != null) {
      setFieldError(field, message)
      return
    }
    try {
      await regionUpdate({
        variables: { id: region.id, input: { [field]: value } },
        optimisticResponse: {
          campaignRegionUpdate: {
            __typename: 'CampaignRegion',
            id: region.id,
            name: field === 'name' ? value : region.name,
            slug: field === 'slug' ? value : region.slug,
            listed: region.listed
          }
        }
      })
      setFieldError(field, undefined)
    } catch (error) {
      showError(error, t('Could not save region'))
      if (field === 'name') setName(region.name)
      if (field === 'slug') setSlug(region.slug)
    }
  }

  async function handleAddCountry(country: Country | null): Promise<void> {
    if (country == null || chosenIds.has(country.id)) return
    setFieldError('countryId', undefined)
    try {
      await countryAdd({
        variables: { regionId: region.id, countryId: country.id },
        optimisticResponse: {
          campaignRegionCountryAdd: {
            __typename: 'CampaignRegionCountry',
            id: `optimistic-${region.id}-${country.id}`,
            regionId: region.id,
            countryId: country.id,
            order: chosen.length,
            country: {
              __typename: 'Country',
              id: country.id,
              flagPngSrc: country.flagPngSrc,
              name: country.name
            }
          }
        }
      })
    } catch (error) {
      showError(error, t('Could not add country'))
    }
  }

  async function handleRemoveCountry(
    country: CampaignRegion['countries'][number]
  ): Promise<void> {
    setFieldError('countryId', undefined)
    try {
      await countryRemove({
        variables: { id: country.id },
        optimisticResponse: {
          campaignRegionCountryRemove: {
            __typename: 'CampaignRegionCountry',
            id: country.id,
            regionId: region.id
          }
        }
      })
    } catch (error) {
      showError(error, t('Could not remove country'))
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === 'Enter') event.currentTarget.blur()
  }

  return (
    <Stack spacing={5} sx={{ p: 6, width: 400 }} data-testid="RegionSettings">
      <Typography variant="h6">{t('Region settings')}</Typography>
      <TextField
        label={t('Name')}
        value={name}
        onChange={(event) => setName(event.target.value)}
        onBlur={(event: FocusEvent<HTMLInputElement>) => {
          void save('name', event.target.value)
        }}
        onKeyDown={handleKeyDown}
        error={errors.name != null}
        helperText={errors.name}
        required
        fullWidth
        slotProps={{
          htmlInput: {
            'aria-label': t('Name'),
            maxLength: REGION_NAME_MAX_LENGTH + 1
          }
        }}
      />
      <TextField
        label={t('Slug')}
        value={slug}
        onChange={(event) => setSlug(shapeSlug(event.target.value))}
        onBlur={(event: FocusEvent<HTMLInputElement>) => {
          void save('slug', event.target.value)
        }}
        onKeyDown={handleKeyDown}
        error={errors.slug != null}
        helperText={
          errors.slug ??
          t('Changing this breaks links to this page you have already shared.')
        }
        fullWidth
        slotProps={{ htmlInput: { 'aria-label': t('Slug') } }}
      />
      <Stack spacing={2}>
        <Stack
          direction="row"
          data-testid="RegionSettingsCountries"
          sx={{ flexWrap: 'wrap', gap: 1 }}
        >
          {chosen.map((country) => (
            <Chip
              key={country.id}
              data-testid={`RegionCountryChip-${country.countryId}`}
              avatar={
                country.country.flagPngSrc != null ? (
                  <Avatar src={country.country.flagPngSrc} alt="" />
                ) : undefined
              }
              label={countryName(country.country)}
              onDelete={() => {
                void handleRemoveCountry(country)
              }}
            />
          ))}
        </Stack>
        <Autocomplete<Country>
          options={countries.filter((country) => !chosenIds.has(country.id))}
          getOptionLabel={countryName}
          loading={countriesLoading}
          value={null}
          blurOnSelect
          onChange={(_event, country) => {
            void handleAddCountry(country)
          }}
          renderOption={(props, country) => (
            <li {...props} key={country.id}>
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                {country.flagPngSrc != null && (
                  <Avatar
                    src={country.flagPngSrc}
                    alt=""
                    sx={{ width: 20, height: 20 }}
                  />
                )}
                <span>{countryName(country)}</span>
              </Stack>
            </li>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t('Add country')}
              error={errors.countryId != null}
              helperText={
                errors.countryId ??
                t('Country chips show on the region card with their flag.')
              }
            />
          )}
        />
      </Stack>
    </Stack>
  )
}
