import * as Types from '../../../../__generated__/globalTypes';

export type JourneyDuplicateMutationVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
  teamId: Types.Scalars['ID']['input'];
}>;


export type JourneyDuplicateMutation = { journeyDuplicate: { __typename: 'Journey', id: string } };

export type DuplicatedJourneyFragment = { __typename: 'Journey', id: string };
