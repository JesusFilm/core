import { Queue } from 'bullmq'

import { connection } from '../lib/connection'

import { queueName } from './config'

export const queue = new Queue(queueName, { connection })
