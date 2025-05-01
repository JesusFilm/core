import { QueueEvents } from 'bullmq'

import { connection } from '../../lib/redisConnection'
import { queueName } from '../../workers/userQueue'
import { builder } from '../builder'

// Define the notification status shape
class QueueNotificationStatusShape {
  userId: string
  queueName: string
  jobId: string
  status: string
  progress: number
  message: string
  timestamp: string

  constructor(
    userId: string,
    queueName: string,
    jobId: string,
    status: string,
    progress: number,
    message: string
  ) {
    this.userId = userId
    this.queueName = queueName
    this.jobId = jobId
    this.status = status
    this.progress = progress
    this.message = message
    this.timestamp = new Date().toISOString()
  }
}

// Create the object ref and type
const QueueNotificationStatusRef = builder
  .objectRef<QueueNotificationStatusShape>('QueueNotificationStatus')
  .implement({})

// Define the notification object type
const QueueNotificationStatus = builder.objectType(QueueNotificationStatusRef, {
  name: 'QueueNotificationStatus',
  fields: (t) => ({
    userId: t.exposeString('userId', { nullable: false }),
    queueName: t.exposeString('queueName', { nullable: false }),
    jobId: t.exposeString('jobId', { nullable: false }),
    status: t.exposeString('status', { nullable: false }),
    progress: t.exposeInt('progress', { nullable: false }),
    message: t.exposeString('message', { nullable: false }),
    timestamp: t.exposeString('timestamp', { nullable: false })
  })
})

// Define the subscription field for queue notifications
builder.subscriptionField('userQueueNotifications', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    args: {
      userId: t.arg({ type: 'ID', required: true })
    },
    type: QueueNotificationStatus,
    nullable: true,
    subscribe: async (_root, { userId }, context) => {
      // User can only subscribe to their own notifications
      if (context.type !== 'authenticated' || context.user.id !== userId) {
        throw new Error('Not authorized to subscribe to these notifications')
      }

      const userQueueId = `${queueName}/${userId}`

      // Get the connection options
      if (!connection) {
        throw new Error('Queue connection options not available')
      }

      // Create QueueEvents to listen for job events
      const queueEvents = new QueueEvents(userQueueId, {
        connection
      })

      // Create an async iterator that will emit job status updates
      async function* createNotificationIterator(): AsyncGenerator<
        QueueNotificationStatusShape,
        void,
        unknown
      > {
        // Set up a promise-based event system
        const events: {
          resolve: ((value: QueueNotificationStatusShape) => void) | null
          promise: Promise<QueueNotificationStatusShape>
        } = {
          resolve: null,
          promise: new Promise<QueueNotificationStatusShape>((resolve) => {
            events.resolve = resolve
          })
        }

        // Function to create a new promise when the previous one is resolved
        const createNewPromise = () => {
          events.promise = new Promise<QueueNotificationStatusShape>(
            (resolve) => {
              events.resolve = resolve
            }
          )
        }

        // Handle job events to emit notifications
        const handleJobEvent = (
          status: string,
          jobId: string,
          data?: number | object
        ) => {
          if (events.resolve) {
            const notification = new QueueNotificationStatusShape(
              userId,
              userQueueId,
              jobId,
              status,
              typeof data === 'number' ? data : 0,
              `Job ${jobId} ${status}`
            )
            events.resolve(notification)
            createNewPromise()
          }
        }

        // Add event listeners for all relevant job states
        queueEvents.on('progress', ({ jobId, data }) => {
          handleJobEvent('progress', jobId, data)
        })

        queueEvents.on('completed', ({ jobId }) => {
          handleJobEvent('completed', jobId)
        })

        queueEvents.on('failed', ({ jobId }) => {
          handleJobEvent('failed', jobId)
        })

        queueEvents.on('active', ({ jobId }) => {
          handleJobEvent('active', jobId)
        })

        queueEvents.on('added', ({ jobId }) => {
          handleJobEvent('added', jobId)
        })

        queueEvents.on('delayed', ({ jobId }) => {
          handleJobEvent('delayed', jobId)
        })

        // Emit initial notification
        const initialNotification = new QueueNotificationStatusShape(
          userId,
          userQueueId,
          'subscription-start',
          'subscribed',
          0,
          'Subscribed to queue notifications'
        )
        yield initialNotification

        try {
          // Continue yielding notifications as they come in
          while (true) {
            yield await events.promise
          }
        } finally {
          // Clean up when subscription ends
          queueEvents.removeAllListeners()
          await queueEvents.close()
        }
      }

      return createNotificationIterator()
    },
    resolve: (payload) => payload
  })
)

// Export the notification status type
export { QueueNotificationStatusRef }
