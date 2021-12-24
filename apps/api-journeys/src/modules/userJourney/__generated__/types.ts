/* eslint-disable */
import * as Types from "../../../__generated__/types";
import * as gm from "graphql-modules";
export namespace UserJourneyModule {
  interface DefinedFields {
    UserJourney: 'id' | 'userId' | 'journeyId' | 'role';
    Mutation: 'userJourneyApprove' | 'userJourneyPromote' | 'userJourneyRemove' | 'userJourneyRequest';
    Journey: 'userJourneys';
  };
  
  interface DefinedEnumValues {
    UserJourneyRole: 'inviteRequested' | 'editor' | 'owner';
  };
  
  export type UserJourneyRole = DefinedEnumValues['UserJourneyRole'];
  export type Journey = Types.Journey;
  export type UserJourney = Pick<Types.UserJourney, DefinedFields['UserJourney']>;
  export type Mutation = Pick<Types.Mutation, DefinedFields['Mutation']>;
  
  export type UserJourneyResolvers = Pick<Types.UserJourneyResolvers, DefinedFields['UserJourney'] | '__isTypeOf'>;
  export type MutationResolvers = Pick<Types.MutationResolvers, DefinedFields['Mutation']>;
  export type JourneyResolvers = Pick<Types.JourneyResolvers, DefinedFields['Journey']>;
  
  export interface Resolvers {
    UserJourney?: UserJourneyResolvers;
    Mutation?: MutationResolvers;
    Journey?: JourneyResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    Journey?: {
      '*'?: gm.Middleware[];
      userJourneys?: gm.Middleware[];
    };
    UserJourney?: {
      '*'?: gm.Middleware[];
      id?: gm.Middleware[];
      userId?: gm.Middleware[];
      journeyId?: gm.Middleware[];
      role?: gm.Middleware[];
    };
    Mutation?: {
      '*'?: gm.Middleware[];
      userJourneyApprove?: gm.Middleware[];
      userJourneyPromote?: gm.Middleware[];
      userJourneyRemove?: gm.Middleware[];
      userJourneyRequest?: gm.Middleware[];
    };
  };
}