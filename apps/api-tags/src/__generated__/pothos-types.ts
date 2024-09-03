/* eslint-disable */
import type { Prisma, TagName, Tag, Tagging } from ".prisma/api-tags-client";
export default interface PrismaTypes {
    TagName: {
        Name: "TagName";
        Shape: TagName;
        Include: Prisma.TagNameInclude;
        Select: Prisma.TagNameSelect;
        OrderBy: Prisma.TagNameOrderByWithRelationInput;
        WhereUnique: Prisma.TagNameWhereUniqueInput;
        Where: Prisma.TagNameWhereInput;
        Create: {};
        Update: {};
        RelationName: "tag";
        ListRelations: never;
        Relations: {
            tag: {
                Shape: Tag;
                Name: "Tag";
                Nullable: false;
            };
        };
    };
    Tag: {
        Name: "Tag";
        Shape: Tag;
        Include: Prisma.TagInclude;
        Select: Prisma.TagSelect;
        OrderBy: Prisma.TagOrderByWithRelationInput;
        WhereUnique: Prisma.TagWhereUniqueInput;
        Where: Prisma.TagWhereInput;
        Create: {};
        Update: {};
        RelationName: "Tagging" | "parent" | "children" | "tagName";
        ListRelations: "Tagging" | "children" | "tagName";
        Relations: {
            Tagging: {
                Shape: Tagging[];
                Name: "Tagging";
                Nullable: false;
            };
            parent: {
                Shape: Tag | null;
                Name: "Tag";
                Nullable: true;
            };
            children: {
                Shape: Tag[];
                Name: "Tag";
                Nullable: false;
            };
            tagName: {
                Shape: TagName[];
                Name: "TagName";
                Nullable: false;
            };
        };
    };
    Tagging: {
        Name: "Tagging";
        Shape: Tagging;
        Include: Prisma.TaggingInclude;
        Select: Prisma.TaggingSelect;
        OrderBy: Prisma.TaggingOrderByWithRelationInput;
        WhereUnique: Prisma.TaggingWhereUniqueInput;
        Where: Prisma.TaggingWhereInput;
        Create: {};
        Update: {};
        RelationName: "tag";
        ListRelations: never;
        Relations: {
            tag: {
                Shape: Tag;
                Name: "Tag";
                Nullable: false;
            };
        };
    };
}