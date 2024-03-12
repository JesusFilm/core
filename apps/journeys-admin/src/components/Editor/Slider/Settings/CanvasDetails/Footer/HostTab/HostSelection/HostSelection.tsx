import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { HostAvatars } from '@core/journeys/ui/StepFooter/HostAvatars'
import AlertCircleIcon from '@core/shared/ui/icons/AlertCircle'
import Edit2Icon from '@core/shared/ui/icons/Edit2'

import { GetUserTeamsAndInvites } from '../../../../../../../../../__generated__/GetUserTeamsAndInvites'
import { ContainedIconButton } from '../../../../../../../ContainedIconButton'

interface HostSelectionProps {
  data: GetUserTeamsAndInvites | undefined
  userInTeam: boolean
  setSelectHostBox: (value: boolean) => void
  setOpenHostForm: (value: boolean) => void
  setOpenHostList: (value: boolean) => void
}

export function HostSelection({
  data,
  userInTeam,
  setSelectHostBox,
  setOpenHostForm,
  setOpenHostList
}: HostSelectionProps): ReactElement {
  const { journey } = useJourney()
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <>
      {journey?.host != null ? (
        <Stack sx={{ p: 4 }}>
          <ContainedIconButton
            label={journey.host.title}
            description={journey.host.location ?? ''}
            disabled={!userInTeam}
            slots={{
              ImageThumbnail: (
                <HostAvatars
                  size="small"
                  avatarSrc1={journey.host.src1}
                  avatarSrc2={journey.host.src2}
                  hasPlaceholder
                />
              )
            }}
            onClick={() => {
              setSelectHostBox(false)
              setOpenHostForm(true)
            }}
            actionIcon={<Edit2Icon />}
          />
        </Stack>
      ) : (
        <Stack sx={{ p: 4 }}>
          <ContainedIconButton
            label={t('Select a Host')}
            disabled={!userInTeam}
            slots={{
              ImageThumbnail: <HostAvatars size="large" hasPlaceholder />
            }}
            onClick={() => {
              setSelectHostBox(false)
              setOpenHostList(true)
            }}
          />
        </Stack>
      )}
      {!userInTeam && journey?.team != null && (
        <Stack direction="row" alignItems="center" gap={3}>
          <AlertCircleIcon />
          <Typography variant="subtitle2">
            {data?.userTeams.length === 0
              ? t('Cannot edit hosts for this old journey')
              : t('Only {{ teamName }} members can edit this', {
                  teamName: journey.team.title
                })}
          </Typography>
        </Stack>
      )}
    </>
  )
}
