/* eslint-disable */
import * as Types from '../../../__generated__/types'
import * as gm from 'graphql-modules'
export namespace RadioQuestionModule {
  interface DefinedFields {
    RadioOptionBlock: 'id' | 'parentBlockId' | 'label' | 'action'
    RadioQuestionBlock: 'id' | 'parentBlockId' | 'label' | 'description'
    RadioQuestionResponse: 'id' | 'userId' | 'radioOptionBlockId' | 'block'
    Mutation: 'radioQuestionResponseCreate'
  }

  interface DefinedInputFields {
    RadioQuestionResponseCreateInput: 'id' | 'blockId' | 'radioOptionBlockId'
  }

  export type RadioQuestionResponseCreateInput = Pick<
    Types.RadioQuestionResponseCreateInput,
    DefinedInputFields['RadioQuestionResponseCreateInput']
  >
  export type RadioOptionBlock = Pick<
    Types.RadioOptionBlock,
    DefinedFields['RadioOptionBlock']
  >
  export type Action = Types.Action
  export type Block = Types.Block
  export type RadioQuestionBlock = Pick<
    Types.RadioQuestionBlock,
    DefinedFields['RadioQuestionBlock']
  >
  export type RadioQuestionResponse = Pick<
    Types.RadioQuestionResponse,
    DefinedFields['RadioQuestionResponse']
  >
  export type Response = Types.Response
  export type Mutation = Pick<Types.Mutation, DefinedFields['Mutation']>

  export type RadioOptionBlockResolvers = Pick<
    Types.RadioOptionBlockResolvers,
    DefinedFields['RadioOptionBlock'] | '__isTypeOf'
  >
  export type RadioQuestionBlockResolvers = Pick<
    Types.RadioQuestionBlockResolvers,
    DefinedFields['RadioQuestionBlock'] | '__isTypeOf'
  >
  export type RadioQuestionResponseResolvers = Pick<
    Types.RadioQuestionResponseResolvers,
    DefinedFields['RadioQuestionResponse'] | '__isTypeOf'
  >
  export type MutationResolvers = Pick<
    Types.MutationResolvers,
    DefinedFields['Mutation']
  >

  export interface Resolvers {
    RadioOptionBlock?: RadioOptionBlockResolvers
    RadioQuestionBlock?: RadioQuestionBlockResolvers
    RadioQuestionResponse?: RadioQuestionResponseResolvers
    Mutation?: MutationResolvers
  }

  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[]
    }
    RadioOptionBlock?: {
      '*'?: gm.Middleware[]
      id?: gm.Middleware[]
      parentBlockId?: gm.Middleware[]
      label?: gm.Middleware[]
      action?: gm.Middleware[]
    }
    RadioQuestionBlock?: {
      '*'?: gm.Middleware[]
      id?: gm.Middleware[]
      parentBlockId?: gm.Middleware[]
      label?: gm.Middleware[]
      description?: gm.Middleware[]
    }
    RadioQuestionResponse?: {
      '*'?: gm.Middleware[]
      id?: gm.Middleware[]
      userId?: gm.Middleware[]
      radioOptionBlockId?: gm.Middleware[]
      block?: gm.Middleware[]
    }
    Mutation?: {
      '*'?: gm.Middleware[]
      radioQuestionResponseCreate?: gm.Middleware[]
    }
  }
}
