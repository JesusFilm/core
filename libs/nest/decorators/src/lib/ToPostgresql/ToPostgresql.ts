import isObject from 'lodash/isObject'
import omit from 'lodash/omit'

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
      ...args: Array<TransformObject[] | TransformObject>
    ) {
      const newArgs = args.map((obj) =>
        Array.isArray(obj)
          ? obj.map((result) =>
              isObject(result) ? toPostgresql(result) : result
            )
          : isObject(obj)
          ? toPostgresql(obj)
          : obj
      )
      const result = await childFunction.apply(this, newArgs)
      return Array.isArray(result)
        ? result.map(fromPostgresql)
        : fromPostgresql(result)
    }
  }
}
