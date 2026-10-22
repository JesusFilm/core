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
import {
  FocusEvent,
  KeyboardEvent,
  ReactElement,
  useEffect,
  useState
} from 'react'

import { Dialog } from '@core/shared/ui/Dialog'
import Trash2Icon from '@core/shared/ui/icons/Trash2'

import { GetCampaign_campaign as Campaign } from '../../../../__generated__/GetCampaign'
import { CampaignStatus } from '../../../../__generated__/globalTypes'
import {
  evictCampaignFromCache,
  useCampaignDeleteMutation
} from '../../../libs/useCampaignDeleteMutation'
import { useCampaignUpdateMutation } from '../../../libs/useCampaignUpdateMutation'
import {
  campaignPermanentAddress,
  campaignPublicAddresses
} from '../campaignAddress'
import { textLength } from '../Canvas/InlineText'
import { languageNames } from '../LanguagesPanel/LanguagesPanel'
import { campaignStatusCopy } from '../PublishButton/statusCopy'

import { DefaultLanguageDialog } from './DefaultLanguageDialog'

const TITLE_MAX_LENGTH = 100
const SLUG_MAX_LENGTH = 200

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
 * field commits (never Commands, so undo does not touch them), the default
 * language (confirmed in a dialog that offers machine translation when texts
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
  const [title, setTitle] = useState(campaign.title)
  const [slug, setSlug] = useState(campaign.slug)
  const [errors, setErrors] = useState<Partial<Record<SettingsField, string>>>(
    {}
  )
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [nextDefaultLanguageId, setNextDefaultLanguageId] = useState<string>()
  const [saving, setSaving] = useState<Partial<Record<SettingsField, boolean>>>(
    {}
  )
  const [campaignUpdate] = useCampaignUpdateMutation()
  const { cache } = useApolloClient()
  const [campaignDelete, { loading: deleting }] = useCampaignDeleteMutation()

  // While a save is in flight, or a field error describes a rejected value,
  // the fields hold what the user is reading about, so skip the sync; after a
  // failed save they adopt the rolled-back value from `campaign` again.
  const titleBlocked = (saving.title ?? false) || errors.title != null
  const slugBlocked = (saving.slug ?? false) || errors.slug != null
  useEffect(() => {
    if (!titleBlocked) setTitle(campaign.title)
  }, [campaign.title, titleBlocked])
  useEffect(() => {
    if (!slugBlocked) setSlug(campaign.slug)
  }, [campaign.slug, slugBlocked])

  function setFieldError(field: SettingsField, message?: string): void {
    setErrors((previous) => ({ ...previous, [field]: message }))
  }

  function preValidate(
    field: SettingsField,
    value: string
  ): string | undefined {
    if (value === '')
      return field === 'title' ? t('Title is required') : t('Slug is required')
    const max = field === 'title' ? TITLE_MAX_LENGTH : SLUG_MAX_LENGTH
    if ([...value].length > max) return t('Max {{max}} characters', { max })
    return undefined
  }

  async function save(field: SettingsField, rawValue: string): Promise<void> {
    const value =
      field === 'slug' ? rawValue.replace(/-+$/, '') : rawValue.trim()
    if (field === 'slug') setSlug(value)
    if (value === campaign[field]) {
      setFieldError(field, undefined)
      return
    }
    const message = preValidate(field, value)
    if (message != null) {
      setFieldError(field, message)
      return
    }
    setSaving((previous) => ({ ...previous, [field]: true }))
    try {
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
      setFieldError(field, undefined)
    } catch (error) {
      if (CombinedGraphQLErrors.is(error)) {
        const fieldError = error.errors.find(
          (graphQLError) => graphQLError.extensions?.field === field
        )
        if (fieldError != null) {
          setFieldError(field, fieldError.message)
          return
        }
      }
      enqueueSnackbar(
        error instanceof Error ? error.message : t('Could not save campaign'),
        { variant: 'error', preventDuplicate: true }
      )
      setFieldError(field, undefined)
    } finally {
      setSaving((previous) => ({ ...previous, [field]: false }))
    }
  }

  function handleTitleBlur(event: FocusEvent<HTMLInputElement>): void {
    void save('title', event.target.value)
  }

  function handleSlugBlur(event: FocusEvent<HTMLInputElement>): void {
    void save('slug', event.target.value)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === 'Enter') event.currentTarget.blur()
  }

  async function handleDelete(): Promise<void> {
    try {
      await campaignDelete({ variables: { id: campaign.id } })
      setDeleteOpen(false)
      await router.push('/campaigns')
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
  const permanentAddress = campaignPermanentAddress(campaign.slug)
  const publicAddresses = campaignPublicAddresses(
    campaign.slug,
    campaign.customDomains.map(({ name }) => name)
  )

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
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        onBlur={handleTitleBlur}
        onKeyDown={handleKeyDown}
        error={errors.title != null}
        helperText={
          errors.title ?? `${textLength(title)} / ${TITLE_MAX_LENGTH}`
        }
        fullWidth
        slotProps={{ htmlInput: { 'aria-label': t('Title') } }}
      />
      <TextField
        label={t('Slug')}
        value={slug}
        onChange={(event) => setSlug(shapeSlug(event.target.value))}
        onBlur={handleSlugBlur}
        onKeyDown={handleKeyDown}
        error={errors.slug != null}
        helperText={
          errors.slug ?? (
            <>
              <Box component="span" sx={{ display: 'block' }}>
                {t(
                  'Changing this breaks links to this page you have already shared.'
                )}
              </Box>
              <Box component="span" sx={{ display: 'block' }}>
                {t('Permanent address: {{address}}', {
                  address: permanentAddress
                })}
              </Box>
              {publicAddresses.map((address) => (
                <Box key={address} component="span" sx={{ display: 'block' }}>
                  {t('Current public address: {{address}}', { address })}
                </Box>
              ))}
              <Box component="span" sx={{ display: 'block' }}>
                {`${textLength(slug)} / ${SLUG_MAX_LENGTH}`}
              </Box>
            </>
          )
        }
        fullWidth
        slotProps={{ htmlInput: { 'aria-label': t('Slug') } }}
      />
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
      </Dialog>
    </Stack>
  )
}
