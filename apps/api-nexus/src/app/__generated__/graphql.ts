
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export enum NexusStatus {
    deleted = "deleted",
    published = "published"
}

export class ChannelCreateInput {
    nexusId: string;
    name: string;
    platform: string;
}

export class ChannelUpdateInput {
    name?: Nullable<string>;
    nexusId?: Nullable<string>;
    platform?: Nullable<string>;
}

export class ChannelFilter {
    ids?: Nullable<string[]>;
    name?: Nullable<string>;
    nexusId?: Nullable<string>;
    limit?: Nullable<number>;
}

export class NexusCreateInput {
    name: string;
    description?: Nullable<string>;
}

export class NexusUpdateInput {
    name?: Nullable<string>;
    description?: Nullable<string>;
}

export class NexusFilter {
    ids?: Nullable<string[]>;
    name?: Nullable<string>;
    description?: Nullable<string>;
    createdAt?: Nullable<DateTime>;
    limit?: Nullable<number>;
    orderByRecent?: Nullable<boolean>;
}

export class Channel {
    __typename?: 'Channel';
    id: string;
    nexusId?: Nullable<string>;
    name: string;
    platform?: Nullable<string>;
}

export abstract class IQuery {
    __typename?: 'IQuery';

    abstract channels(where?: Nullable<ChannelFilter>): Nullable<Channel[]> | Promise<Nullable<Channel[]>>;

    abstract channel(id: string): Channel | Promise<Channel>;

    abstract nexuses(where?: Nullable<NexusFilter>): Nexus[] | Promise<Nexus[]>;

    abstract nexus(id: string): Nexus | Promise<Nexus>;
}

export class Nexus {
    __typename?: 'Nexus';
    id: string;
    name: string;
    description?: Nullable<string>;
    createdAt: DateTime;
    deletedAt?: Nullable<DateTime>;
    status: NexusStatus;
}

export class Translation {
    __typename?: 'Translation';
    value: string;
    language: Language;
    primary: boolean;
}

export abstract class IMutation {
    abstract channelCreate(input: ChannelCreateInput): Channel | Promise<Channel>;

    abstract channelUpdate(id: string, input: ChannelUpdateInput): Channel | Promise<Channel>;

    abstract channelDelete(id: string): Channel | Promise<Channel>;

    abstract nexusCreate(input: NexusCreateInput): Nexus | Promise<Nexus>;

    abstract nexusUpdate(id: string, input: NexusUpdateInput): Nexus | Promise<Nexus>;

    abstract nexusDelete(id: string): Nexus | Promise<Nexus>;
}

export class Language {
    id: string;
}

export type DateTime = String;
type Nullable<T> = T | null;
