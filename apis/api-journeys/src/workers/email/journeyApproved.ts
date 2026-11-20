import {
  type JourneyApprovalNotification,
  capturePermissionEffect
} from '../../lib/mcpPermissionEffects'

import { queue } from './queue'

export async function enqueueJourneyApprovedEmail(
  notification: JourneyApprovalNotification,
  deliveryId?: string
): Promise<void> {
  if (capturePermissionEffect({ type: 'journeyApproved', notification })) return
  await queue.add('journey-request-approved', notification, {
    ...(deliveryId ? { jobId: deliveryId } : {}),
    removeOnComplete: deliveryId ? { age: 24 * 3600 } : true,
    removeOnFail: { age: 24 * 3600 }
  })
}
