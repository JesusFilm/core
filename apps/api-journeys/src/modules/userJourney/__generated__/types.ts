/* eslint-disable */
import * as Types from "../../../__generated__/types";
import * as gm from "graphql-modules";
export namespace UserJourneyModule {
  interface DefinedFields {
    UserJourney: 'userId' | 'journeyId' | 'role' | 'User' | 'Journey';
    Mutation: 'userJourneyCreate' | 'userJourneyUpdate';
  };
  
  interface DefinedEnumValues {
    UserJourneyRole: 'inviteRequested' | 'editor' | 'owner';
  };
  
  interface DefinedInputFields {
    UserJourneyCreateInput: 'userId' | 'journeyId' | 'role';
    UserJourneyUpdateInput: 'userId' | 'journeyId' | 'role';
  };
  
  export type UserJourneyRole = DefinedEnumValues['UserJourneyRole'];
  export type UserJourneyCreateInput = Pick<Types.UserJourneyCreateInput, DefinedInputFields['UserJourneyCreateInput']>;
  export type UserJourneyUpdateInput = Pick<Types.UserJourneyUpdateInput, DefinedInputFields['UserJourneyUpdateInput']>;
  export type UserJourney = Pick<Types.UserJourney, DefinedFields['UserJourney']>;
  export type User = Types.User;
  export type Journey = Types.Journey;
  export type Mutation = Pick<Types.Mutation, DefinedFields['Mutation']>;
  
  export type UserJourneyResolvers = Pick<Types.UserJourneyResolvers, DefinedFields['UserJourney'] | '__isTypeOf'>;
  export type MutationResolvers = Pick<Types.MutationResolvers, DefinedFields['Mutation']>;
  
  export interface Resolvers {
    UserJourney?: UserJourneyResolvers;
    Mutation?: MutationResolvers;
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
      User?: gm.Middleware[];
      Journey?: gm.Middleware[];
    };
    Mutation?: {
      '*'?: gm.Middleware[];
      userJourneyCreate?: gm.Middleware[];
      userJourneyUpdate?: gm.Middleware[];
    };
  };
}