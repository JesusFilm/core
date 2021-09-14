/* eslint-disable */
import * as Types from "../../../__generated__/types";
import * as gm from "graphql-modules";
export namespace UserSessionModule {
  interface DefinedFields {
    Mutation: 'userSessionCreate';
  };
  
  export type Mutation = Pick<Types.Mutation, DefinedFields['Mutation']>;
  
  export type MutationResolvers = Pick<Types.MutationResolvers, DefinedFields['Mutation']>;
  
  export interface Resolvers {
    Mutation?: MutationResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    Mutation?: {
      '*'?: gm.Middleware[];
      userSessionCreate?: gm.Middleware[];
    };
  };
}