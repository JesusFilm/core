/* eslint-disable */
import * as Types from "../../../__generated__/types";
import * as gm from "graphql-modules";
export namespace UserJourneyModule {
  interface DefinedFields {
    UserJourney: 'userId' | 'journeyId' | 'role';
  };
  
  export type UserJourney = Pick<Types.UserJourney, DefinedFields['UserJourney']>;
  
  export type UserJourneyResolvers = Pick<Types.UserJourneyResolvers, DefinedFields['UserJourney'] | '__isTypeOf'>;
  
  export interface Resolvers {
    UserJourney?: UserJourneyResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    UserJourney?: {
      '*'?: gm.Middleware[];
      userId?: gm.Middleware[];
      journeyId?: gm.Middleware[];
      role?: gm.Middleware[];
    };
  };
}