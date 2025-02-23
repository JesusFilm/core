import * as Types from '../../../../__generated__/types';

export type ActionFields_EmailAction_Fragment = { __typename?: 'EmailAction', email: string, parentBlockId: string, gtmEventName?: string | null };

export type ActionFields_LinkAction_Fragment = { __typename?: 'LinkAction', url: string, parentBlockId: string, gtmEventName?: string | null };

export type ActionFields_NavigateToBlockAction_Fragment = { __typename?: 'NavigateToBlockAction', blockId: string, parentBlockId: string, gtmEventName?: string | null };

export type ActionFieldsFragment = ActionFields_EmailAction_Fragment | ActionFields_LinkAction_Fragment | ActionFields_NavigateToBlockAction_Fragment;
