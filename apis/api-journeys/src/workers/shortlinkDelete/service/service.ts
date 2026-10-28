import { Job } from 'bullmq'

import { deleteShortLink } from '../../../schema/qrCode/qrCode.service'

export interface ShortLinkDeleteJob {
  shortLinkId: string
}

/**
 * Delete one api-media short link whose QR row is already gone. Any error
 * throws so BullMQ retries the job; a link that is already deleted answers
 * `NotFoundError`, which `deleteShortLink` treats as success.
 */
export async function service(job: Job<ShortLinkDeleteJob>): Promise<void> {
  await deleteShortLink(job.data.shortLinkId)
}
