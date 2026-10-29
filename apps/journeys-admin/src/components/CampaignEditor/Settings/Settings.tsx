import { CombinedGraphQLErrors } from '@apollo/client'
import { useApolloClient } from '@apollo/client/react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'
import { useSnackbar } from 'notistack'
import { KeyboardEvent, ReactElement, useState } from 'react'

import {
  TRANSLATED_FIELDS,
  textLength
} from '@core/journeys/ui/Campaign/libs/translatedField'
import { Dialog } from '@core/shared/ui/Dialog'
import Trash2Icon from '@core/shared/ui/icons/Trash2'

import { GetCampaign_campaign as Campaign } from '../../../../__generated__/GetCampaign'
import { CampaignStatus } from '../../../../__generated__/globalTypes'
import {
  campaignDomainName,
  campaignPublicAddress
} from '../../../libs/campaignAddress'
import {
  evictCampaignFromCache,
  useCampaignDeleteMutation
} from '../../../libs/useCampaignDeleteMutation'
import { useCampaignUpdateMutation } from '../../../libs/useCampaignUpdateMutation'
import { languageNames } from '../LanguagesPanel/LanguagesPanel'
import { campaignStatusCopy } from '../PublishButton/statusCopy'
import { useCommittedField } from '../utils/useCommittedField'

import { CampaignDomain } from './CampaignDomain'
import { DefaultLanguageDialog } from './DefaultLanguageDialog'

/** The longest slug the API accepts, for the campaign and its regions. */
export const SLUG_MAX_LENGTH = 200

type SettingsField = 'title' | 'slug'

interface SettingsProps {
  campaign: Campaign
  /** Delete campaign is campaign Delete: offered to a manager of the team only. */
  isManager: boolean
  /** The default language was swapped; the Translations view tells the author about promoted machine values. */
  onDefaultLanguageChanged?: () => void
}

/** The gallery's client-side slug shaping: what the API will accept, minus the trailing dash kept while typing. */
export function shapeSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+/, '')
}

/**
 * Campaign settings: title and slug saved through `campaignUpdate` as each
 * field commits (never Commands, so undo does not touch them), the Campaign
 * Domain (`CampaignDomain`), the default language (confirmed in a dialog that offers machine translation when texts
 * are missing), the status copy, the address hint and, for managers, Delete
 * campaign. There is no
 * Save button: an optimistic response shows the edit at once and a failed
 * save rolls it back behind the error snackbar.
 */
export function Settings({
  campaign,
  isManager,
  onDefaultLanguageChanged
}: SettingsProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [nextDefaultLanguageId, setNextDefaultLanguageId] = useState<string>()
  const [campaignUpdate] = useCampaignUpdateMutation()
  const { cache } = useApolloClient()
  const [campaignDelete, { loading: deleting }] = useCampaignDeleteMutation()
  const title = useCommittedField({
    committed: campaign.title,
    validate: (value) =>
      preValidate(
        value,
        t('Title is required'),
        TRANSLATED_FIELDS.campaign.title
      ),
    save: async (value) => await save('title', value),
    onRefused: (error) => refusalMessage('title', error)
  })
  const slug = useCommittedField({
    committed: campaign.slug,
    normalize: (typed) => typed.replace(/-+$/, ''),
    validate: (value) =>
      preValidate(value, t('Slug is required'), SLUG_MAX_LENGTH),
    save: async (value) => await save('slug', value),
    onRefused: (error) => refusalMessage('slug', error)
  })

  function preValidate(
    value: string,
    requiredMessage: string,
    max: number
  ): string | undefined {
    if (value === '') return requiredMessage
    if (textLength(value) > max) return t('Max {{max}} characters', { max })
    return undefined
  }

  async function save(field: SettingsField, value: string): Promise<void> {
    await campaignUpdate({
      variables: { id: campaign.id, input: { [field]: value } },
      optimisticResponse: {
        campaignUpdate: {
          __typename: 'Campaign',
          id: campaign.id,
          title: field === 'title' ? value : campaign.title,
          slug: field === 'slug' ? value : campaign.slug
        }
      }
    })
  }

  /** A refusal naming the field shows under it; any other goes to the snackbar. */
  function refusalMessage(
    field: SettingsField,
    error: unknown
  ): string | undefined {
    if (CombinedGraphQLErrors.is(error)) {
      const fieldError = error.errors.find(
        (graphQLError) => graphQLError.extensions?.field === field
      )
      if (fieldError != null) return fieldError.message
    }
    enqueueSnackbar(
      error instanceof Error ? error.message : t('Could not save campaign'),
      { variant: 'error', preventDuplicate: true }
    )
    return undefined
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === 'Enter') event.currentTarget.blur()
  }

  async function handleDelete(): Promise<void> {
    try {
      await campaignDelete({ variables: { id: campaign.id } })
      setDeleteOpen(false)
      await router.push('/?type=campaigns')
      // Evict only once the redirect has resolved: until then this page is
      // still mounted and its `GetCampaign` would refetch the deleted
      // campaign and flash "Campaign not found".
      evictCampaignFromCache(cache, campaign.id)
    } catch (error) {
      setDeleteOpen(false)
      enqueueSnackbar(
        error instanceof Error ? error.message : t('Could not delete campaign'),
        { variant: 'error', preventDuplicate: true }
      )
    }
  }

  const published = campaign.status === CampaignStatus.published
  const domainName = campaignDomainName(campaign.customDomains)
  const publicAddress = campaignPublicAddress(campaign)

  return (
    <Stack spacing={5} data-testid="CampaignSettings">
      <Typography
        variant="body2"
        color="text.secondary"
        data-testid="CampaignStatusCopy"
      >
        {campaignStatusCopy(t, published)}
      </Typography>
      <TextField
        label={t('Title')}
        value={title.value}
        onChange={(event) => title.onChange(event.target.value)}
        onBlur={title.onBlur}
        onKeyDown={handleKeyDown}
        error={title.error != null}
        helperText={
          title.error ??
          `${textLength(title.value)} / ${TRANSLATED_FIELDS.campaign.title}`
        }
        fullWidth
        slotProps={{ htmlInput: { 'aria-label': t('Title') } }}
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
                {t('Current public address: {{address}}', {
                  address: publicAddress
                })}
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
      <CampaignDomain campaign={campaign} isManager={isManager} />
      <TextField
        select
        label={t('Default language')}
        value={campaign.defaultLanguageId}
        onChange={(event) => {
          if (event.target.value !== campaign.defaultLanguageId)
            setNextDefaultLanguageId(event.target.value)
        }}
        helperText={t(
          'The language you write in. Changing it needs every text translated first.'
        )}
        fullWidth
        slotProps={{ htmlInput: { 'aria-label': t('Default language') } }}
      >
        {[...campaign.languages]
          .sort((a, b) => a.order - b.order)
          .map((language) => (
            <MenuItem key={language.id} value={language.languageId}>
              {languageNames(language).autonym}
            </MenuItem>
          ))}
      </TextField>
      {isManager && (
        <Box>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Trash2Icon />}
            onClick={() => setDeleteOpen(true)}
          >
            {t('Delete campaign')}
          </Button>
        </Box>
      )}
      <DefaultLanguageDialog
        campaign={campaign}
        languageId={nextDefaultLanguageId}
        onClose={() => setNextDefaultLanguageId(undefined)}
        onChanged={() => {
          setNextDefaultLanguageId(undefined)
          onDefaultLanguageChanged?.()
        }}
      />
      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        dialogTitle={{ title: t('Delete campaign?'), closeButton: true }}
        dialogAction={{
          onSubmit: () => {
            void handleDelete()
          },
          submitLabel: t('Delete'),
          closeLabel: t('Cancel')
        }}
        loading={deleting}
        testId="CampaignDeleteDialog"
      >
        <Typography>
          {t(
            'This permanently removes the campaign with its pages, regions and translations. The linked journeys and their QR codes keep working at their own URLs.'
          )}
        </Typography>
        {domainName != null && (
          <Typography sx={{ mt: 2 }}>
            {t(
              'Its domain {{domain}} is removed too; add it again to use it elsewhere.',
              { domain: domainName }
            )}
          </Typography>
        )}
      </Dialog>
    </Stack>
  )
}
