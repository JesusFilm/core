import { capturePermissionEffect } from '../../lib/mcpPermissionEffects'

import { queue } from './queue'

export async function enqueueTemplateSite(
  templateId: string,
  deliveryId?: string
): Promise<void> {
  if (capturePermissionEffect({ type: 'templateSite', templateId })) return
  const FIVE_DAYS = 5 * 24 * 60 * 60
  await queue.add(
    'create-template-site',
    { __typename: 'plausibleCreateTemplateSite', templateId },
    {
      ...(deliveryId ? { jobId: deliveryId } : {}),
      removeOnComplete: deliveryId ? { age: FIVE_DAYS } : true,
      removeOnFail: { age: FIVE_DAYS, count: 50 }
    }
  )
}
