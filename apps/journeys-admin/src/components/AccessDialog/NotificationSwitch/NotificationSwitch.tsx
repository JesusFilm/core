import { ApolloError } from '@apollo/client'
import Box from '@mui/material/Box'
import Switch from '@mui/material/Switch'
import Tooltip from '@mui/material/Tooltip'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ChangeEvent, ReactElement } from 'react'

import { useJourneyNotificationUpdate } from '../../../libs/useJourneyNotificationUpdate'

interface NotificationSwitchProps {
  name?: string
  checked?: boolean
  disabled?: boolean
  journeyId?: string
}

export function NotificationSwitch({
  name,
  checked,
  disabled,
  journeyId
}: NotificationSwitchProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()

  const [journeyNotificationUpdate, { loading }] =
    useJourneyNotificationUpdate()

  async function handleChange(e: ChangeEvent<HTMLInputElement>): Promise<void> {
    if (journeyId == null) return
    try {
      await journeyNotificationUpdate({
        variables: {
          input: {
            journeyId,
            visitorInteractionEmail: e.target.checked
          }
        }
      })
    } catch (error) {
      if (error instanceof ApolloError) {
        if (error.networkError != null) {
          enqueueSnackbar(
            t('Notification update failed. Reload the page or try again.'),
            {
              variant: 'error',
              preventDuplicate: true
            }
          )
          return
        }
      }
      if (error instanceof Error) {
        enqueueSnackbar(error.message, {
          variant: 'error',
          preventDuplicate: true
        })
      }
    }
  }

  return (
    <Tooltip title={t('Only {{ name }} can change this', { name })}>
      <Box>
        <Switch
          inputProps={{ 'aria-checked': checked }}
          checked={checked}
          onChange={handleChange}
          disabled={loading || disabled}
        />
      </Box>
    </Tooltip>
  )
}
