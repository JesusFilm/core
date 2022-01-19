/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UserJourneyRole } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetJourneyForRequest
// ====================================================

export interface GetJourneyForRequest_journey_primaryImageBlock {
  __typename: "ImageBlock";
  src: string | null;
}

export interface GetJourneyForRequest_journey_userJourneys_user {
  __typename: "User";
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  imageUrl: string | null;
}

export interface GetJourneyForRequest_journey_userJourneys {
  __typename: "UserJourney";
  userId: string;
  journeyId: string;
  role: UserJourneyRole;
  user: GetJourneyForRequest_journey_userJourneys_user | null;
}

export interface GetJourneyForRequest_journey {
  __typename: "Journey";
  id: string;
  title: string;
  description: string | null;
  createdAt: any;
  primaryImageBlock: GetJourneyForRequest_journey_primaryImageBlock | null;
  userJourneys: GetJourneyForRequest_journey_userJourneys[] | null;
}

export interface GetJourneyForRequest {
  journey: GetJourneyForRequest_journey | null;
}

export interface GetJourneyForRequestVariables {
  id: string;
}
