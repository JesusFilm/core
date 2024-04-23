// TODO Uncomment once seed is replaced

// import { InjectQueue } from '@nestjs/bullmq'
// import { Injectable, OnModuleInit } from '@nestjs/common'
// import { Queue } from 'bullmq'

// @Injectable()
// export class BigQueryQueue implements OnModuleInit {
//   constructor(
//     @InjectQueue('api-videos-arclight') private readonly arclightQueue: Queue
//   ) {}

//   async onModuleInit(): Promise<void> {
//     const repeatableJobs = await this.arclightQueue.getRepeatableJobs()
//     const name = 'api-videos-bq-ingest'
//     for (const job of repeatableJobs) {
//       if (job.name === name) {
//         await this.arclightQueue.removeRepeatableByKey(job.key)
//       }
//     }

//     // Schedule a new instance
//     await this.arclightQueue.add(
//       name,
//       {},
//       {
//         repeat: {
//           pattern: '0 0 0 * * *' // Run every day at midnight
//         }
//       }
//     )
//   }
// }
