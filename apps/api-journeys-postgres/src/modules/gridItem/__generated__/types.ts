/* eslint-disable */
import * as Types from '../../../__generated__/types'
import * as gm from 'graphql-modules'
export namespace GridItemModule {
  interface DefinedFields {
    GridItemBlock: 'id' | 'parentBlockId' | 'xl' | 'lg' | 'sm'
  }

  export type GridItemBlock = Pick<
    Types.GridItemBlock,
    DefinedFields['GridItemBlock']
  >
  export type Block = Types.Block

  export type GridItemBlockResolvers = Pick<
    Types.GridItemBlockResolvers,
    DefinedFields['GridItemBlock'] | '__isTypeOf'
  >

  export interface Resolvers {
    GridItemBlock?: GridItemBlockResolvers
  }

  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[]
    }
    GridItemBlock?: {
      '*'?: gm.Middleware[]
      id?: gm.Middleware[]
      parentBlockId?: gm.Middleware[]
      xl?: gm.Middleware[]
      lg?: gm.Middleware[]
      sm?: gm.Middleware[]
    }
  }
}
