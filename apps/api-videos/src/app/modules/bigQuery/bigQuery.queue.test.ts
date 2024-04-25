// TODO Uncomment once seed is replaced and rename file

// import { getQueueToken } from '@nestjs/bullmq'
// import { Test, TestingModule } from '@nestjs/testing'

// import { BigQueryQueue } from './bigQuery.queue'

// describe('BigQueryQueue', () => {
//   let queue: BigQueryQueue
//   let providerQueue

//   beforeEach(async () => {
//     providerQueue = {
//       add: jest.fn(),
//       getJob: jest.fn(() => ({
//         remove: jest.fn()
//       })),
//       getRepeatableJobs: jest.fn(),
//       removeRepeatableByKey: jest.fn()
//     }

//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         BigQueryQueue,
//         {
//           provide: getQueueToken('api-videos-arclight'),
//           useValue: providerQueue
//         }
//       ]
//     })
//       .overrideProvider(getQueueToken('api-videos-arclight'))
//       .useValue(providerQueue)
//       .compile()

//     queue = module.get<BigQueryQueue>(BigQueryQueue)
//   })

//   describe('onModuleInit', () => {
//     it('should remove existing repeatable job', async () => {
//       providerQueue.getRepeatableJobs = jest
//         .fn()
//         .mockResolvedValueOnce([{ name: 'api-videos-bq-ingest', key: 'key' }])
//       await queue.onModuleInit()
//       expect(providerQueue.removeRepeatableByKey).toHaveBeenCalledWith('key')
//     })

//     it('should schedule a new job', async () => {
//       providerQueue.getRepeatableJobs = jest.fn().mockResolvedValueOnce([])
//       providerQueue.add = jest.fn()
//       await queue.onModuleInit()

//       expect(providerQueue.add).toHaveBeenCalledWith(
//         'api-videos-bq-ingest',
//         {},
//         {
//           repeat: {
//             pattern: '0 0 0 * * *'
//           }
//         }
//       )
//     })
//   })
// })
