/* eslint-disable */
import * as Types from "../../../__generated__/types";
import * as gm from "graphql-modules";
export namespace JourneyModule {
  interface DefinedFields {
    Journey: 'id' | 'published' | 'title' | 'locale' | 'theme';
    Query: 'journeys' | 'journey';
    Mutation: 'journeyCreate' | 'journeyPublish';
  };
  
  interface DefinedEnumValues {
    ThemeName: 'default';
  };
  
  export type Journey = Pick<Types.Journey, DefinedFields['Journey']>;
  export type ThemeName = DefinedEnumValues['ThemeName'];
  export type Query = Pick<Types.Query, DefinedFields['Query']>;
  export type Mutation = Pick<Types.Mutation, DefinedFields['Mutation']>;
  
  export type JourneyResolvers = Pick<Types.JourneyResolvers, DefinedFields['Journey'] | '__isTypeOf'>;
  export type QueryResolvers = Pick<Types.QueryResolvers, DefinedFields['Query']>;
  export type MutationResolvers = Pick<Types.MutationResolvers, DefinedFields['Mutation']>;
  
  export interface Resolvers {
    Journey?: JourneyResolvers;
    Query?: QueryResolvers;
    Mutation?: MutationResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    Journey?: {
      '*'?: gm.Middleware[];
      id?: gm.Middleware[];
      published?: gm.Middleware[];
      title?: gm.Middleware[];
      locale?: gm.Middleware[];
      theme?: gm.Middleware[];
    };
    Query?: {
      '*'?: gm.Middleware[];
      journeys?: gm.Middleware[];
      journey?: gm.Middleware[];
    };
    Mutation?: {
      '*'?: gm.Middleware[];
      journeyCreate?: gm.Middleware[];
      journeyPublish?: gm.Middleware[];
    };
  };
}