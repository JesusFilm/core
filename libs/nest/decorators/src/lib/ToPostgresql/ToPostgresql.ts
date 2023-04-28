import { omit, pick } from 'lodash'
import { fromPostgresql } from '../FromPostgresql/FromPostgresql'

interface TransformObject {
  extra?: object
  __typename?: string
  typename?: string
}

export const toPostgresql = (
  obj: TransformObject,
  objectFields?: string[]
): TransformObject => ({
  ...pick(omit(obj, '__typename'), objectFields ?? []),
  ...(obj.__typename != null ? { typename: obj.__typename } : {}),
  ...(objectFields != null
    ? { extra: omit(obj, [...objectFields, '__typename']) }
    : {})
})

export function ToPostgresql(objectFields?: string[]) {
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
        ? obj.map((result) => toPostgresql(result, objectFields))
        : toPostgresql(obj, objectFields)
      const result = await childFunction.apply(this, newArg)
      return Array.isArray(result)
        ? result.map(fromPostgresql)
        : fromPostgresql(result)
    }
  }
}
