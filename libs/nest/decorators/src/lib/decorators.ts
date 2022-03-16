import { createParamDecorator } from '@nestjs/common'
import { get, has, omit } from 'lodash'
import { GqlExecutionContext } from '@nestjs/graphql'
import { AuthenticationError } from 'apollo-server-errors'

export { TranslationField } from './TranslationField'

interface TransformObject {
  _key?: string
  id?: string
}

export const idAsKey = (obj: TransformObject): TransformObject =>
  has(obj, 'id') && obj.id != null
    ? omit({ ...obj, _key: obj.id }, ['id'])
    : obj

export const keyAsId = (obj: TransformObject): TransformObject =>
  has(obj, '_key') ? omit({ ...obj, id: obj._key }, ['_key']) : obj

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

export function Omit(omitFields: string[]) {
  return (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) => {
    const childFunction = descriptor.value
    descriptor.value = async function (...args: unknown[]) {
      const newArgs = Array.isArray(args)
        ? args.map((r) => omit(r, omitFields))
        : omit(args, omitFields)
      return childFunction.apply(this, newArgs)
    }
  }
}

export const CurrentUserId = createParamDecorator((data, context) => {
  const ctx = GqlExecutionContext.create(context).getContext()
  const userId = get(ctx.headers, 'user-id')
  if (userId == null) throw new AuthenticationError('No user id provided')
  return userId
})
