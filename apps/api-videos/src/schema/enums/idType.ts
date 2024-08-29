import { builder } from '../builder'

export enum IdTypeShape {
  databaseId = 'databaseId',
  slug = 'slug'
}

export const IdType = builder.enumType(IdTypeShape, { name: 'IdType' })
