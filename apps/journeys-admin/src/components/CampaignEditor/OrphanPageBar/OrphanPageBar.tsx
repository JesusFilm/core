import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'
import EyeOpenIcon from '@core/shared/ui/icons/EyeOpen'
import Trash2Icon from '@core/shared/ui/icons/Trash2'

import { GetCampaign_campaign_regions as CampaignRegion } from '../../../../__generated__/GetCampaign'
import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import { useCampaignRegionDeleteMutation } from '../../../libs/useCampaignRegionDeleteMutation'
import { useCampaignEditor } from '../CampaignEditorProvider'
import { useCampaignRegionCommand } from '../utils/useCampaignRegionCommand'

interface OrphanPageBarProps {
  /** The unlisted region whose Orphan Page the canvas shows. */
  region: CampaignRegion
}

/**
 * The Orphan Page's bar: "List on switcher" (a Command, no confirmation)
 * and Delete region, which is offered here only. Delete confirms, naming
 * what goes with the region, and is not a Command: there is no restore for
 * a region. After the delete the canvas returns to the landing page.
 */
export function OrphanPageBar({ region }: OrphanPageBarProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const { campaign, dispatch } = useCampaignEditor()
  const { setListed } = useCampaignRegionCommand()
  const [regionDelete, { loading: deleting }] = useCampaignRegionDeleteMutation(
    campaign.id
  )
  const [deleteOpen, setDeleteOpen] = useState(false)

  async function handleDelete(): Promise<void> {
    try {
      await regionDelete({ variables: { id: region.id } })
      setDeleteOpen(false)
      dispatch({
        type: 'SetPageKindAction',
        pageKind: CampaignPageKind.landing
      })
    } catch (error) {
      setDeleteOpen(false)
      enqueueSnackbar(
        error instanceof Error ? error.message : t('Could not delete region'),
        { variant: 'error', preventDuplicate: true }
      )
    }
  }

  return (
    <>
      <Button
        variant="outlined"
        color="secondary"
        startIcon={<EyeOpenIcon />}
        onClick={() => setListed(region, true)}
        data-testid="OrphanPageList"
      >
        {t('List on switcher')}
      </Button>
      <Button
        variant="outlined"
        color="error"
        startIcon={<Trash2Icon />}
        onClick={() => setDeleteOpen(true)}
        data-testid="OrphanPageDelete"
      >
        {t('Delete region')}
      </Button>
      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        dialogTitle={{
          title: t('Delete {{name}}?', { name: region.name }),
          closeButton: true
        }}
        dialogAction={{
          onSubmit: () => {
            void handleDelete()
          },
          submitLabel: t('Delete'),
          closeLabel: t('Cancel')
        }}
        loading={deleting}
        testId="RegionDeleteDialog"
      >
        <Typography gutterBottom>
          {t(
            'This permanently removes the region with its share languages, their QR codes, its countries and its lines. The linked journeys keep working at their own URLs.'
          )}
        </Typography>
        <Typography>{t('This cannot be undone.')}</Typography>
      </Dialog>
    </>
  )
}
