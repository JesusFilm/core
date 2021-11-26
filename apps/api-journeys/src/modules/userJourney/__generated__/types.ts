/* eslint-disable */
import * as Types from "../../../__generated__/types";
import * as gm from "graphql-modules";
export namespace UserJourneyModule {
  interface DefinedFields {
    UserJourney: 'userId' | 'journeyId' | 'role';
    Mutation: 'userJourneyCreate' | 'userJourneyUpdate';
    Journey: 'usersJourneys';
    User: 'usersJourneys';
  };
  
  interface DefinedEnumValues {
    UserJourneyRole: 'inviteRequested' | 'editor' | 'owner';
    UserJourneyRoleForUpdates: 'inviteRequested' | 'editor';
  };
  
  interface DefinedInputFields {
    UserJourneyCreateInput: 'userId' | 'journeyId' | 'role';
    UserJourneyUpdateInput: 'userId' | 'journeyId' | 'role';
  };
  
  export type UserJourneyRole = DefinedEnumValues['UserJourneyRole'];
  export type UserJourneyRoleForUpdates = DefinedEnumValues['UserJourneyRoleForUpdates'];
  export type UserJourneyCreateInput = Pick<Types.UserJourneyCreateInput, DefinedInputFields['UserJourneyCreateInput']>;
  export type UserJourneyUpdateInput = Pick<Types.UserJourneyUpdateInput, DefinedInputFields['UserJourneyUpdateInput']>;
  export type Journey = Types.Journey;
  export type UserJourney = Pick<Types.UserJourney, DefinedFields['UserJourney']>;
  export type User = Types.User;
  export type Mutation = Pick<Types.Mutation, DefinedFields['Mutation']>;
  
  export type UserJourneyResolvers = Pick<Types.UserJourneyResolvers, DefinedFields['UserJourney'] | '__isTypeOf'>;
  export type MutationResolvers = Pick<Types.MutationResolvers, DefinedFields['Mutation']>;
  export type JourneyResolvers = Pick<Types.JourneyResolvers, DefinedFields['Journey']>;
  export type UserResolvers = Pick<Types.UserResolvers, DefinedFields['User']>;
  
  export interface Resolvers {
    UserJourney?: UserJourneyResolvers;
    Mutation?: MutationResolvers;
    Journey?: JourneyResolvers;
    User?: UserResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    Journey?: {
      '*'?: gm.Middleware[];
      usersJourneys?: gm.Middleware[];
    };
    User?: {
      '*'?: gm.Middleware[];
      usersJourneys?: gm.Middleware[];
    };
    UserJourney?: {
      '*'?: gm.Middleware[];
      userId?: gm.Middleware[];
      journeyId?: gm.Middleware[];
      role?: gm.Middleware[];
    };
    Mutation?: {
      '*'?: gm.Middleware[];
      userJourneyCreate?: gm.Middleware[];
      userJourneyUpdate?: gm.Middleware[];
    };
  };
}