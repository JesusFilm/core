// import { Test, TestingModule } from '@nestjs/testing'
// import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

// import { Block, Journey, UserTeamRole } from '.prisma/api-journeys-client'
// import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'

// import {
//   TextResponseBlockCreateInput,
//   TextResponseBlockUpdateInput,
//   TextResponseType
// } from '../../../__generated__/graphql'
// import { AppAbility, AppCaslFactory } from '../../../lib/casl/caslFactory'
// import { PrismaService } from '../../../lib/prisma.service'
// import { BlockService } from '../block.service'

// import { TextResponseBlockResolver } from './textResponse.resolver'

// describe('TextResponseBlockResolver', () => {
//   let resolver: TextResponseBlockResolver,
//     service: DeepMockProxy<BlockService>,
//     prismaService: DeepMockProxy<PrismaService>,
//     ability: AppAbility

//   const journey = {
//     team: { userTeams: [{ userId: 'userId', role: UserTeamRole.manager }] }
//   } as unknown as Journey
//   const block = {
//     id: 'blockId',
//     journeyId: 'journeyId',
//     parentBlockId: 'parentBlockId',
//     typename: 'TextResponseBlock',
//     parentOrder: 1,
//     submitIconId: 'submitIconId',
//     submitLabel: 'Submit',
//     updatedAt: '2024-10-21T04:32:25.858Z'
//   } as unknown as Block
//   const blockWithUserTeam = {
//     ...block,
//     journey
//   }
//   const blockCreateInput: TextResponseBlockCreateInput = {
//     id: 'blockId',
//     journeyId: 'journeyId',
//     parentBlockId: 'parentBlockId',
//     label: 'Your answer here...'
//   }
//   const blockUpdateInput: TextResponseBlockUpdateInput = {
//     parentBlockId: 'parentBlockId',
//     label: 'Your answer',
//     hint: 'Enter your answer above',
//     routeId: 'routeId',
//     integrationId: 'integrationId',
//     type: TextResponseType.email
//   }

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       imports: [CaslAuthModule.register(AppCaslFactory)],
//       providers: [
//         {
//           provide: BlockService,
//           useValue: mockDeep<BlockService>()
//         },
//         TextResponseBlockResolver,
//         {
//           provide: PrismaService,
//           useValue: mockDeep<PrismaService>()
//         }
//       ]
//     }).compile()
//     resolver = module.get<TextResponseBlockResolver>(TextResponseBlockResolver)
//     service = module.get<BlockService>(
//       BlockService
//     ) as DeepMockProxy<BlockService>
//     prismaService = module.get<PrismaService>(
//       PrismaService
//     ) as DeepMockProxy<PrismaService>
//     ability = await new AppCaslFactory().createAbility({ id: 'userId' })
//     service.getSiblings.mockResolvedValue([
//       { ...block, action: null },
//       { ...block, action: null }
//     ])
//   })

//   describe('TextResponseBlockCreate', () => {
//     beforeEach(() => {
//       prismaService.$transaction.mockImplementation(
//         async (callback) => await callback(prismaService)
//       )
//     })

//     it('creates a TextResponseBlock', async () => {
//       prismaService.block.create.mockResolvedValueOnce(blockWithUserTeam)
//       expect(
//         await resolver.textResponseBlockCreate(ability, blockCreateInput)
//       ).toEqual(blockWithUserTeam)
//       expect(prismaService.block.create).toHaveBeenCalledWith({
//         data: {
//           id: 'blockId',
//           journey: { connect: { id: 'journeyId' } },
//           parentBlock: { connect: { id: 'parentBlockId' } },
//           parentOrder: 2,
//           typename: 'TextResponseBlock',
//           label: 'Your answer here...'
//         },
//         include: {
//           journey: {
//             include: {
//               team: { include: { userTeams: true } },
//               userJourneys: true
//             }
//           }
//         }
//       })
//       expect(service.getSiblings).toHaveBeenCalledWith(
//         blockCreateInput.journeyId,
//         blockCreateInput.parentBlockId
//       )
//     })

//     it('should update journey updatedAt when text response is created', async () => {
//       prismaService.block.create.mockResolvedValueOnce(blockWithUserTeam)
//       expect(
//         await resolver.textResponseBlockCreate(ability, blockCreateInput)
//       ).toEqual(blockWithUserTeam)
//       expect(service.setJourneyUpdatedAt).toHaveBeenCalledWith(
//         prismaService,
//         blockWithUserTeam
//       )
//     })

//     it('throws error if not authorized', async () => {
//       prismaService.block.create.mockResolvedValueOnce(block)
//       await expect(
//         resolver.textResponseBlockCreate(ability, blockCreateInput)
//       ).rejects.toThrow('user is not allowed to create block')
//     })
//   })

//   describe('TextResponseBlockUpdate', () => {
//     let mockValidate: jest.MockedFunction<typeof service.validateBlock>

//     beforeEach(() => {
//       mockValidate = service.validateBlock as jest.MockedFunction<
//         typeof service.validateBlock
//       >
//       mockValidate.mockResolvedValue(true)
//     })

//     it('updates a TextResponseBlock', async () => {
//       prismaService.block.findUnique.mockResolvedValueOnce(blockWithUserTeam)
//       await resolver.textResponseBlockUpdate(ability, 'blockId', {
//         ...blockUpdateInput,
//         routeId: 'routeId',
//         integrationId: 'integrationId',
//         type: TextResponseType.email
//       })
//       expect(service.update).toHaveBeenCalledWith('blockId', blockUpdateInput)
//     })

//     it('throws error if trying to set routeId with no associated interationId', async () => {
//       prismaService.block.findUnique.mockResolvedValueOnce(blockWithUserTeam)
//       await expect(
//         resolver.textResponseBlockUpdate(ability, 'blockId', {
//           ...blockUpdateInput,
//           integrationId: null
//         })
//       ).rejects.toThrow(
//         'route is being set but it is not associated to an integration'
//       )
//     })

//     it('throws error if not found', async () => {
//       prismaService.block.findUnique.mockResolvedValueOnce(null)
//       await expect(
//         resolver.textResponseBlockUpdate(ability, 'blockId', blockUpdateInput)
//       ).rejects.toThrow('block not found')
//     })

//     it('throws error if not authorized', async () => {
//       prismaService.block.findUnique.mockResolvedValueOnce(block)
//       await expect(
//         resolver.textResponseBlockUpdate(ability, 'blockId', blockUpdateInput)
//       ).rejects.toThrow('user is not allowed to update blosck')
//     })
//   })
// })
