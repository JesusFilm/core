import { Queue } from 'bullmq'

import { connection } from '../connection'

import { queueName } from './names'

export const bigQueryQueue = new Queue(queueName, { connection })
