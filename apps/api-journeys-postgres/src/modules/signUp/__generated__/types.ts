/* eslint-disable */
import * as Types from '../../../__generated__/types'
import * as gm from 'graphql-modules'
export namespace SignUpModule {
  interface DefinedFields {
    SignUpBlock:
      | 'id'
      | 'parentBlockId'
      | 'action'
      | 'submitIcon'
      | 'submitLabel'
    SignUpResponse: 'id' | 'userId' | 'name' | 'email' | 'block'
    Mutation: 'signUpResponseCreate'
  }

  interface DefinedInputFields {
    SignUpResponseCreateInput: 'id' | 'blockId' | 'name' | 'email'
  }

  export type SignUpResponseCreateInput = Pick<
    Types.SignUpResponseCreateInput,
    DefinedInputFields['SignUpResponseCreateInput']
  >
  export type SignUpBlock = Pick<
    Types.SignUpBlock,
    DefinedFields['SignUpBlock']
  >
  export type Action = Types.Action
  export type Icon = Types.Icon
  export type Block = Types.Block
  export type SignUpResponse = Pick<
    Types.SignUpResponse,
    DefinedFields['SignUpResponse']
  >
  export type Response = Types.Response
  export type Mutation = Pick<Types.Mutation, DefinedFields['Mutation']>

  export type SignUpBlockResolvers = Pick<
    Types.SignUpBlockResolvers,
    DefinedFields['SignUpBlock'] | '__isTypeOf'
  >
  export type SignUpResponseResolvers = Pick<
    Types.SignUpResponseResolvers,
    DefinedFields['SignUpResponse'] | '__isTypeOf'
  >
  export type MutationResolvers = Pick<
    Types.MutationResolvers,
    DefinedFields['Mutation']
  >

  export interface Resolvers {
    SignUpBlock?: SignUpBlockResolvers
    SignUpResponse?: SignUpResponseResolvers
    Mutation?: MutationResolvers
  }

  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[]
    }
    SignUpBlock?: {
      '*'?: gm.Middleware[]
      id?: gm.Middleware[]
      parentBlockId?: gm.Middleware[]
      action?: gm.Middleware[]
      submitIcon?: gm.Middleware[]
      submitLabel?: gm.Middleware[]
    }
    SignUpResponse?: {
      '*'?: gm.Middleware[]
      id?: gm.Middleware[]
      userId?: gm.Middleware[]
      name?: gm.Middleware[]
      email?: gm.Middleware[]
      block?: gm.Middleware[]
    }
    Mutation?: {
      '*'?: gm.Middleware[]
      signUpResponseCreate?: gm.Middleware[]
    }
  }
}
