/* eslint-disable */
import * as Types from '../../../__generated__/types'
import * as gm from 'graphql-modules'
export namespace VideoTriggerModule {
  interface DefinedFields {
    VideoTriggerBlock: 'id' | 'parentBlockId' | 'triggerStart' | 'action'
  }

  export type VideoTriggerBlock = Pick<
    Types.VideoTriggerBlock,
    DefinedFields['VideoTriggerBlock']
  >
  export type Action = Types.Action
  export type Block = Types.Block

  export type VideoTriggerBlockResolvers = Pick<
    Types.VideoTriggerBlockResolvers,
    DefinedFields['VideoTriggerBlock'] | '__isTypeOf'
  >

  export interface Resolvers {
    VideoTriggerBlock?: VideoTriggerBlockResolvers
  }

  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[]
    }
    VideoTriggerBlock?: {
      '*'?: gm.Middleware[]
      id?: gm.Middleware[]
      parentBlockId?: gm.Middleware[]
      triggerStart?: gm.Middleware[]
      action?: gm.Middleware[]
    }
  }
}
