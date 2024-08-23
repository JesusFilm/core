import { Queue } from 'bullmq'

import { connection } from '../connection'

import { queueName } from './names'

export const queue = new Queue(queueName, { connection })
