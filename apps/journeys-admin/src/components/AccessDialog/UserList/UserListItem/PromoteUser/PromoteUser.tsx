import { gql, useMutation } from '@apollo/client'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import AlertCircleIcon from '@core/shared/ui/icons/AlertCircle'

import { UserJourneyPromote } from '../../../../../../__generated__/UserJourneyPromote'
import { MenuItem } from '../../../../MenuItem'

interface PromoteUserProps {
  id: string
  onClick?: () => void
}

export const USER_JOURNEY_PROMOTE = gql`
  mutation UserJourneyPromote($id: ID!) {
    userJourneyPromote(id: $id) {
      id
      role
      journey {
        id
        userJourneys {
          id
          role
        }
      }
    }
  }
`

export function PromoteUser({ id, onClick }: PromoteUserProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [userJourneyPromote] = useMutation<UserJourneyPromote>(
    USER_JOURNEY_PROMOTE,
    { variables: { id } }
  )

  const handleClick = async (): Promise<void> => {
    await userJourneyPromote()
    if (onClick != null) onClick()
  }

  return (
    <MenuItem
      label={t('Promote')}
      icon={<AlertCircleIcon sx={{ color: 'secondary.light' }} />}
      onClick={handleClick}
      testId="Promote"
    />
  )
}
