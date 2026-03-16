/* eslint-disable */
import type { Prisma, ChatButton, Event, Visitor, Host, JourneyVisitor, Team, Integration, GoogleSheetsSync, UserTeam, UserTeamInvite, UserJourney, JourneyTag, Journey, UserRole, JourneyProfile, UserInvite, Block, Action, JourneysEmailPreference, JourneyNotification, CustomDomain, JourneyCollection, JourneyCollectionJourneys, QrCode, JourneyEventsExportLog, JourneyTheme, JourneyCustomizationField } from "./client/client.js";
import type { PothosPrismaDatamodel } from "@pothos/plugin-prisma";
export default interface PrismaTypes {
    ChatButton: {
        Name: "ChatButton";
        Shape: ChatButton;
        Include: Prisma.ChatButtonInclude;
        Select: Prisma.ChatButtonSelect;
        OrderBy: Prisma.ChatButtonOrderByWithRelationInput;
        WhereUnique: Prisma.ChatButtonWhereUniqueInput;
        Where: Prisma.ChatButtonWhereInput;
        Create: {};
        Update: {};
        RelationName: "journey";
        ListRelations: never;
        Relations: {
            journey: {
                Shape: Journey;
                Name: "Journey";
                Nullable: false;
            };
        };
    };
    Event: {
        Name: "Event";
        Shape: Event;
        Include: Prisma.EventInclude;
        Select: Prisma.EventSelect;
        OrderBy: Prisma.EventOrderByWithRelationInput;
        WhereUnique: Prisma.EventWhereUniqueInput;
        Where: Prisma.EventWhereInput;
        Create: {};
        Update: {};
        RelationName: "visitor" | "journeyVisitor" | "journey";
        ListRelations: never;
        Relations: {
            visitor: {
                Shape: Visitor;
                Name: "Visitor";
                Nullable: false;
            };
            journeyVisitor: {
                Shape: JourneyVisitor | null;
                Name: "JourneyVisitor";
                Nullable: true;
            };
            journey: {
                Shape: Journey | null;
                Name: "Journey";
                Nullable: true;
            };
        };
    };
    Visitor: {
        Name: "Visitor";
        Shape: Visitor;
        Include: Prisma.VisitorInclude;
        Select: Prisma.VisitorSelect;
        OrderBy: Prisma.VisitorOrderByWithRelationInput;
        WhereUnique: Prisma.VisitorWhereUniqueInput;
        Where: Prisma.VisitorWhereInput;
        Create: {};
        Update: {};
        RelationName: "events" | "journeyVisitors" | "team";
        ListRelations: "events" | "journeyVisitors";
        Relations: {
            events: {
                Shape: Event[];
                Name: "Event";
                Nullable: false;
            };
            journeyVisitors: {
                Shape: JourneyVisitor[];
                Name: "JourneyVisitor";
                Nullable: false;
            };
            team: {
                Shape: Team;
                Name: "Team";
                Nullable: false;
            };
        };
    };
    Host: {
        Name: "Host";
        Shape: Host;
        Include: Prisma.HostInclude;
        Select: Prisma.HostSelect;
        OrderBy: Prisma.HostOrderByWithRelationInput;
        WhereUnique: Prisma.HostWhereUniqueInput;
        Where: Prisma.HostWhereInput;
        Create: {};
        Update: {};
        RelationName: "team" | "journeys";
        ListRelations: "journeys";
        Relations: {
            team: {
                Shape: Team;
                Name: "Team";
                Nullable: false;
            };
            journeys: {
                Shape: Journey[];
                Name: "Journey";
                Nullable: false;
            };
        };
    };
    JourneyVisitor: {
        Name: "JourneyVisitor";
        Shape: JourneyVisitor;
        Include: Prisma.JourneyVisitorInclude;
        Select: Prisma.JourneyVisitorSelect;
        OrderBy: Prisma.JourneyVisitorOrderByWithRelationInput;
        WhereUnique: Prisma.JourneyVisitorWhereUniqueInput;
        Where: Prisma.JourneyVisitorWhereInput;
        Create: {};
        Update: {};
        RelationName: "journey" | "visitor" | "events";
        ListRelations: "events";
        Relations: {
            journey: {
                Shape: Journey;
                Name: "Journey";
                Nullable: false;
            };
            visitor: {
                Shape: Visitor;
                Name: "Visitor";
                Nullable: false;
            };
            events: {
                Shape: Event[];
                Name: "Event";
                Nullable: false;
            };
        };
    };
    Team: {
        Name: "Team";
        Shape: Team;
        Include: Prisma.TeamInclude;
        Select: Prisma.TeamSelect;
        OrderBy: Prisma.TeamOrderByWithRelationInput;
        WhereUnique: Prisma.TeamWhereUniqueInput;
        Where: Prisma.TeamWhereInput;
        Create: {};
        Update: {};
        RelationName: "visitors" | "userTeams" | "journeys" | "hosts" | "UserTeamInvites" | "journeyCollections" | "customDomains" | "integrations" | "qrCodes" | "googleSheetsSync";
        ListRelations: "visitors" | "userTeams" | "journeys" | "hosts" | "UserTeamInvites" | "journeyCollections" | "customDomains" | "integrations" | "qrCodes" | "googleSheetsSync";
        Relations: {
            visitors: {
                Shape: Visitor[];
                Name: "Visitor";
                Nullable: false;
            };
            userTeams: {
                Shape: UserTeam[];
                Name: "UserTeam";
                Nullable: false;
            };
            journeys: {
                Shape: Journey[];
                Name: "Journey";
                Nullable: false;
            };
            hosts: {
                Shape: Host[];
                Name: "Host";
                Nullable: false;
            };
            UserTeamInvites: {
                Shape: UserTeamInvite[];
                Name: "UserTeamInvite";
                Nullable: false;
            };
            journeyCollections: {
                Shape: JourneyCollection[];
                Name: "JourneyCollection";
                Nullable: false;
            };
            customDomains: {
                Shape: CustomDomain[];
                Name: "CustomDomain";
                Nullable: false;
            };
            integrations: {
                Shape: Integration[];
                Name: "Integration";
                Nullable: false;
            };
            qrCodes: {
                Shape: QrCode[];
                Name: "QrCode";
                Nullable: false;
            };
            googleSheetsSync: {
                Shape: GoogleSheetsSync[];
                Name: "GoogleSheetsSync";
                Nullable: false;
            };
        };
    };
    Integration: {
        Name: "Integration";
        Shape: Integration;
        Include: Prisma.IntegrationInclude;
        Select: Prisma.IntegrationSelect;
        OrderBy: Prisma.IntegrationOrderByWithRelationInput;
        WhereUnique: Prisma.IntegrationWhereUniqueInput;
        Where: Prisma.IntegrationWhereInput;
        Create: {};
        Update: {};
        RelationName: "googleSheetsSyncs" | "team";
        ListRelations: "googleSheetsSyncs";
        Relations: {
            googleSheetsSyncs: {
                Shape: GoogleSheetsSync[];
                Name: "GoogleSheetsSync";
                Nullable: false;
            };
            team: {
                Shape: Team;
                Name: "Team";
                Nullable: false;
            };
        };
    };
    GoogleSheetsSync: {
        Name: "GoogleSheetsSync";
        Shape: GoogleSheetsSync;
        Include: Prisma.GoogleSheetsSyncInclude;
        Select: Prisma.GoogleSheetsSyncSelect;
        OrderBy: Prisma.GoogleSheetsSyncOrderByWithRelationInput;
        WhereUnique: Prisma.GoogleSheetsSyncWhereUniqueInput;
        Where: Prisma.GoogleSheetsSyncWhereInput;
        Create: {};
        Update: {};
        RelationName: "integration" | "journey" | "team";
        ListRelations: never;
        Relations: {
            integration: {
                Shape: Integration | null;
                Name: "Integration";
                Nullable: true;
            };
            journey: {
                Shape: Journey;
                Name: "Journey";
                Nullable: false;
            };
            team: {
                Shape: Team;
                Name: "Team";
                Nullable: false;
            };
        };
    };
    UserTeam: {
        Name: "UserTeam";
        Shape: UserTeam;
        Include: Prisma.UserTeamInclude;
        Select: Prisma.UserTeamSelect;
        OrderBy: Prisma.UserTeamOrderByWithRelationInput;
        WhereUnique: Prisma.UserTeamWhereUniqueInput;
        Where: Prisma.UserTeamWhereInput;
        Create: {};
        Update: {};
        RelationName: "team" | "journeyNotifications";
        ListRelations: "journeyNotifications";
        Relations: {
            team: {
                Shape: Team;
                Name: "Team";
                Nullable: false;
            };
            journeyNotifications: {
                Shape: JourneyNotification[];
                Name: "JourneyNotification";
                Nullable: false;
            };
        };
    };
    UserTeamInvite: {
        Name: "UserTeamInvite";
        Shape: UserTeamInvite;
        Include: Prisma.UserTeamInviteInclude;
        Select: Prisma.UserTeamInviteSelect;
        OrderBy: Prisma.UserTeamInviteOrderByWithRelationInput;
        WhereUnique: Prisma.UserTeamInviteWhereUniqueInput;
        Where: Prisma.UserTeamInviteWhereInput;
        Create: {};
        Update: {};
        RelationName: "team";
        ListRelations: never;
        Relations: {
            team: {
                Shape: Team;
                Name: "Team";
                Nullable: false;
            };
        };
    };
    UserJourney: {
        Name: "UserJourney";
        Shape: UserJourney;
        Include: Prisma.UserJourneyInclude;
        Select: Prisma.UserJourneySelect;
        OrderBy: Prisma.UserJourneyOrderByWithRelationInput;
        WhereUnique: Prisma.UserJourneyWhereUniqueInput;
        Where: Prisma.UserJourneyWhereInput;
        Create: {};
        Update: {};
        RelationName: "journey" | "journeyNotification";
        ListRelations: never;
        Relations: {
            journey: {
                Shape: Journey;
                Name: "Journey";
                Nullable: false;
            };
            journeyNotification: {
                Shape: JourneyNotification | null;
                Name: "JourneyNotification";
                Nullable: true;
            };
        };
    };
    JourneyTag: {
        Name: "JourneyTag";
        Shape: JourneyTag;
        Include: Prisma.JourneyTagInclude;
        Select: Prisma.JourneyTagSelect;
        OrderBy: Prisma.JourneyTagOrderByWithRelationInput;
        WhereUnique: Prisma.JourneyTagWhereUniqueInput;
        Where: Prisma.JourneyTagWhereInput;
        Create: {};
        Update: {};
        RelationName: "journey";
        ListRelations: never;
        Relations: {
            journey: {
                Shape: Journey;
                Name: "Journey";
                Nullable: false;
            };
        };
    };
    Journey: {
        Name: "Journey";
        Shape: Journey;
        Include: Prisma.JourneyInclude;
        Select: Prisma.JourneySelect;
        OrderBy: Prisma.JourneyOrderByWithRelationInput;
        WhereUnique: Prisma.JourneyWhereUniqueInput;
        Where: Prisma.JourneyWhereInput;
        Create: {};
        Update: {};
        RelationName: "userJourneys" | "team" | "userInvites" | "blocks" | "chatButtons" | "host" | "journeyTags" | "actions" | "primaryImageBlock" | "creatorImageBlock" | "journeyVisitors" | "journeyCollectionJourneys" | "journeyNotifications" | "logoImageBlock" | "menuStepBlock" | "qrCode" | "Event" | "journeyEventsExportLogs" | "journeyTheme" | "journeyCustomizationFields" | "googleSheetsSync";
        ListRelations: "userJourneys" | "userInvites" | "blocks" | "chatButtons" | "journeyTags" | "actions" | "journeyVisitors" | "journeyCollectionJourneys" | "journeyNotifications" | "qrCode" | "Event" | "journeyEventsExportLogs" | "journeyCustomizationFields" | "googleSheetsSync";
        Relations: {
            userJourneys: {
                Shape: UserJourney[];
                Name: "UserJourney";
                Nullable: false;
            };
            team: {
                Shape: Team;
                Name: "Team";
                Nullable: false;
            };
            userInvites: {
                Shape: UserInvite[];
                Name: "UserInvite";
                Nullable: false;
            };
            blocks: {
                Shape: Block[];
                Name: "Block";
                Nullable: false;
            };
            chatButtons: {
                Shape: ChatButton[];
                Name: "ChatButton";
                Nullable: false;
            };
            host: {
                Shape: Host | null;
                Name: "Host";
                Nullable: true;
            };
            journeyTags: {
                Shape: JourneyTag[];
                Name: "JourneyTag";
                Nullable: false;
            };
            actions: {
                Shape: Action[];
                Name: "Action";
                Nullable: false;
            };
            primaryImageBlock: {
                Shape: Block | null;
                Name: "Block";
                Nullable: true;
            };
            creatorImageBlock: {
                Shape: Block | null;
                Name: "Block";
                Nullable: true;
            };
            journeyVisitors: {
                Shape: JourneyVisitor[];
                Name: "JourneyVisitor";
                Nullable: false;
            };
            journeyCollectionJourneys: {
                Shape: JourneyCollectionJourneys[];
                Name: "JourneyCollectionJourneys";
                Nullable: false;
            };
            journeyNotifications: {
                Shape: JourneyNotification[];
                Name: "JourneyNotification";
                Nullable: false;
            };
            logoImageBlock: {
                Shape: Block | null;
                Name: "Block";
                Nullable: true;
            };
            menuStepBlock: {
                Shape: Block | null;
                Name: "Block";
                Nullable: true;
            };
            qrCode: {
                Shape: QrCode[];
                Name: "QrCode";
                Nullable: false;
            };
            Event: {
                Shape: Event[];
                Name: "Event";
                Nullable: false;
            };
            journeyEventsExportLogs: {
                Shape: JourneyEventsExportLog[];
                Name: "JourneyEventsExportLog";
                Nullable: false;
            };
            journeyTheme: {
                Shape: JourneyTheme | null;
                Name: "JourneyTheme";
                Nullable: true;
            };
            journeyCustomizationFields: {
                Shape: JourneyCustomizationField[];
                Name: "JourneyCustomizationField";
                Nullable: false;
            };
            googleSheetsSync: {
                Shape: GoogleSheetsSync[];
                Name: "GoogleSheetsSync";
                Nullable: false;
            };
        };
    };
    UserRole: {
        Name: "UserRole";
        Shape: UserRole;
        Include: never;
        Select: Prisma.UserRoleSelect;
        OrderBy: Prisma.UserRoleOrderByWithRelationInput;
        WhereUnique: Prisma.UserRoleWhereUniqueInput;
        Where: Prisma.UserRoleWhereInput;
        Create: {};
        Update: {};
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
    JourneyProfile: {
        Name: "JourneyProfile";
        Shape: JourneyProfile;
        Include: never;
        Select: Prisma.JourneyProfileSelect;
        OrderBy: Prisma.JourneyProfileOrderByWithRelationInput;
        WhereUnique: Prisma.JourneyProfileWhereUniqueInput;
        Where: Prisma.JourneyProfileWhereInput;
        Create: {};
        Update: {};
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
    UserInvite: {
        Name: "UserInvite";
        Shape: UserInvite;
        Include: Prisma.UserInviteInclude;
        Select: Prisma.UserInviteSelect;
        OrderBy: Prisma.UserInviteOrderByWithRelationInput;
        WhereUnique: Prisma.UserInviteWhereUniqueInput;
        Where: Prisma.UserInviteWhereInput;
        Create: {};
        Update: {};
        RelationName: "journey";
        ListRelations: never;
        Relations: {
            journey: {
                Shape: Journey;
                Name: "Journey";
                Nullable: false;
            };
        };
    };
    Block: {
        Name: "Block";
        Shape: Block;
        Include: Prisma.BlockInclude;
        Select: Prisma.BlockSelect;
        OrderBy: Prisma.BlockOrderByWithRelationInput;
        WhereUnique: Prisma.BlockWhereUniqueInput;
        Where: Prisma.BlockWhereInput;
        Create: {};
        Update: {};
        RelationName: "action" | "journey" | "posterBlock" | "posterBlockParent" | "coverBlock" | "coverBlockParent" | "pollOptionImageBlock" | "pollOptionImageBlockParent" | "primaryImageBlockParent" | "creatorImageBlockParent" | "nextBlock" | "nextBlockParents" | "parentBlock" | "childBlocks" | "targetActions" | "menuStepBlockParent" | "logoImageBlockParent";
        ListRelations: "nextBlockParents" | "childBlocks" | "targetActions";
        Relations: {
            action: {
                Shape: Action | null;
                Name: "Action";
                Nullable: true;
            };
            journey: {
                Shape: Journey;
                Name: "Journey";
                Nullable: false;
            };
            posterBlock: {
                Shape: Block | null;
                Name: "Block";
                Nullable: true;
            };
            posterBlockParent: {
                Shape: Block | null;
                Name: "Block";
                Nullable: true;
            };
            coverBlock: {
                Shape: Block | null;
                Name: "Block";
                Nullable: true;
            };
            coverBlockParent: {
                Shape: Block | null;
                Name: "Block";
                Nullable: true;
            };
            pollOptionImageBlock: {
                Shape: Block | null;
                Name: "Block";
                Nullable: true;
            };
            pollOptionImageBlockParent: {
                Shape: Block | null;
                Name: "Block";
                Nullable: true;
            };
            primaryImageBlockParent: {
                Shape: Journey | null;
                Name: "Journey";
                Nullable: true;
            };
            creatorImageBlockParent: {
                Shape: Journey | null;
                Name: "Journey";
                Nullable: true;
            };
            nextBlock: {
                Shape: Block | null;
                Name: "Block";
                Nullable: true;
            };
            nextBlockParents: {
                Shape: Block[];
                Name: "Block";
                Nullable: false;
            };
            parentBlock: {
                Shape: Block | null;
                Name: "Block";
                Nullable: true;
            };
            childBlocks: {
                Shape: Block[];
                Name: "Block";
                Nullable: false;
            };
            targetActions: {
                Shape: Action[];
                Name: "Action";
                Nullable: false;
            };
            menuStepBlockParent: {
                Shape: Journey | null;
                Name: "Journey";
                Nullable: true;
            };
            logoImageBlockParent: {
                Shape: Journey | null;
                Name: "Journey";
                Nullable: true;
            };
        };
    };
    Action: {
        Name: "Action";
        Shape: Action;
        Include: Prisma.ActionInclude;
        Select: Prisma.ActionSelect;
        OrderBy: Prisma.ActionOrderByWithRelationInput;
        WhereUnique: Prisma.ActionWhereUniqueInput;
        Where: Prisma.ActionWhereInput;
        Create: {};
        Update: {};
        RelationName: "parentBlock" | "journey" | "block";
        ListRelations: never;
        Relations: {
            parentBlock: {
                Shape: Block;
                Name: "Block";
                Nullable: false;
            };
            journey: {
                Shape: Journey | null;
                Name: "Journey";
                Nullable: true;
            };
            block: {
                Shape: Block | null;
                Name: "Block";
                Nullable: true;
            };
        };
    };
    JourneysEmailPreference: {
        Name: "JourneysEmailPreference";
        Shape: JourneysEmailPreference;
        Include: never;
        Select: Prisma.JourneysEmailPreferenceSelect;
        OrderBy: Prisma.JourneysEmailPreferenceOrderByWithRelationInput;
        WhereUnique: Prisma.JourneysEmailPreferenceWhereUniqueInput;
        Where: Prisma.JourneysEmailPreferenceWhereInput;
        Create: {};
        Update: {};
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
    JourneyNotification: {
        Name: "JourneyNotification";
        Shape: JourneyNotification;
        Include: Prisma.JourneyNotificationInclude;
        Select: Prisma.JourneyNotificationSelect;
        OrderBy: Prisma.JourneyNotificationOrderByWithRelationInput;
        WhereUnique: Prisma.JourneyNotificationWhereUniqueInput;
        Where: Prisma.JourneyNotificationWhereInput;
        Create: {};
        Update: {};
        RelationName: "journey" | "userTeam" | "userJourney";
        ListRelations: never;
        Relations: {
            journey: {
                Shape: Journey;
                Name: "Journey";
                Nullable: false;
            };
            userTeam: {
                Shape: UserTeam | null;
                Name: "UserTeam";
                Nullable: true;
            };
            userJourney: {
                Shape: UserJourney | null;
                Name: "UserJourney";
                Nullable: true;
            };
        };
    };
    CustomDomain: {
        Name: "CustomDomain";
        Shape: CustomDomain;
        Include: Prisma.CustomDomainInclude;
        Select: Prisma.CustomDomainSelect;
        OrderBy: Prisma.CustomDomainOrderByWithRelationInput;
        WhereUnique: Prisma.CustomDomainWhereUniqueInput;
        Where: Prisma.CustomDomainWhereInput;
        Create: {};
        Update: {};
        RelationName: "journeyCollection" | "team";
        ListRelations: never;
        Relations: {
            journeyCollection: {
                Shape: JourneyCollection | null;
                Name: "JourneyCollection";
                Nullable: true;
            };
            team: {
                Shape: Team;
                Name: "Team";
                Nullable: false;
            };
        };
    };
    JourneyCollection: {
        Name: "JourneyCollection";
        Shape: JourneyCollection;
        Include: Prisma.JourneyCollectionInclude;
        Select: Prisma.JourneyCollectionSelect;
        OrderBy: Prisma.JourneyCollectionOrderByWithRelationInput;
        WhereUnique: Prisma.JourneyCollectionWhereUniqueInput;
        Where: Prisma.JourneyCollectionWhereInput;
        Create: {};
        Update: {};
        RelationName: "customDomains" | "team" | "journeyCollectionJourneys";
        ListRelations: "customDomains" | "journeyCollectionJourneys";
        Relations: {
            customDomains: {
                Shape: CustomDomain[];
                Name: "CustomDomain";
                Nullable: false;
            };
            team: {
                Shape: Team;
                Name: "Team";
                Nullable: false;
            };
            journeyCollectionJourneys: {
                Shape: JourneyCollectionJourneys[];
                Name: "JourneyCollectionJourneys";
                Nullable: false;
            };
        };
    };
    JourneyCollectionJourneys: {
        Name: "JourneyCollectionJourneys";
        Shape: JourneyCollectionJourneys;
        Include: Prisma.JourneyCollectionJourneysInclude;
        Select: Prisma.JourneyCollectionJourneysSelect;
        OrderBy: Prisma.JourneyCollectionJourneysOrderByWithRelationInput;
        WhereUnique: Prisma.JourneyCollectionJourneysWhereUniqueInput;
        Where: Prisma.JourneyCollectionJourneysWhereInput;
        Create: {};
        Update: {};
        RelationName: "journeyCollection" | "journey";
        ListRelations: never;
        Relations: {
            journeyCollection: {
                Shape: JourneyCollection;
                Name: "JourneyCollection";
                Nullable: false;
            };
            journey: {
                Shape: Journey;
                Name: "Journey";
                Nullable: false;
            };
        };
    };
    QrCode: {
        Name: "QrCode";
        Shape: QrCode;
        Include: Prisma.QrCodeInclude;
        Select: Prisma.QrCodeSelect;
        OrderBy: Prisma.QrCodeOrderByWithRelationInput;
        WhereUnique: Prisma.QrCodeWhereUniqueInput;
        Where: Prisma.QrCodeWhereInput;
        Create: {};
        Update: {};
        RelationName: "team" | "journey";
        ListRelations: never;
        Relations: {
            team: {
                Shape: Team;
                Name: "Team";
                Nullable: false;
            };
            journey: {
                Shape: Journey;
                Name: "Journey";
                Nullable: false;
            };
        };
    };
    JourneyEventsExportLog: {
        Name: "JourneyEventsExportLog";
        Shape: JourneyEventsExportLog;
        Include: Prisma.JourneyEventsExportLogInclude;
        Select: Prisma.JourneyEventsExportLogSelect;
        OrderBy: Prisma.JourneyEventsExportLogOrderByWithRelationInput;
        WhereUnique: Prisma.JourneyEventsExportLogWhereUniqueInput;
        Where: Prisma.JourneyEventsExportLogWhereInput;
        Create: {};
        Update: {};
        RelationName: "journey";
        ListRelations: never;
        Relations: {
            journey: {
                Shape: Journey;
                Name: "Journey";
                Nullable: false;
            };
        };
    };
    JourneyTheme: {
        Name: "JourneyTheme";
        Shape: JourneyTheme;
        Include: Prisma.JourneyThemeInclude;
        Select: Prisma.JourneyThemeSelect;
        OrderBy: Prisma.JourneyThemeOrderByWithRelationInput;
        WhereUnique: Prisma.JourneyThemeWhereUniqueInput;
        Where: Prisma.JourneyThemeWhereInput;
        Create: {};
        Update: {};
        RelationName: "journey";
        ListRelations: never;
        Relations: {
            journey: {
                Shape: Journey;
                Name: "Journey";
                Nullable: false;
            };
        };
    };
    JourneyCustomizationField: {
        Name: "JourneyCustomizationField";
        Shape: JourneyCustomizationField;
        Include: Prisma.JourneyCustomizationFieldInclude;
        Select: Prisma.JourneyCustomizationFieldSelect;
        OrderBy: Prisma.JourneyCustomizationFieldOrderByWithRelationInput;
        WhereUnique: Prisma.JourneyCustomizationFieldWhereUniqueInput;
        Where: Prisma.JourneyCustomizationFieldWhereInput;
        Create: {};
        Update: {};
        RelationName: "journey";
        ListRelations: never;
        Relations: {
            journey: {
                Shape: Journey;
                Name: "Journey";
                Nullable: false;
            };
        };
    };
}
export function getDatamodel(): PothosPrismaDatamodel { return JSON.parse("{\"datamodel\":{\"models\":{\"ChatButton\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"journeyId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"link\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"MessagePlatform\",\"kind\":\"enum\",\"name\":\"platform\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Journey\",\"kind\":\"object\",\"name\":\"journey\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ChatButtonToJourney\",\"relationFromFields\":[\"journeyId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"Event\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"typename\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"journeyId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"blockId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"stepId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"label\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"value\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"visitorId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"ButtonAction\",\"kind\":\"enum\",\"name\":\"action\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"actionValue\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"MessagePlatform\",\"kind\":\"enum\",\"name\":\"messagePlatform\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"languageId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"radioOptionBlockId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"email\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"nextStepId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"previousStepId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Float\",\"kind\":\"scalar\",\"name\":\"position\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"VideoBlockSource\",\"kind\":\"enum\",\"name\":\"source\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"progress\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"userId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"journeyVisitorJourneyId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"journeyVisitorVisitorId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"Visitor\",\"kind\":\"object\",\"name\":\"visitor\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"EventToVisitor\",\"relationFromFields\":[\"visitorId\"],\"isUpdatedAt\":false},{\"type\":\"JourneyVisitor\",\"kind\":\"object\",\"name\":\"journeyVisitor\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"EventToJourneyVisitor\",\"relationFromFields\":[\"journeyId\",\"visitorId\"],\"isUpdatedAt\":false},{\"type\":\"Journey\",\"kind\":\"object\",\"name\":\"journey\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"EventToJourney\",\"relationFromFields\":[\"journeyId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"Visitor\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"countryCode\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"duration\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"email\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Event\",\"kind\":\"object\",\"name\":\"events\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"EventToVisitor\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"lastChatStartedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"MessagePlatform\",\"kind\":\"enum\",\"name\":\"lastChatPlatform\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"lastStepViewedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"lastLinkAction\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"lastTextResponse\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"lastRadioQuestion\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"lastRadioOptionSubmission\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"MessagePlatform\",\"kind\":\"enum\",\"name\":\"messagePlatform\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"messagePlatformId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"notes\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"phone\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"VisitorStatus\",\"kind\":\"enum\",\"name\":\"status\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"referrer\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"teamId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"userId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Json\",\"kind\":\"scalar\",\"name\":\"userAgent\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"JourneyVisitor\",\"kind\":\"object\",\"name\":\"journeyVisitors\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"JourneyVisitorToVisitor\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Team\",\"kind\":\"object\",\"name\":\"team\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TeamToVisitor\",\"relationFromFields\":[\"teamId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"teamId\",\"userId\"]}]},\"Host\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"teamId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Team\",\"kind\":\"object\",\"name\":\"team\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"HostToTeam\",\"relationFromFields\":[\"teamId\"],\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"title\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"location\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"src1\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"src2\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"Journey\",\"kind\":\"object\",\"name\":\"journeys\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"HostToJourney\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"JourneyVisitor\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"journeyId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"visitorId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"duration\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"lastChatStartedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"MessagePlatform\",\"kind\":\"enum\",\"name\":\"lastChatPlatform\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"lastStepViewedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"lastLinkAction\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"lastTextResponse\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"lastRadioQuestion\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"lastRadioOptionSubmission\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"lastMultiselectSubmission\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"activityCount\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"Journey\",\"kind\":\"object\",\"name\":\"journey\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"JourneyToJourneyVisitor\",\"relationFromFields\":[\"journeyId\"],\"isUpdatedAt\":false},{\"type\":\"Visitor\",\"kind\":\"object\",\"name\":\"visitor\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"JourneyVisitorToVisitor\",\"relationFromFields\":[\"visitorId\"],\"isUpdatedAt\":false},{\"type\":\"Event\",\"kind\":\"object\",\"name\":\"events\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"EventToJourneyVisitor\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"journeyId\",\"visitorId\"]}]},\"Team\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"title\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"publicTitle\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"plausibleToken\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Visitor\",\"kind\":\"object\",\"name\":\"visitors\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TeamToVisitor\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"UserTeam\",\"kind\":\"object\",\"name\":\"userTeams\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TeamToUserTeam\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Journey\",\"kind\":\"object\",\"name\":\"journeys\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"JourneyToTeam\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Host\",\"kind\":\"object\",\"name\":\"hosts\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"HostToTeam\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"UserTeamInvite\",\"kind\":\"object\",\"name\":\"UserTeamInvites\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TeamToUserTeamInvite\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"JourneyCollection\",\"kind\":\"object\",\"name\":\"journeyCollections\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"JourneyCollectionToTeam\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"CustomDomain\",\"kind\":\"object\",\"name\":\"customDomains\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"CustomDomainToTeam\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Integration\",\"kind\":\"object\",\"name\":\"integrations\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"IntegrationToTeam\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"QrCode\",\"kind\":\"object\",\"name\":\"qrCodes\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"QrCodeToTeam\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"GoogleSheetsSync\",\"kind\":\"object\",\"name\":\"googleSheetsSync\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"GoogleSheetsSyncToTeam\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"Integration\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"teamId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"userId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"IntegrationType\",\"kind\":\"enum\",\"name\":\"type\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"accessId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"accessSecretPart\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"accessSecretCipherText\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"accessSecretIv\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"accessSecretTag\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"accountEmail\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"oauthStale\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"GoogleSheetsSync\",\"kind\":\"object\",\"name\":\"googleSheetsSyncs\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"GoogleSheetsSyncToIntegration\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Team\",\"kind\":\"object\",\"name\":\"team\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"IntegrationToTeam\",\"relationFromFields\":[\"teamId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"userId\",\"teamId\",\"type\",\"accountEmail\"]}]},\"GoogleSheetsSync\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"teamId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"journeyId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"integrationId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"spreadsheetId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"sheetName\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"folderId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"email\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"timezone\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"deletedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"Integration\",\"kind\":\"object\",\"name\":\"integration\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"GoogleSheetsSyncToIntegration\",\"relationFromFields\":[\"integrationId\"],\"isUpdatedAt\":false},{\"type\":\"Journey\",\"kind\":\"object\",\"name\":\"journey\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"GoogleSheetsSyncToJourney\",\"relationFromFields\":[\"journeyId\"],\"isUpdatedAt\":false},{\"type\":\"Team\",\"kind\":\"object\",\"name\":\"team\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"GoogleSheetsSyncToTeam\",\"relationFromFields\":[\"teamId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"UserTeam\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"teamId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Team\",\"kind\":\"object\",\"name\":\"team\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TeamToUserTeam\",\"relationFromFields\":[\"teamId\"],\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"userId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"UserTeamRole\",\"kind\":\"enum\",\"name\":\"role\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"JourneyNotification\",\"kind\":\"object\",\"name\":\"journeyNotifications\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"JourneyNotificationToUserTeam\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"teamId\",\"userId\"]}]},\"UserTeamInvite\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"teamId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Team\",\"kind\":\"object\",\"name\":\"team\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TeamToUserTeamInvite\",\"relationFromFields\":[\"teamId\"],\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"email\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"senderId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"receipientId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"acceptedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"removedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"teamId\",\"email\"]}]},\"UserJourney\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"userId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"journeyId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"Journey\",\"kind\":\"object\",\"name\":\"journey\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"JourneyToUserJourney\",\"relationFromFields\":[\"journeyId\"],\"isUpdatedAt\":false},{\"type\":\"UserJourneyRole\",\"kind\":\"enum\",\"name\":\"role\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"openedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"JourneyNotification\",\"kind\":\"object\",\"name\":\"journeyNotification\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"JourneyNotificationToUserJourney\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"journeyId\",\"userId\"]}]},\"JourneyTag\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"tagId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"journeyId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Journey\",\"kind\":\"object\",\"name\":\"journey\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"JourneyToJourneyTag\",\"relationFromFields\":[\"journeyId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"journeyId\",\"tagId\"]}]},\"Journey\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"title\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"languageId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"description\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"slug\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"archivedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"deletedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"publishedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"trashedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"featuredAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"JourneyStatus\",\"kind\":\"enum\",\"name\":\"status\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"seoTitle\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"seoDescription\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"primaryImageBlockId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"creatorImageBlockId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"creatorDescription\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"template\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"templateSite\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"customizable\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"teamId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"hostId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"ThemeMode\",\"kind\":\"enum\",\"name\":\"themeMode\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"ThemeName\",\"kind\":\"enum\",\"name\":\"themeName\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"strategySlug\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"plausibleToken\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"UserJourney\",\"kind\":\"object\",\"name\":\"userJourneys\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"JourneyToUserJourney\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Team\",\"kind\":\"object\",\"name\":\"team\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"JourneyToTeam\",\"relationFromFields\":[\"teamId\"],\"isUpdatedAt\":false},{\"type\":\"UserInvite\",\"kind\":\"object\",\"name\":\"userInvites\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"JourneyToUserInvite\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Block\",\"kind\":\"object\",\"name\":\"blocks\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BlockToJourney\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"ChatButton\",\"kind\":\"object\",\"name\":\"chatButtons\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ChatButtonToJourney\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Host\",\"kind\":\"object\",\"name\":\"host\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"HostToJourney\",\"relationFromFields\":[\"hostId\"],\"isUpdatedAt\":false},{\"type\":\"JourneyTag\",\"kind\":\"object\",\"name\":\"journeyTags\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"JourneyToJourneyTag\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Action\",\"kind\":\"object\",\"name\":\"actions\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ActionToJourney\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Block\",\"kind\":\"object\",\"name\":\"primaryImageBlock\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"PrimaryImageBlock\",\"relationFromFields\":[\"primaryImageBlockId\"],\"isUpdatedAt\":false},{\"type\":\"Block\",\"kind\":\"object\",\"name\":\"creatorImageBlock\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"CreatorImageBlock\",\"relationFromFields\":[\"creatorImageBlockId\"],\"isUpdatedAt\":false},{\"type\":\"JourneyVisitor\",\"kind\":\"object\",\"name\":\"journeyVisitors\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"JourneyToJourneyVisitor\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"JourneyCollectionJourneys\",\"kind\":\"object\",\"name\":\"journeyCollectionJourneys\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"JourneyToJourneyCollectionJourneys\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"JourneyNotification\",\"kind\":\"object\",\"name\":\"journeyNotifications\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"JourneyToJourneyNotification\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"website\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"showShareButton\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"showLikeButton\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"showDislikeButton\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"displayTitle\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"showHosts\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"showChatButtons\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"showReactionButtons\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"showLogo\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"showMenu\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"showDisplayTitle\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"showAssistant\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"logoImageBlockId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Block\",\"kind\":\"object\",\"name\":\"logoImageBlock\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"LogoImageBlock\",\"relationFromFields\":[\"logoImageBlockId\"],\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"menuStepBlockId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Block\",\"kind\":\"object\",\"name\":\"menuStepBlock\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"MenuStepBlock\",\"relationFromFields\":[\"menuStepBlockId\"],\"isUpdatedAt\":false},{\"type\":\"JourneyMenuButtonIcon\",\"kind\":\"enum\",\"name\":\"menuButtonIcon\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"socialNodeX\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"socialNodeY\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"QrCode\",\"kind\":\"object\",\"name\":\"qrCode\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"JourneyToQrCode\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Event\",\"kind\":\"object\",\"name\":\"Event\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"EventToJourney\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"JourneyEventsExportLog\",\"kind\":\"object\",\"name\":\"journeyEventsExportLogs\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"JourneyToJourneyEventsExportLog\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"fromTemplateId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"JourneyTheme\",\"kind\":\"object\",\"name\":\"journeyTheme\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"JourneyToJourneyTheme\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"journeyCustomizationDescription\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"JourneyCustomizationField\",\"kind\":\"object\",\"name\":\"journeyCustomizationFields\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"JourneyToJourneyCustomizationField\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"GoogleSheetsSync\",\"kind\":\"object\",\"name\":\"googleSheetsSync\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"GoogleSheetsSyncToJourney\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"UserRole\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"userId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Role\",\"kind\":\"enum\",\"name\":\"roles\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"JourneyProfile\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"userId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"acceptedTermsAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"lastActiveTeamId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"journeyFlowBackButtonClicked\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"plausibleJourneyFlowViewed\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"plausibleDashboardViewed\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"UserInvite\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"journeyId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"senderId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"email\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"acceptedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"removedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"Journey\",\"kind\":\"object\",\"name\":\"journey\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"JourneyToUserInvite\",\"relationFromFields\":[\"journeyId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"journeyId\",\"email\"]}]},\"Block\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"typename\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"journeyId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"parentBlockId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"parentOrder\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"label\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"placeholder\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"required\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"variant\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"color\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"size\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"startIconId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"endIconId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Action\",\"kind\":\"object\",\"name\":\"action\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ActionToBlock\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"EventLabel\",\"kind\":\"enum\",\"name\":\"eventLabel\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"EventLabel\",\"kind\":\"enum\",\"name\":\"endEventLabel\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"backgroundColor\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"backdropBlur\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"coverBlockId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"fullscreen\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"themeMode\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"themeName\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"spacing\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"gap\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"direction\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"justifyContent\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"alignItems\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"xl\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"lg\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"sm\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"src\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"width\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"height\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"alt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"blurhash\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"submitIconId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"submitLabel\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"submitEnabled\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"nextBlockId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"locked\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"hint\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"hideLabel\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"minRows\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"content\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"align\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"startAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"endAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"muted\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"autoplay\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"posterBlockId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"pollOptionImageBlockId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"fullsize\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"videoId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"videoVariantLanguageId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"VideoBlockSource\",\"kind\":\"enum\",\"name\":\"source\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"title\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"description\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"image\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"duration\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"VideoBlockObjectFit\",\"kind\":\"enum\",\"name\":\"objectFit\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"subtitleLanguageId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"showGeneratedSubtitles\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"triggerStart\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"x\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"y\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"routeId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"integrationId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"TextResponseType\",\"kind\":\"enum\",\"name\":\"type\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"deletedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"focalTop\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"focalLeft\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"gridView\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Journey\",\"kind\":\"object\",\"name\":\"journey\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BlockToJourney\",\"relationFromFields\":[\"journeyId\"],\"isUpdatedAt\":false},{\"type\":\"Block\",\"kind\":\"object\",\"name\":\"posterBlock\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"PosterBlock\",\"relationFromFields\":[\"posterBlockId\"],\"isUpdatedAt\":false},{\"type\":\"Block\",\"kind\":\"object\",\"name\":\"posterBlockParent\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"PosterBlock\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Block\",\"kind\":\"object\",\"name\":\"coverBlock\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"CoverBlock\",\"relationFromFields\":[\"coverBlockId\"],\"isUpdatedAt\":false},{\"type\":\"Block\",\"kind\":\"object\",\"name\":\"coverBlockParent\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"CoverBlock\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Block\",\"kind\":\"object\",\"name\":\"pollOptionImageBlock\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"PollOptionImageBlock\",\"relationFromFields\":[\"pollOptionImageBlockId\"],\"isUpdatedAt\":false},{\"type\":\"Block\",\"kind\":\"object\",\"name\":\"pollOptionImageBlockParent\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"PollOptionImageBlock\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Journey\",\"kind\":\"object\",\"name\":\"primaryImageBlockParent\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"PrimaryImageBlock\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Journey\",\"kind\":\"object\",\"name\":\"creatorImageBlockParent\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"CreatorImageBlock\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Block\",\"kind\":\"object\",\"name\":\"nextBlock\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"NextBlock\",\"relationFromFields\":[\"nextBlockId\"],\"isUpdatedAt\":false},{\"type\":\"Block\",\"kind\":\"object\",\"name\":\"nextBlockParents\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"NextBlock\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Block\",\"kind\":\"object\",\"name\":\"parentBlock\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ParentBlock\",\"relationFromFields\":[\"parentBlockId\"],\"isUpdatedAt\":false},{\"type\":\"Block\",\"kind\":\"object\",\"name\":\"childBlocks\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ParentBlock\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Action\",\"kind\":\"object\",\"name\":\"targetActions\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"Block\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"scale\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Journey\",\"kind\":\"object\",\"name\":\"menuStepBlockParent\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"MenuStepBlock\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Journey\",\"kind\":\"object\",\"name\":\"logoImageBlockParent\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"LogoImageBlock\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"slug\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"min\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"max\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Json\",\"kind\":\"scalar\",\"name\":\"settings\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"exportOrder\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"customizable\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"notes\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"slug\",\"journeyId\"]}]},\"Action\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"parentBlockId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"gtmEventName\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"blockId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"journeyId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"url\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"target\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"email\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"phone\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"countryCode\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"contactAction\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"customizable\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"parentStepId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"Block\",\"kind\":\"object\",\"name\":\"parentBlock\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ActionToBlock\",\"relationFromFields\":[\"parentBlockId\"],\"isUpdatedAt\":false},{\"type\":\"Journey\",\"kind\":\"object\",\"name\":\"journey\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ActionToJourney\",\"relationFromFields\":[\"journeyId\"],\"isUpdatedAt\":false},{\"type\":\"Block\",\"kind\":\"object\",\"name\":\"block\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"Block\",\"relationFromFields\":[\"blockId\"],\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"chatUrl\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"JourneysEmailPreference\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"email\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"unsubscribeAll\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"accountNotifications\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"JourneyNotification\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"userId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"journeyId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"userTeamId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"userJourneyId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"visitorInteractionEmail\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Journey\",\"kind\":\"object\",\"name\":\"journey\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"JourneyToJourneyNotification\",\"relationFromFields\":[\"journeyId\"],\"isUpdatedAt\":false},{\"type\":\"UserTeam\",\"kind\":\"object\",\"name\":\"userTeam\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"JourneyNotificationToUserTeam\",\"relationFromFields\":[\"userTeamId\"],\"isUpdatedAt\":false},{\"type\":\"UserJourney\",\"kind\":\"object\",\"name\":\"userJourney\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"JourneyNotificationToUserJourney\",\"relationFromFields\":[\"userJourneyId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"userId\",\"journeyId\"]},{\"name\":null,\"fields\":[\"userId\",\"journeyId\",\"userTeamId\"]}]},\"CustomDomain\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"teamId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"apexName\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"journeyCollectionId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"routeAllTeamJourneys\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"JourneyCollection\",\"kind\":\"object\",\"name\":\"journeyCollection\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"CustomDomainToJourneyCollection\",\"relationFromFields\":[\"journeyCollectionId\"],\"isUpdatedAt\":false},{\"type\":\"Team\",\"kind\":\"object\",\"name\":\"team\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"CustomDomainToTeam\",\"relationFromFields\":[\"teamId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"JourneyCollection\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"teamId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"title\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"CustomDomain\",\"kind\":\"object\",\"name\":\"customDomains\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"CustomDomainToJourneyCollection\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Team\",\"kind\":\"object\",\"name\":\"team\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"JourneyCollectionToTeam\",\"relationFromFields\":[\"teamId\"],\"isUpdatedAt\":false},{\"type\":\"JourneyCollectionJourneys\",\"kind\":\"object\",\"name\":\"journeyCollectionJourneys\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"JourneyCollectionToJourneyCollectionJourneys\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"JourneyCollectionJourneys\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"journeyCollectionId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"journeyId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"order\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"JourneyCollection\",\"kind\":\"object\",\"name\":\"journeyCollection\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"JourneyCollectionToJourneyCollectionJourneys\",\"relationFromFields\":[\"journeyCollectionId\"],\"isUpdatedAt\":false},{\"type\":\"Journey\",\"kind\":\"object\",\"name\":\"journey\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"JourneyToJourneyCollectionJourneys\",\"relationFromFields\":[\"journeyId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"journeyCollectionId\",\"journeyId\"]},{\"name\":null,\"fields\":[\"journeyCollectionId\",\"order\"]}]},\"QrCode\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"teamId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"journeyId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"toJourneyId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"toBlockId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"shortLinkId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"color\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"backgroundColor\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Team\",\"kind\":\"object\",\"name\":\"team\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"QrCodeToTeam\",\"relationFromFields\":[\"teamId\"],\"isUpdatedAt\":false},{\"type\":\"Journey\",\"kind\":\"object\",\"name\":\"journey\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"JourneyToQrCode\",\"relationFromFields\":[\"journeyId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"JourneyEventsExportLog\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"userId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"journeyId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"eventsFilter\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"dateRangeStart\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"dateRangeEnd\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Journey\",\"kind\":\"object\",\"name\":\"journey\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"JourneyToJourneyEventsExportLog\",\"relationFromFields\":[\"journeyId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"JourneyTheme\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"journeyId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Journey\",\"kind\":\"object\",\"name\":\"journey\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"JourneyToJourneyTheme\",\"relationFromFields\":[\"journeyId\"],\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"userId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"headerFont\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"bodyFont\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"labelFont\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"JourneyCustomizationField\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"journeyId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"key\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"value\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"defaultValue\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Journey\",\"kind\":\"object\",\"name\":\"journey\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"JourneyToJourneyCustomizationField\",\"relationFromFields\":[\"journeyId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"journeyId\",\"key\",\"value\"]}]}}}}"); }
