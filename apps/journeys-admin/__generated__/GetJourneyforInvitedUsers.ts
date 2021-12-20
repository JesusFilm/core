/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UserJourneyRole } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetJourneyforInvitedUsers
// ====================================================

export interface GetJourneyforInvitedUsers_journey_usersJourneys_user {
  __typename: "User";
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  imageUrl: string | null;
}

export interface GetJourneyforInvitedUsers_journey_usersJourneys {
  __typename: "UserJourney";
  userId: string;
  journeyId: string;
  role: UserJourneyRole;
  user: GetJourneyforInvitedUsers_journey_usersJourneys_user | null;
}

export interface GetJourneyforInvitedUsers_journey {
  __typename: "Journey";
  slug: string;
  usersJourneys: GetJourneyforInvitedUsers_journey_usersJourneys[] | null;
}

export interface GetJourneyforInvitedUsers {
  journey: GetJourneyforInvitedUsers_journey | null;
}

export interface GetJourneyforInvitedUsersVariables {
  journeyId: string;
}
