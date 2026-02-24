import { PrismaClient } from '.prisma/api-analytics-client'

import { addGoalsToAllSites } from '../lib/site/addGoalsToSites'

import main from './sites-add-goals'

jest.mock('.prisma/api-analytics-client', () => ({
  __esModule: true,
  PrismaClient: (() => {
    const prismaInstance = { $disconnect: jest.fn() }
    const MockPrismaClient = jest.fn().mockImplementation(() => prismaInstance)
    ;(MockPrismaClient as any).__instance = prismaInstance
    return MockPrismaClient
  })()
}))

jest.mock('../lib/site/addGoalsToSites', () => ({
  __esModule: true,
  addGoalsToAllSites: jest.fn()
}))

describe('sites-add-goals script', () => {
  const originalEnv = process.env
  const originalArgv = process.argv
  const originalExitCode = process.exitCode

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = { ...originalEnv }
    process.argv = [...originalArgv]
    delete process.exitCode
  })

  afterAll(() => {
    process.env = originalEnv
    process.argv = originalArgv
    process.exitCode = originalExitCode
  })

  it('uses GOALS env and calls addGoalsToAllSites, then disconnects', async () => {
    process.env.GOALS = 'goal1,goal2'
    process.env.BATCH_SIZE = '200'
    process.argv = ['node', 'sites-add-goals.ts']
    ;(addGoalsToAllSites as jest.Mock).mockResolvedValue({
      totalAdded: 10,
      totalFailed: 0
    })

    await main()

    const prismaInstance = (PrismaClient as any).__instance
    expect(addGoalsToAllSites).toHaveBeenCalledWith(
      prismaInstance,
      ['goal1', 'goal2'],
      expect.objectContaining({ batchSize: 200, logger: console })
    )
    expect(process.exitCode).toBeUndefined()
    expect(prismaInstance.$disconnect).toHaveBeenCalledTimes(1)
  })

  it('sets process.exitCode=1 when totalFailed > 0', async () => {
    process.env.GOALS = 'goal1'
    process.argv = ['node', 'sites-add-goals.ts']
    ;(addGoalsToAllSites as jest.Mock).mockResolvedValue({
      totalAdded: 0,
      totalFailed: 2
    })

    await main()

    const prismaInstance = (PrismaClient as any).__instance
    expect(process.exitCode).toBe(1)
    expect(prismaInstance.$disconnect).toHaveBeenCalledTimes(1)
  })

  it('exits with code 1 when GOALS is missing and still disconnects', async () => {
    process.argv = ['node', 'sites-add-goals.ts']

    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(((
      code?: number
    ) => {
      throw new Error(`process.exit:${code ?? ''}`)
    }) as never)

    await expect(main()).rejects.toThrow('process.exit:1')

    const prismaInstance = (PrismaClient as any).__instance
    expect(exitSpy).toHaveBeenCalledWith(1)
    expect(prismaInstance.$disconnect).toHaveBeenCalledTimes(1)
  })
})
