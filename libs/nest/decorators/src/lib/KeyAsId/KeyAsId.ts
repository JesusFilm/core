import has from 'lodash/has'
import omit from 'lodash/omit'

interface TransformObject {
  _key?: string
  id?: string
}

export const keyAsId = (obj: TransformObject): TransformObject =>
  has(obj, '_key') ? omit({ ...obj, id: obj._key }, ['_key']) : obj

export function KeyAsId() {
  return (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) => {
    const childFunction = descriptor.value
    descriptor.value = async function (...args: TransformObject[]) {
      const result = await childFunction.apply(this, args)
      return Array.isArray(result) ? result.map(keyAsId) : keyAsId(result)
    }
  }
}
