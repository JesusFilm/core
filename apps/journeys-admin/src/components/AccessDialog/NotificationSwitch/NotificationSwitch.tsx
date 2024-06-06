import { ApolloError } from '@apollo/client'
import Box from '@mui/material/Box'
import Switch from '@mui/material/Switch'
import Tooltip from '@mui/material/Tooltip'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

import { useEventEmailNotificationsUpdate } from '../../../libs/useEventEmailNotificationsUpdateMutation'

interface NotificationSwitchProps {
  id?: string
  name?: string
  checked?: boolean
  disabled?: boolean
  userId?: string
  journeyId?: string
}

export function NotificationSwitch({
  id,
  name,
  checked,
  disabled,
  userId,
  journeyId
}: NotificationSwitchProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()

  const [eventEmailNotificationsUpdate, { loading }] =
    useEventEmailNotificationsUpdate()

  async function handleChange(): Promise<void> {
    if (userId == null) return
    if (journeyId == null) return
    try {
      await eventEmailNotificationsUpdate({
        variables: {
          id,
          input: {
            userId,
            journeyId,
            value: checked != null ? !checked : true
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
