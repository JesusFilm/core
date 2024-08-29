/* eslint-disable */
import type { Prisma, CloudflareImage, CloudflareVideo } from ".prisma/api-media-client";
export default interface PrismaTypes {
    CloudflareImage: {
        Name: "CloudflareImage";
        Shape: CloudflareImage;
        Include: never;
        Select: Prisma.CloudflareImageSelect;
        OrderBy: Prisma.CloudflareImageOrderByWithRelationInput;
        WhereUnique: Prisma.CloudflareImageWhereUniqueInput;
        Where: Prisma.CloudflareImageWhereInput;
        Create: {};
        Update: {};
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
    CloudflareVideo: {
        Name: "CloudflareVideo";
        Shape: CloudflareVideo;
        Include: never;
        Select: Prisma.CloudflareVideoSelect;
        OrderBy: Prisma.CloudflareVideoOrderByWithRelationInput;
        WhereUnique: Prisma.CloudflareVideoWhereUniqueInput;
        Where: Prisma.CloudflareVideoWhereInput;
        Create: {};
        Update: {};
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
}