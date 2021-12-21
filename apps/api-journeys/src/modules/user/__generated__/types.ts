/* eslint-disable */
import * as Types from "../../../__generated__/types";
import * as gm from "graphql-modules";
export namespace UserModule {
  interface DefinedFields {
    User: 'id' | 'firstName' | 'lastName' | 'email' | 'imageUrl';
    Query: 'me' | 'users' | 'user';
    Mutation: 'userCreate';
    UserJourney: 'user';
  };
  
  interface DefinedInputFields {
    UserCreateInput: 'firstName' | 'lastName' | 'imageUrl';
  };
  
  export type UserCreateInput = Pick<Types.UserCreateInput, DefinedInputFields['UserCreateInput']>;
  export type User = Pick<Types.User, DefinedFields['User']>;
  export type UserJourney = Types.UserJourney;
  export type Query = Pick<Types.Query, DefinedFields['Query']>;
  export type Mutation = Pick<Types.Mutation, DefinedFields['Mutation']>;
  
  export type UserResolvers = Pick<Types.UserResolvers, DefinedFields['User'] | '__isTypeOf'>;
  export type QueryResolvers = Pick<Types.QueryResolvers, DefinedFields['Query']>;
  export type MutationResolvers = Pick<Types.MutationResolvers, DefinedFields['Mutation']>;
  export type UserJourneyResolvers = Pick<Types.UserJourneyResolvers, DefinedFields['UserJourney']>;
  
  export interface Resolvers {
    User?: UserResolvers;
    Query?: QueryResolvers;
    Mutation?: MutationResolvers;
    UserJourney?: UserJourneyResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    User?: {
      '*'?: gm.Middleware[];
      id?: gm.Middleware[];
      firstName?: gm.Middleware[];
      lastName?: gm.Middleware[];
      email?: gm.Middleware[];
      imageUrl?: gm.Middleware[];
    };
    UserJourney?: {
      '*'?: gm.Middleware[];
      user?: gm.Middleware[];
    };
    Query?: {
      '*'?: gm.Middleware[];
      me?: gm.Middleware[];
      users?: gm.Middleware[];
      user?: gm.Middleware[];
    };
    Mutation?: {
      '*'?: gm.Middleware[];
      userCreate?: gm.Middleware[];
    };
  };
}