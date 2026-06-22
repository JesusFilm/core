import { builder } from '../../builder'

export const IdType = builder.enumType('IdType', {
  values: ['databaseId', 'slug'] as const
})
