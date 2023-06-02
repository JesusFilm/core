import { omit } from 'lodash'
import { fromPostgresql } from '../FromPostgresql'

interface TransformObject {
  __typename?: string
  typename?: string
}

export const toPostgresql = (obj: TransformObject): TransformObject => ({
  ...omit(obj, '__typename'),
  ...(obj.__typename != null ? { typename: obj.__typename } : {})
})

export function ToPostgresql() {
  return (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) => {
    const childFunction = descriptor.value
    descriptor.value = async function (
      obj: TransformObject[] | TransformObject
    ) {
      const newArg = Array.isArray(obj)
        ? obj.map((result) => toPostgresql(result))
        : toPostgresql(obj)
      const result = await childFunction.apply(this, newArg)
      return Array.isArray(result)
        ? result.map(fromPostgresql)
        : fromPostgresql(result)
    }
  }
}
