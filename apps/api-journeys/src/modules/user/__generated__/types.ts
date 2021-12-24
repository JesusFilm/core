/* eslint-disable */
import * as Types from "../../../__generated__/types";
import * as gm from "graphql-modules";
export namespace UserModule {
  interface DefinedFields {
    User: 'id' | 'firstName' | 'lastName' | 'email' | 'imageUrl';
    Query: 'me';
    UserJourney: 'user';
  };
  
  export type User = Pick<Types.User, DefinedFields['User']>;
  export type UserJourney = Types.UserJourney;
  export type Query = Pick<Types.Query, DefinedFields['Query']>;
  
  export type UserResolvers = Pick<Types.UserResolvers, DefinedFields['User'] | '__isTypeOf'>;
  export type QueryResolvers = Pick<Types.QueryResolvers, DefinedFields['Query']>;
  export type UserJourneyResolvers = Pick<Types.UserJourneyResolvers, DefinedFields['UserJourney']>;
  
  export interface Resolvers {
    User?: UserResolvers;
    Query?: QueryResolvers;
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
    };
  };
}