import { capturePermissionEffect } from '../../lib/mcpPermissionEffects'

import { queue } from './queue'

export async function enqueueTeamRemovedEmail(
  notification: { teamName: string; userId: string },
  deliveryId?: string
): Promise<void> {
  if (capturePermissionEffect({ type: 'teamRemoved', ...notification })) return
  await queue.add('team-removed', notification, {
    ...(deliveryId ? { jobId: deliveryId } : {}),
    removeOnComplete: deliveryId ? { age: 24 * 3600 } : true,
    removeOnFail: { age: 24 * 3600 }
  })
}
