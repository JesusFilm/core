/* eslint-disable */
import * as Types from "../../../__generated__/types";
import * as gm from "graphql-modules";
export namespace JourneyModule {
  interface DefinedFields {
    Journey: 'id' | 'title' | 'locale' | 'themeMode' | 'themeName' | 'description' | 'slug' | 'publishedAt' | 'createdAt' | 'status';
    Query: 'allJourneys' | 'journeys' | 'journey';
    Mutation: 'journeyCreate' | 'journeyUpdate' | 'journeyPublish';
    NavigateToJourneyAction: 'journey';
  };
  
  interface DefinedEnumValues {
    ThemeMode: 'light' | 'dark';
    ThemeName: 'base';
    JourneyStatus: 'draft' | 'published';
    IdType: 'databaseId' | 'slug';
  };
  
  interface DefinedInputFields {
    JourneyCreateInput: 'id' | 'title' | 'locale' | 'themeMode' | 'themeName' | 'description' | 'slug';
    JourneyUpdateInput: 'id' | 'title' | 'locale' | 'themeMode' | 'themeName' | 'description' | 'primaryImageBlockId' | 'slug';
  };
  
  export type ThemeMode = DefinedEnumValues['ThemeMode'];
  export type ThemeName = DefinedEnumValues['ThemeName'];
  export type JourneyStatus = DefinedEnumValues['JourneyStatus'];
  export type Journey = Pick<Types.Journey, DefinedFields['Journey']>;
  export type IdType = DefinedEnumValues['IdType'];
  export type Query = Pick<Types.Query, DefinedFields['Query']>;
  export type JourneyCreateInput = Pick<Types.JourneyCreateInput, DefinedInputFields['JourneyCreateInput']>;
  export type JourneyUpdateInput = Pick<Types.JourneyUpdateInput, DefinedInputFields['JourneyUpdateInput']>;
  export type Mutation = Pick<Types.Mutation, DefinedFields['Mutation']>;
  export type NavigateToJourneyAction = Types.NavigateToJourneyAction;
  
  export type Scalars = Pick<Types.Scalars, 'Date'>;
  export type DateScalarConfig = Types.DateScalarConfig;
  
  export type JourneyResolvers = Pick<Types.JourneyResolvers, DefinedFields['Journey'] | '__isTypeOf'>;
  export type QueryResolvers = Pick<Types.QueryResolvers, DefinedFields['Query']>;
  export type MutationResolvers = Pick<Types.MutationResolvers, DefinedFields['Mutation']>;
  export type NavigateToJourneyActionResolvers = Pick<Types.NavigateToJourneyActionResolvers, DefinedFields['NavigateToJourneyAction']>;
  
  export interface Resolvers {
    Journey?: JourneyResolvers;
    Query?: QueryResolvers;
    Mutation?: MutationResolvers;
    NavigateToJourneyAction?: NavigateToJourneyActionResolvers;
    Date?: Types.Resolvers['Date'];
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    Journey?: {
      '*'?: gm.Middleware[];
      id?: gm.Middleware[];
      title?: gm.Middleware[];
      locale?: gm.Middleware[];
      themeMode?: gm.Middleware[];
      themeName?: gm.Middleware[];
      description?: gm.Middleware[];
      slug?: gm.Middleware[];
      publishedAt?: gm.Middleware[];
      createdAt?: gm.Middleware[];
      status?: gm.Middleware[];
    };
    Query?: {
      '*'?: gm.Middleware[];
      allJourneys?: gm.Middleware[];
      journeys?: gm.Middleware[];
      journey?: gm.Middleware[];
    };
    Mutation?: {
      '*'?: gm.Middleware[];
      journeyCreate?: gm.Middleware[];
      journeyUpdate?: gm.Middleware[];
      journeyPublish?: gm.Middleware[];
    };
    NavigateToJourneyAction?: {
      '*'?: gm.Middleware[];
      journey?: gm.Middleware[];
    };
  };
}