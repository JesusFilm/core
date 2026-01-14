import omit from 'lodash/omit'

export function Omit(omitFields: string[]) {
  return (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) => {
    const childFunction = descriptor.value
    descriptor.value = async function (...args: unknown[]) {
      const newArgs = Array.isArray(args)
        ? args.map((r) => omit(r as object, omitFields))
        : omit(args as object, omitFields)
      return childFunction.apply(this, newArgs)
    }
  }
}
