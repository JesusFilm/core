/* eslint-disable */
import * as Types from "../../../__generated__/types";
import * as gm from "graphql-modules";
export namespace UserModule {
  interface DefinedFields {
    User: 'id' | 'firebaseId' | 'firstName' | 'lastName' | 'email' | 'imageUrl' | 'UserJourney';
  };
  
  export type User = Pick<Types.User, DefinedFields['User']>;
  export type UserJourney = Types.UserJourney;
  
  export type UserResolvers = Pick<Types.UserResolvers, DefinedFields['User'] | '__isTypeOf'>;
  
  export interface Resolvers {
    User?: UserResolvers;
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
      UserJourney?: gm.Middleware[];
    };
  };
}