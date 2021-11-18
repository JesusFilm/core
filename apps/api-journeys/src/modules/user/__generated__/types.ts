/* eslint-disable */
import * as Types from "../../../__generated__/types";
import * as gm from "graphql-modules";
export namespace UserModule {
  interface DefinedFields {
    User: 'id' | 'firebaseId' | 'firstName' | 'lastName' | 'email' | 'imageUrl';
    Query: 'users' | 'user';
    Mutation: 'userCreate';
  };
  
  interface DefinedEnumValues {
    UserIdType: 'databaseId' | 'firebaseId';
  };
  
  interface DefinedInputFields {
    UserCreateInput: 'id' | 'firebaseId' | 'firstName' | 'lastName' | 'email' | 'imageUrl';
  };
  
  export type UserIdType = DefinedEnumValues['UserIdType'];
  export type UserCreateInput = Pick<Types.UserCreateInput, DefinedInputFields['UserCreateInput']>;
  export type User = Pick<Types.User, DefinedFields['User']>;
  export type Query = Pick<Types.Query, DefinedFields['Query']>;
  export type Mutation = Pick<Types.Mutation, DefinedFields['Mutation']>;
  
  export type UserResolvers = Pick<Types.UserResolvers, DefinedFields['User'] | '__isTypeOf'>;
  export type QueryResolvers = Pick<Types.QueryResolvers, DefinedFields['Query']>;
  export type MutationResolvers = Pick<Types.MutationResolvers, DefinedFields['Mutation']>;
  
  export interface Resolvers {
    User?: UserResolvers;
    Query?: QueryResolvers;
    Mutation?: MutationResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    User?: {
      '*'?: gm.Middleware[];
      id?: gm.Middleware[];
      firebaseId?: gm.Middleware[];
      firstName?: gm.Middleware[];
      lastName?: gm.Middleware[];
      email?: gm.Middleware[];
      imageUrl?: gm.Middleware[];
    };
    Query?: {
      '*'?: gm.Middleware[];
      users?: gm.Middleware[];
      user?: gm.Middleware[];
    };
    Mutation?: {
      '*'?: gm.Middleware[];
      userCreate?: gm.Middleware[];
    };
  };
}