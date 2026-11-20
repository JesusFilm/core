import {
  type TeamInviteAcceptedNotification,
  capturePermissionEffect
} from '../../lib/mcpPermissionEffects'

import { queue } from './queue'

export async function enqueueTeamInviteAcceptedEmail(
  notification: TeamInviteAcceptedNotification,
  deliveryId?: string
): Promise<void> {
  if (capturePermissionEffect({ type: 'teamInviteAccepted', notification }))
    return
  await queue.add('team-invite-accepted', notification, {
    ...(deliveryId ? { jobId: deliveryId } : {}),
    removeOnComplete: deliveryId ? { age: 24 * 3600 } : true,
    removeOnFail: { age: 24 * 3600 }
  })
}
