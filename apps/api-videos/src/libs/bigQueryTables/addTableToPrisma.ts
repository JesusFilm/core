import noop from 'lodash/noop'

import { PrismaService } from '../../app/lib/prisma.service'

export async function addTableToPrisma(
  row: Record<string, unknown>,
  tableName: string,
  prismaService: PrismaService
): Promise<void> {
  console.log(row)
  noop()
}
