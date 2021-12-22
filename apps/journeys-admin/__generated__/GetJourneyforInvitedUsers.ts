/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UserJourneyRole } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetJourneyforInvitedUsers
// ====================================================

export interface GetJourneyforInvitedUsers_journey_userJourneys_user {
  __typename: "User";
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  imageUrl: string | null;
}

export interface GetJourneyforInvitedUsers_journey_userJourneys {
  __typename: "UserJourney";
  id: string;
  role: UserJourneyRole;
  userId: string;
  journeyId: string;
  user: GetJourneyforInvitedUsers_journey_userJourneys_user | null;
}

export interface GetJourneyforInvitedUsers_journey {
  __typename: "Journey";
  id: string;
  userJourneys: GetJourneyforInvitedUsers_journey_userJourneys[] | null;
}

export interface GetJourneyforInvitedUsers {
  journey: GetJourneyforInvitedUsers_journey | null;
}

export interface GetJourneyforInvitedUsersVariables {
  journeyId: string;
}
