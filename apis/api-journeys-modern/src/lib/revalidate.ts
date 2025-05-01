import { Queue } from 'bullmq'

export const FIVE_DAYS = 5 * 24 * 60 * 60 // in seconds

export interface RevalidateJob {
  slug: string
  hostname?: string
  fbReScrape?: boolean
}

export class RevalidateQueueService {
  private readonly queue: Queue<RevalidateJob>

  constructor() {
    this.queue = new Queue<RevalidateJob>('api-journeys-modern-revalidate')
  }

  async add(
    name: string,
    data: RevalidateJob,
    options?: {
      removeOnComplete?: boolean | number
      removeOnFail?: boolean | number | { age: number; count: number }
    }
  ): Promise<void> {
    await this.queue.add(name, data, options)
  }
}
