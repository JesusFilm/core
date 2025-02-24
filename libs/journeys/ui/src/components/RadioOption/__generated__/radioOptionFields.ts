import * as Types from '../../../../__generated__/globalTypes';

export type RadioOptionFieldsFragment = { __typename: 'RadioOptionBlock', id: string, parentBlockId: string | null, parentOrder: number | null, label: string, action: { __typename: 'EmailAction', email: string, parentBlockId: string, gtmEventName: string | null } | { __typename: 'LinkAction', url: string, parentBlockId: string, gtmEventName: string | null } | { __typename: 'NavigateToBlockAction', blockId: string, parentBlockId: string, gtmEventName: string | null } | null };
