import { Reference, gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import MinusCircleContainedIcon from '@core/shared/ui/icons/MinusCircleContained'

import { UserInviteRemove } from '../../../../../../__generated__/UserInviteRemove'
import { UserJourneyRemove } from '../../../../../../__generated__/UserJourneyRemove'
import { useUserInvitesLazyQuery } from '../../../../../libs/useUserInvitesLazyQuery'
import { MenuItem } from '../../../../MenuItem'

interface RemoveUserProps {
  id: string
  email?: string
  onClick?: () => void
  journeyId: string
}

export const USER_JOURNEY_REMOVE = gql`
  mutation UserJourneyRemove($id: ID!) {
    userJourneyRemove(id: $id) {
      id
      journey {
        id
      }
    }
  }
`

export const USER_INVITE_REMOVE = gql`
  mutation UserInviteRemove($id: ID!, $journeyId: ID!) {
    userInviteRemove(id: $id, journeyId: $journeyId) {
      id
      journeyId
      removedAt
    }
  }
`

export function RemoveUser({
  id,
  email,
  onClick,
  journeyId
}: RemoveUserProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [userJourneyRemove] = useMutation<UserJourneyRemove>(
    USER_JOURNEY_REMOVE,
    {
      variables: { id },
      update(cache, { data }) {
        if (data?.userJourneyRemove.journey != null)
          cache.modify({
            id: cache.identify({ ...data.userJourneyRemove.journey }),
            fields: {
              userJourneys(refs, { readField }) {
                return refs.filter(
                  (ref: Reference) => id !== readField('id', ref)
                )
              }
            }
          })
      }
    }
  )

  const [userInviteRemove] = useMutation<UserInviteRemove>(USER_INVITE_REMOVE)

  const handleRemoveUserInvite = async (id: string): Promise<void> => {
    await userInviteRemove({
      variables: {
        id,
        journeyId
      },
      update(cache, { data }) {
        if (data?.userInviteRemove != null)
          cache.modify({
            fields: {
              userInvites(refs, { readField }) {
                return refs.filter(
                  (ref: Reference) => id !== readField('id', ref)
                )
              }
            }
          })
      }
    })
  }

  const [loadUserInvites] = useUserInvitesLazyQuery()

  const handleClick = async (): Promise<void> => {
    if (email == null) {
      await handleRemoveUserInvite(id)

      // Remove userJourney and any associated userInvite
    } else {
      // Clearing the associated invite is best-effort: Apollo Client 4 rejects
      // the execute promise on failure where v3 resolved with the error, and a
      // failed lookup must not block removing the user.
      try {
        const result = await loadUserInvites({ variables: { journeyId } })
        const userInvite = result.data?.userInvites?.find(
          (invite) => invite.email === email
        )
        if (userInvite != null) {
          void handleRemoveUserInvite(userInvite.id)
        }
      } catch {
        // no invite to clear
      }

      await userJourneyRemove()
    }

    onClick?.()
  }

  return (
    <MenuItem
      label={t('Remove')}
      icon={<MinusCircleContainedIcon sx={{ color: 'secondary.light' }} />}
      onClick={handleClick}
      testId="Remove"
    />
  )
}
