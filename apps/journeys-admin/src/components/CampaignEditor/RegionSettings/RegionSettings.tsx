import { CombinedGraphQLErrors } from '@apollo/client'
import Autocomplete from '@mui/material/Autocomplete'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { useTranslation } from 'next-i18next/pages'
import { useSnackbar } from 'notistack'
import { KeyboardEvent, ReactElement, useState } from 'react'

import { textLength } from '@core/journeys/ui/Campaign/libs/translatedField'

import { GetCampaign_campaign_regions as CampaignRegion } from '../../../../__generated__/GetCampaign'
import { GetCampaignCountries_countries as Country } from '../../../../__generated__/GetCampaignCountries'
import { useCampaignCountriesQuery } from '../../../libs/useCampaignCountriesQuery'
import { useCampaignRegionCountryAddMutation } from '../../../libs/useCampaignRegionCountryAddMutation'
import { useCampaignRegionCountryRemoveMutation } from '../../../libs/useCampaignRegionCountryRemoveMutation'
import { useCampaignRegionUpdateMutation } from '../../../libs/useCampaignRegionUpdateMutation'
import { SLUG_MAX_LENGTH, shapeSlug } from '../Settings'
import { useCommittedField } from '../utils/useCommittedField'
import { useTranslatedField } from '../utils/useTranslatedField'

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
 * as each field commits (the name, in the Preview Language, through
 * `campaignTranslationSet` while previewing a non-default language, where
 * clearing it falls back to the default name), and the country chips picked
 * from api-languages' countries, added and removed one row at a time. Never
 * Commands, so undo does not touch them; the only pre-validation is the pure
 * length rule and the API's own messages are shown verbatim under the field
 * that failed.
 */
export function RegionSettings({ region }: RegionSettingsProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const [countryError, setCountryError] = useState<string>()
  const [regionUpdate] = useCampaignRegionUpdateMutation()
  const [countryAdd] = useCampaignRegionCountryAddMutation()
  const [countryRemove] = useCampaignRegionCountryRemoveMutation()
  const { data: countriesData, loading: countriesLoading } =
    useCampaignCountriesQuery()
  const countries = countriesData?.countries ?? []
  const chosen = [...region.countries].sort((a, b) => a.order - b.order)
  const chosenIds = new Set(chosen.map((country) => country.countryId))
  const name = useTranslatedField(
    { region },
    {
      validate: (value, translating) =>
        value === '' && !translating ? t('Name is required') : undefined
    }
  )
  const slug = useCommittedField({
    committed: region.slug,
    normalize: (typed) => typed.replace(/-+$/, ''),
    validate: (value) => {
      if (value === '') return t('Slug is required')
      if (textLength(value) > SLUG_MAX_LENGTH)
        return t('Max {{max}} characters', { max: SLUG_MAX_LENGTH })
      return undefined
    },
    save: saveSlug,
    onRefused: (error) => {
      const fieldError = fieldErrorOf(error)
      if (fieldError?.field === 'slug') return fieldError.message
      showError(error, t('Could not save region'))
      return undefined
    }
  })

  function showError(error: unknown, fallback: string): void {
    const fieldError = fieldErrorOf(error)
    if (fieldError?.field === 'countryId') {
      setCountryError(fieldError.message)
      return
    }
    enqueueSnackbar(error instanceof Error ? error.message : fallback, {
      variant: 'error',
      preventDuplicate: true
    })
  }

  async function saveSlug(value: string): Promise<void> {
    await regionUpdate({
      variables: { id: region.id, input: { slug: value } },
      optimisticResponse: {
        campaignRegionUpdate: {
          __typename: 'CampaignRegion',
          id: region.id,
          name: region.name,
          slug: value,
          listed: region.listed
        }
      }
    })
  }

  async function handleAddCountry(country: Country | null): Promise<void> {
    if (country == null || chosenIds.has(country.id)) return
    setCountryError(undefined)
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
    setCountryError(undefined)
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
    <Stack spacing={5} data-testid="RegionSettings">
      <TextField
        label={t('Name')}
        value={name.value}
        onChange={(event) => name.onChange(event.target.value)}
        onBlur={name.onBlur}
        onKeyDown={handleKeyDown}
        placeholder={name.translating ? name.fallback : undefined}
        error={name.error != null}
        helperText={name.error ?? `${textLength(name.value)} / ${name.max}`}
        required={!name.translating}
        fullWidth
        slotProps={{
          htmlInput: { 'aria-label': t('Name') }
        }}
      />
      <TextField
        label={t('Slug')}
        value={slug.value}
        onChange={(event) => slug.onChange(shapeSlug(event.target.value))}
        onBlur={slug.onBlur}
        onKeyDown={handleKeyDown}
        error={slug.error != null}
        helperText={
          slug.error ?? (
            <>
              <Box component="span" sx={{ display: 'block' }}>
                {t(
                  'Changing this breaks links to this page you have already shared.'
                )}
              </Box>
              <Box component="span" sx={{ display: 'block' }}>
                {`${textLength(slug.value)} / ${SLUG_MAX_LENGTH}`}
              </Box>
            </>
          )
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
              error={countryError != null}
              helperText={
                countryError ??
                t('Country chips show on the region card with their flag.')
              }
            />
          )}
        />
      </Stack>
    </Stack>
  )
}
