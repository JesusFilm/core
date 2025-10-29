/* eslint-disable */
import type { Prisma, Team, TeamMember, BillingSubscription, Agent, AgentTool, Widget, Website, ApiKey, Usage } from ".prisma/api-lumina-client/index.js";
export default interface PrismaTypes {
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
        RelationName: "members" | "agents" | "billingSubscription" | "usage";
        ListRelations: "members" | "agents" | "usage";
        Relations: {
            members: {
                Shape: TeamMember[];
                Name: "TeamMember";
                Nullable: false;
            };
            agents: {
                Shape: Agent[];
                Name: "Agent";
                Nullable: false;
            };
            billingSubscription: {
                Shape: BillingSubscription | null;
                Name: "BillingSubscription";
                Nullable: true;
            };
            usage: {
                Shape: Usage[];
                Name: "Usage";
                Nullable: false;
            };
        };
    };
    TeamMember: {
        Name: "TeamMember";
        Shape: TeamMember;
        Include: Prisma.TeamMemberInclude;
        Select: Prisma.TeamMemberSelect;
        OrderBy: Prisma.TeamMemberOrderByWithRelationInput;
        WhereUnique: Prisma.TeamMemberWhereUniqueInput;
        Where: Prisma.TeamMemberWhereInput;
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
    BillingSubscription: {
        Name: "BillingSubscription";
        Shape: BillingSubscription;
        Include: Prisma.BillingSubscriptionInclude;
        Select: Prisma.BillingSubscriptionSelect;
        OrderBy: Prisma.BillingSubscriptionOrderByWithRelationInput;
        WhereUnique: Prisma.BillingSubscriptionWhereUniqueInput;
        Where: Prisma.BillingSubscriptionWhereInput;
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
    Agent: {
        Name: "Agent";
        Shape: Agent;
        Include: Prisma.AgentInclude;
        Select: Prisma.AgentSelect;
        OrderBy: Prisma.AgentOrderByWithRelationInput;
        WhereUnique: Prisma.AgentWhereUniqueInput;
        Where: Prisma.AgentWhereInput;
        Create: {};
        Update: {};
        RelationName: "team" | "tools" | "widgets" | "websites" | "apiKeys" | "usage";
        ListRelations: "tools" | "widgets" | "websites" | "apiKeys" | "usage";
        Relations: {
            team: {
                Shape: Team;
                Name: "Team";
                Nullable: false;
            };
            tools: {
                Shape: AgentTool[];
                Name: "AgentTool";
                Nullable: false;
            };
            widgets: {
                Shape: Widget[];
                Name: "Widget";
                Nullable: false;
            };
            websites: {
                Shape: Website[];
                Name: "Website";
                Nullable: false;
            };
            apiKeys: {
                Shape: ApiKey[];
                Name: "ApiKey";
                Nullable: false;
            };
            usage: {
                Shape: Usage[];
                Name: "Usage";
                Nullable: false;
            };
        };
    };
    AgentTool: {
        Name: "AgentTool";
        Shape: AgentTool;
        Include: Prisma.AgentToolInclude;
        Select: Prisma.AgentToolSelect;
        OrderBy: Prisma.AgentToolOrderByWithRelationInput;
        WhereUnique: Prisma.AgentToolWhereUniqueInput;
        Where: Prisma.AgentToolWhereInput;
        Create: {};
        Update: {};
        RelationName: "agent";
        ListRelations: never;
        Relations: {
            agent: {
                Shape: Agent;
                Name: "Agent";
                Nullable: false;
            };
        };
    };
    Widget: {
        Name: "Widget";
        Shape: Widget;
        Include: Prisma.WidgetInclude;
        Select: Prisma.WidgetSelect;
        OrderBy: Prisma.WidgetOrderByWithRelationInput;
        WhereUnique: Prisma.WidgetWhereUniqueInput;
        Where: Prisma.WidgetWhereInput;
        Create: {};
        Update: {};
        RelationName: "agent" | "usage";
        ListRelations: "usage";
        Relations: {
            agent: {
                Shape: Agent;
                Name: "Agent";
                Nullable: false;
            };
            usage: {
                Shape: Usage[];
                Name: "Usage";
                Nullable: false;
            };
        };
    };
    Website: {
        Name: "Website";
        Shape: Website;
        Include: Prisma.WebsiteInclude;
        Select: Prisma.WebsiteSelect;
        OrderBy: Prisma.WebsiteOrderByWithRelationInput;
        WhereUnique: Prisma.WebsiteWhereUniqueInput;
        Where: Prisma.WebsiteWhereInput;
        Create: {};
        Update: {};
        RelationName: "agent" | "usage";
        ListRelations: "usage";
        Relations: {
            agent: {
                Shape: Agent;
                Name: "Agent";
                Nullable: false;
            };
            usage: {
                Shape: Usage[];
                Name: "Usage";
                Nullable: false;
            };
        };
    };
    ApiKey: {
        Name: "ApiKey";
        Shape: ApiKey;
        Include: Prisma.ApiKeyInclude;
        Select: Prisma.ApiKeySelect;
        OrderBy: Prisma.ApiKeyOrderByWithRelationInput;
        WhereUnique: Prisma.ApiKeyWhereUniqueInput;
        Where: Prisma.ApiKeyWhereInput;
        Create: {};
        Update: {};
        RelationName: "agent" | "usage";
        ListRelations: "usage";
        Relations: {
            agent: {
                Shape: Agent;
                Name: "Agent";
                Nullable: false;
            };
            usage: {
                Shape: Usage[];
                Name: "Usage";
                Nullable: false;
            };
        };
    };
    Usage: {
        Name: "Usage";
        Shape: Usage;
        Include: Prisma.UsageInclude;
        Select: Prisma.UsageSelect;
        OrderBy: Prisma.UsageOrderByWithRelationInput;
        WhereUnique: Prisma.UsageWhereUniqueInput;
        Where: Prisma.UsageWhereInput;
        Create: {};
        Update: {};
        RelationName: "team" | "agent" | "widget" | "website" | "apiKey";
        ListRelations: never;
        Relations: {
            team: {
                Shape: Team;
                Name: "Team";
                Nullable: false;
            };
            agent: {
                Shape: Agent;
                Name: "Agent";
                Nullable: false;
            };
            widget: {
                Shape: Widget | null;
                Name: "Widget";
                Nullable: true;
            };
            website: {
                Shape: Website | null;
                Name: "Website";
                Nullable: true;
            };
            apiKey: {
                Shape: ApiKey | null;
                Name: "ApiKey";
                Nullable: true;
            };
        };
    };
}