import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'

import CopyLeft from '@core/shared/ui/icons/CopyLeft'

import { useJourneyDuplicateMutation } from '../../../libs/useJourneyDuplicateMutation'
import { MenuItem } from '../../MenuItem'
import { CopyToTeamDialog } from '../CopyToTeamDialog'

interface DuplicateJourneyMenuItemProps {
  id?: string
  handleCloseMenu: () => void
}

export function CopyToTeamMenuItem({
  id,
  handleCloseMenu
}: DuplicateJourneyMenuItemProps): ReactElement {
  const [duplicateTeamDialogOpen, setDuplicateTeamDialogOpen] =
    useState<boolean>(false)
  const [journeyDuplicate] = useJourneyDuplicateMutation()
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation('apps-journeys-admin')

  const handleDuplicateJourney = async (teamId: string): Promise<void> => {
    if (id == null) return

    const data = await await journeyDuplicate({
      variables: {
        id,
        teamId
      }
    })

    if (data != null) {
      handleCloseMenu()
      enqueueSnackbar(t('Journey Copied'), {
        variant: 'success',
        preventDuplicate: true
      })
    }
  }

  return (
    <>
      <MenuItem
        label={t('Copy to ...')}
        icon={<CopyLeft color="secondary" />}
        onClick={() => {
          setDuplicateTeamDialogOpen(true)
        }}
      />
      <CopyToTeamDialog
        title={t('Copy to Another Team')}
        open={duplicateTeamDialogOpen}
        onClose={() => {
          setDuplicateTeamDialogOpen(false)
        }}
        submitAction={handleDuplicateJourney}
      />
    </>
  )
}
