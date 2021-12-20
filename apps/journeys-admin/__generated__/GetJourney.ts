/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyStatus, UserJourneyRole } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetJourney
// ====================================================

export interface GetJourney_journey_primaryImageBlock {
  __typename: "ImageBlock";
  src: string;
}

export interface GetJourney_journey_usersJourneys_user {
  __typename: "User";
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  imageUrl: string | null;
}

export interface GetJourney_journey_usersJourneys {
  __typename: "UserJourney";
  userId: string;
  journeyId: string;
  role: UserJourneyRole;
  user: GetJourney_journey_usersJourneys_user | null;
}

export interface GetJourney_journey {
  __typename: "Journey";
  id: string;
  title: string;
  description: string | null;
  status: JourneyStatus;
  createdAt: any;
  publishedAt: any | null;
  slug: string;
  primaryImageBlock: GetJourney_journey_primaryImageBlock | null;
  usersJourneys: GetJourney_journey_usersJourneys[] | null;
}

export interface GetJourney {
  journey: GetJourney_journey | null;
}

export interface GetJourneyVariables {
  id: string;
}
