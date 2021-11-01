/* eslint-disable */
import * as Types from "../../../__generated__/types";
import * as gm from "graphql-modules";
export namespace JourneyModule {
  interface DefinedFields {
    Journey: 'id' | 'published' | 'title' | 'locale' | 'themeMode' | 'themeName' | 'description';
    Query: 'journeys' | 'journey';
    Mutation: 'journeyCreate' | 'journeyUpdate' | 'journeyPublish';
  };
  
  interface DefinedEnumValues {
    ThemeMode: 'light' | 'dark';
    ThemeName: 'base';
    IdType: 'databaseId' | 'slug';
  };
  
  interface DefinedInputFields {
    JourneyCreateInput: 'id' | 'title' | 'locale' | 'themeMode' | 'themeName' | 'description';
    JourneyUpdateInput: 'id' | 'title' | 'locale' | 'themeMode' | 'themeName' | 'description' | 'primaryImageBlockId';
  };
  
  export type ThemeMode = DefinedEnumValues['ThemeMode'];
  export type ThemeName = DefinedEnumValues['ThemeName'];
  export type Journey = Pick<Types.Journey, DefinedFields['Journey']>;
  export type IdType = DefinedEnumValues['IdType'];
  export type Query = Pick<Types.Query, DefinedFields['Query']>;
  export type JourneyCreateInput = Pick<Types.JourneyCreateInput, DefinedInputFields['JourneyCreateInput']>;
  export type JourneyUpdateInput = Pick<Types.JourneyUpdateInput, DefinedInputFields['JourneyUpdateInput']>;
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
      themeMode?: gm.Middleware[];
      themeName?: gm.Middleware[];
      description?: gm.Middleware[];
    };
    Query?: {
      '*'?: gm.Middleware[];
      journeys?: gm.Middleware[];
      journey?: gm.Middleware[];
    };
    Mutation?: {
      '*'?: gm.Middleware[];
      journeyCreate?: gm.Middleware[];
      journeyUpdate?: gm.Middleware[];
      journeyPublish?: gm.Middleware[];
    };
  };
}