import { prisma } from '@core/prisma/journeys/client'
import type { PrismaClient } from '@core/prisma/journeys/client'

/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
export abstract class PrismaService {}
export interface PrismaService extends PrismaClient {}
/* eslint-enable @typescript-eslint/no-unsafe-declaration-merging */

export const prismaServiceProvider = {
  provide: PrismaService,
  useValue: prisma
}
