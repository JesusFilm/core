import { hkt } from '@casl/ability'
import {
  ExtractModelName,
  Model,
  createAbilityFactory,
  createAccessibleByFactory
} from '@casl/prisma/runtime'

import type { Prisma, PrismaClient } from '@core/prisma/journeys/client'

type ModelName = Prisma.ModelName
type ModelWhereInput = {
  [K in Prisma.ModelName]: Uncapitalize<K> extends keyof PrismaClient
    ? Extract<
        Parameters<PrismaClient[Uncapitalize<K>]['findFirst']>[0],
        { where?: unknown }
      >['where']
    : never
}

type WhereInput<TModelName extends Prisma.ModelName> = Extract<
  ModelWhereInput[TModelName],
  Record<string | number | symbol, unknown>
>

interface PrismaQueryTypeFactory extends hkt.GenericFactory {
  produce: WhereInput<ExtractModelName<this[0], ModelName>>
}

type PrismaModel = Model<Record<string, unknown>, string>
// Higher Order type that allows to infer passed in Prisma Model name
export type PrismaQuery<T extends PrismaModel = PrismaModel> = WhereInput<
  ExtractModelName<T, ModelName>
> &
  hkt.Container<PrismaQueryTypeFactory>

export type WhereInputPerModel = {
  [K in ModelName]: WhereInput<K>
}

const createPrismaAbility = createAbilityFactory<ModelName, PrismaQuery>()
const accessibleBy = createAccessibleByFactory<
  WhereInputPerModel,
  PrismaQuery
>()

export { createPrismaAbility, accessibleBy }
