import omit from 'lodash/omit'

interface TransformObject {
  __typename?: string
  typename?: string
}

export const fromPostgresql = (obj: TransformObject): object => ({
  ...(obj.typename != null ? { __typename: obj.typename } : {}),
  ...omit(obj, 'typename')
})

export function FromPostgresql() {
  return (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) => {
    const childFunction = descriptor.value
    descriptor.value = async function (...args: TransformObject[]) {
      const result = await childFunction.apply(this, args)
      return Array.isArray(result)
        ? result.map(fromPostgresql)
        : fromPostgresql(result)
    }
  }
}
