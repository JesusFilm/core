import { Job, Queue, QueueEvents, Worker } from 'bullmq'

import { connection } from '../../lib/redisConnection'
import { queueName } from '../../workers/userQueue'
import { AiTranslateJourneyJob, service } from '../../workers/userQueue/service'
import { builder } from '../builder'

class JourneyAiTranslateStatusShape {
  id: string
  status: string
  progress: number
  constructor(id: string, status: string, progress: number) {
    this.id = id
    this.status = status
    this.progress = progress
  }
}

const JourneyAiTranslateStatusRef = builder
  .objectRef<JourneyAiTranslateStatusShape>('JourneyAiTranslateStatus')
  .implement({})

const JourneyAiTranslateStatus = builder.objectType(
  JourneyAiTranslateStatusRef,
  {
    name: 'JourneyAiTranslateStatus',
    fields: (t) => ({
      id: t.exposeString('id', { nullable: false }),
      status: t.exposeString('status', { nullable: false }),
      progress: t.exposeInt('progress', { nullable: false })
    })
  }
)

builder.subscriptionField('journeyAiTranslateStatus', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    args: {
      jobId: t.arg({ type: 'ID', required: true })
    },
    type: JourneyAiTranslateStatus,
    nullable: true,
    subscribe: async (_root, { jobId }, context) => {
      // Access queue from context same as in the query resolver
      const { queue } = context

      // Create a function to get job state - reusing similar logic from the query resolver
      const getJobState = async (): Promise<JourneyAiTranslateStatusShape> => {
        try {
          const job = (await queue?.getJob(jobId)) as Job<AiTranslateJourneyJob>
          if (!job) {
            throw new Error('Job not found')
          }

          let status = 'pending'
          if (await job.isActive()) status = 'processing'
          if (await job.isCompleted()) status = 'completed'
          if (await job.isFailed()) status = 'failed'

          return {
            id: jobId,
            status,
            progress: ((await job.progress) as number) ?? 0
          }
        } catch (error) {
          console.error('Error getting job state:', error)
          return {
            id: jobId,
            status: 'error',
            progress: 0
          }
        }
      }

      const queueEvents = new QueueEvents('userQueue', {
        connection
      })

      // Create an async iterator that will emit job status updates
      async function* createJobStatusIterator(): AsyncGenerator<
        JourneyAiTranslateStatusShape,
        void,
        unknown
      > {
        // First, emit the initial state
        yield await getJobState()

        // Set up a promise-based event system
        const events: {
          resolve: ((value: JourneyAiTranslateStatusShape) => void) | null
          promise: Promise<JourneyAiTranslateStatusShape>
        } = {
          resolve: null,
          promise: new Promise<JourneyAiTranslateStatusShape>((resolve) => {
            events.resolve = resolve
          })
        }

        // Function to create a new promise when the previous one is resolved
        const createNewPromise = () => {
          events.promise = new Promise<JourneyAiTranslateStatusShape>(
            (resolve) => {
              events.resolve = resolve
            }
          )
        }

        // Set up event handlers for this specific job
        const handleJobEvent = async () => {
          if (events.resolve) {
            const state = await getJobState()
            events.resolve(state)
            createNewPromise()
          }
        }

        // Add event listeners for all relevant job states
        queueEvents.on('progress', ({ jobId: eventJobId }) => {
          if (eventJobId === jobId) void handleJobEvent()
        })

        queueEvents.on('completed', ({ jobId: eventJobId }) => {
          if (eventJobId === jobId) void handleJobEvent()
        })

        queueEvents.on('failed', ({ jobId: eventJobId }) => {
          if (eventJobId === jobId) void handleJobEvent()
        })

        queueEvents.on('active', ({ jobId: eventJobId }) => {
          if (eventJobId === jobId) void handleJobEvent()
        })

        try {
          // Continue yielding job status updates as they come in
          while (true) {
            yield await events.promise
          }
        } finally {
          // Clean up when subscription ends
          queueEvents.removeAllListeners()
          await queueEvents.close()
        }
      }

      return createJobStatusIterator()
    },
    resolve: (payload) => payload
  })
)

// Add a type definition to ensure TypeScript understands our context
type WorkerContext = {
  queue?: Queue
  worker?: Worker
  user: { id: string }
}

builder.mutationFields((t) => ({
  journeyAiTranslateCreate: t
    .withAuth({ isAuthenticated: true })
    .fieldWithInput({
      input: {
        journeyId: t.input.id({ required: true }),
        name: t.input.string({ required: true }),
        textLanguageId: t.input.id({ required: true }),
        videoLanguageId: t.input.id({ required: false })
      },
      type: 'ID',
      nullable: false,
      resolve: async (_root, { input }, context: WorkerContext) => {
        const { user } = context
        const userQueueName = `${queueName}/${user.id}`

        // Ensure queue exists
        const queue: Queue =
          context.queue || new Queue(userQueueName, { connection })
        context.queue = queue

        // Create worker if it doesn't exist
        if (!context.worker) {
          // Create a worker
          const worker = new Worker(
            userQueueName,
            async (job) => {
              try {
                await service(job)
                return true
              } catch (error) {
                console.error(`Error processing job ${job.id}:`, error)
                throw error
              }
            },
            {
              connection,
              autorun: true,
              concurrency: 2,
              stalledInterval: 30000,
              drainDelay: 60000 // 1 minute of inactivity before closing
            }
          )

          context.worker = worker

          // Event handlers
          worker.on('completed', (job) => {
            console.log(`Job ${job.id} completed successfully`)
          })

          worker.on('failed', (job, err) => {
            console.error(`Job ${job?.id} failed with error:`, err)
          })

          worker.on('drained', () => {
            console.log('Queue is empty, closing worker')
            if (context.worker) {
              try {
                void context.worker.close()
                context.worker = undefined
              } catch (error) {
                console.error('Error closing worker:', error)
              }
            }
          })
        }

        const job = (await queue.add(
          `${input.journeyId}`,
          {
            userId: user.id,
            type: 'journeyAiTranslate',
            inputJourneyId: input.journeyId,
            name: input.name,
            textLanguageId: input.textLanguageId,
            videoLanguageId: input.videoLanguageId
          },
          {
            jobId: `journeyAiTranslate/${input.journeyId}:${input.textLanguageId}`,
            removeOnComplete: {
              age: 1000 * 60 * 60 * 24 * 5, // 5 days
              count: 100
            },
            removeOnFail: {
              age: 1000 * 60 * 60 * 24 * 5, // 5 days
              count: 100
            }
          }
        )) as Job<AiTranslateJourneyJob>

        if (!job.id) throw new Error('Failed to create job')
        return job.id
      }
    })
}))
