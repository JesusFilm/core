import { useQuery } from '@apollo/client/react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useRef, useState } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useTeam } from '@core/journeys/ui/TeamProvider'
import { GET_USER_ROLE } from '@core/journeys/ui/useUserRoleQuery'
import { Dialog } from '@core/shared/ui/Dialog'

import { GetUserRole } from '../../../__generated__/GetUserRole'
import {
  JourneyUpdateInput,
  Role,
  UserJourneyRole,
  UserTeamRole
} from '../../../__generated__/globalTypes'
import { TemplateLabels_adminJourney } from '../../../__generated__/TemplateLabels'
import { useAuth } from '../../libs/auth'
import { useJourneyUpdateMutation } from '../../libs/useJourneyUpdateMutation'
import { useTemplateLabelsQuery } from '../../libs/useTemplateLabelsQuery'

const labelFields = ['custom1Label', 'custom2Label', 'custom3Label'] as const
type LabelField = (typeof labelFields)[number]
type LabelValues = Record<LabelField, string>

export function CustomTrackingLabels(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const { user } = useAuth()
  const { query: teamsQuery } = useTeam()
  const { data: roles } = useQuery<GetUserRole>(GET_USER_ROLE, {
    skip: user == null
  })
  const { data, loading, error, refetch } = useTemplateLabelsQuery(
    journey?.template === true ? journey.id : undefined
  )
  const [open, setOpen] = useState(false)
  const [saved, setSaved] = useState(false)

  const journeyRole = journey?.userJourneys?.find(
    ({ user: journeyUser }) => journeyUser?.id === user?.id
  )?.role
  const teamRole = teamsQuery?.data?.teams
    .find(({ id }) => id === journey?.team?.id)
    ?.userTeams.find(
      ({ user: teamUser }) =>
        teamUser.__typename === 'AuthenticatedUser' && teamUser.id === user?.id
    )?.role
  const canEdit =
    user != null &&
    (roles?.getUserRole?.roles?.includes(Role.publisher) === true ||
      journeyRole === UserJourneyRole.owner ||
      journeyRole === UserJourneyRole.editor ||
      teamRole === UserTeamRole.manager ||
      teamRole === UserTeamRole.member)

  if (journey?.template !== true || !canEdit) return <></>

  function handleOpen(): void {
    setSaved(false)
    setOpen(true)
  }

  return (
    <Stack spacing={2}>
      <Button
        onClick={handleOpen}
        disabled={loading || error != null || data?.adminJourney == null}
      >
        {t('Custom tracking labels')}
      </Button>
      {error != null && (
        <Alert
          severity="error"
          action={
            <Button
              onClick={() => {
                void refetch().catch(() => undefined)
              }}
            >
              {t('Retry')}
            </Button>
          }
        >
          {t('Unable to load custom tracking labels')}
        </Alert>
      )}
      {saved && (
        <Alert severity="success">{t('Custom tracking labels saved')}</Alert>
      )}
      {open && data?.adminJourney != null && (
        <CustomTrackingLabelsForm
          key={journey.id}
          labels={data.adminJourney}
          onClose={() => setOpen(false)}
          onSaved={() => {
            setSaved(true)
            setOpen(false)
          }}
        />
      )}
    </Stack>
  )
}

interface CustomTrackingLabelsFormProps {
  labels: TemplateLabels_adminJourney
  onClose: () => void
  onSaved: () => void
}

function CustomTrackingLabelsForm({
  labels,
  onClose,
  onSaved
}: CustomTrackingLabelsFormProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [initialValues] = useState<LabelValues>({
    custom1Label: labels.custom1Label ?? '',
    custom2Label: labels.custom2Label ?? '',
    custom3Label: labels.custom3Label ?? ''
  })
  const [values, setValues] = useState(initialValues)
  const [saveError, setSaveError] = useState(false)
  const [journeyUpdate, { loading }] = useJourneyUpdateMutation({
    includeCustomLabels: true
  })
  const saving = useRef(false)
  const fieldLabels = {
    custom1Label: t('Custom Tracking 1'),
    custom2Label: t('Custom Tracking 2'),
    custom3Label: t('Custom Tracking 3')
  }
  const overlength = labelFields.some(
    (field) => Array.from(values[field].trim()).length > 100
  )

  function handleClose(): void {
    if (!saving.current) onClose()
  }

  async function handleSave(): Promise<void> {
    if (overlength || saving.current) return
    const input: JourneyUpdateInput = {}
    for (const field of labelFields) {
      const value = values[field].trim() || null
      if (value !== (initialValues[field].trim() || null)) input[field] = value
    }
    if (Object.keys(input).length === 0) {
      onClose()
      return
    }
    saving.current = true
    setSaveError(false)
    try {
      await journeyUpdate({ variables: { id: labels.id, input } })
      onSaved()
    } catch {
      setSaveError(true)
    } finally {
      saving.current = false
    }
  }

  return (
    <Dialog
      open
      onClose={handleClose}
      dialogTitle={{ title: t('Custom tracking labels') }}
      dialogActionChildren={
        <>
          <Button onClick={handleClose} disabled={loading}>
            {t('Cancel')}
          </Button>
          <Button
            onClick={() => {
              void handleSave()
            }}
            loading={loading}
            disabled={overlength}
          >
            {t('Save')}
          </Button>
        </>
      }
    >
      <Stack spacing={4} sx={{ pt: 2 }}>
        <Typography>
          {t(
            'Name the custom tracking slots for this template. These names appear in its tracking choices and report. Child projects keep their current labels.'
          )}
        </Typography>
        {labelFields.map((field) => (
          <TextField
            key={field}
            label={fieldLabels[field]}
            value={values[field]}
            disabled={loading}
            onChange={(event) =>
              setValues({ ...values, [field]: event.target.value })
            }
            error={Array.from(values[field].trim()).length > 100}
            helperText={
              Array.from(values[field].trim()).length > 100
                ? t('Use 100 characters or fewer')
                : t('Leave blank to use the default label')
            }
            fullWidth
          />
        ))}
        {saveError && (
          <Alert severity="error">
            {t('Unable to save custom tracking labels. Try again.')}
          </Alert>
        )}
      </Stack>
    </Dialog>
  )
}
