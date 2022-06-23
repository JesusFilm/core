import { has, omit } from 'lodash'
import { keyAsId } from '../KeyAsId'

interface TransformObject {
  _key?: string
  id?: string
}

export const idAsKey = (obj: TransformObject): TransformObject =>
  has(obj, 'id') && obj.id != null
    ? omit({ ...obj, _key: obj.id }, ['id'])
    : obj

export function IdAsKey() {
  return (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) => {
    const childFunction = descriptor.value
    descriptor.value = async function (...args: TransformObject[]) {
      const newArgs = Array.isArray(args) ? args.map(idAsKey) : idAsKey(args)
      const result = await childFunction.apply(this, newArgs)
      return Array.isArray(result) ? result.map(keyAsId) : keyAsId(result)
    }
  }
}
