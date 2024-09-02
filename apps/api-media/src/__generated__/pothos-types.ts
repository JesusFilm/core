/* eslint-disable */
import type { Prisma, CloudflareImage, CloudflareVideo, Video, VideoTitle, VideoVariantDownload, VideoVariant, VideoSubtitle, VideoVariantSubtitle, VideoSnippet, VideoDescription, VideoImageAlt, VideoStudyQuestion, ImportTimes, BibleCitation, BibleBook, BibleBookName, Keyword } from ".prisma/api-media-client";
export default interface PrismaTypes {
    CloudflareImage: {
        Name: "CloudflareImage";
        Shape: CloudflareImage;
        Include: never;
        Select: Prisma.CloudflareImageSelect;
        OrderBy: Prisma.CloudflareImageOrderByWithRelationAndSearchRelevanceInput;
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
        OrderBy: Prisma.CloudflareVideoOrderByWithRelationAndSearchRelevanceInput;
        WhereUnique: Prisma.CloudflareVideoWhereUniqueInput;
        Where: Prisma.CloudflareVideoWhereInput;
        Create: {};
        Update: {};
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
    Video: {
        Name: "Video";
        Shape: Video;
        Include: Prisma.VideoInclude;
        Select: Prisma.VideoSelect;
        OrderBy: Prisma.VideoOrderByWithRelationAndSearchRelevanceInput;
        WhereUnique: Prisma.VideoWhereUniqueInput;
        Where: Prisma.VideoWhereInput;
        Create: {};
        Update: {};
        RelationName: "title" | "snippet" | "description" | "studyQuestions" | "imageAlt" | "subtitles" | "children" | "parent" | "variants" | "bibleCitation" | "keywords";
        ListRelations: "title" | "snippet" | "description" | "studyQuestions" | "imageAlt" | "subtitles" | "children" | "parent" | "variants" | "bibleCitation" | "keywords";
        Relations: {
            title: {
                Shape: VideoTitle[];
                Name: "VideoTitle";
                Nullable: false;
            };
            snippet: {
                Shape: VideoSnippet[];
                Name: "VideoSnippet";
                Nullable: false;
            };
            description: {
                Shape: VideoDescription[];
                Name: "VideoDescription";
                Nullable: false;
            };
            studyQuestions: {
                Shape: VideoStudyQuestion[];
                Name: "VideoStudyQuestion";
                Nullable: false;
            };
            imageAlt: {
                Shape: VideoImageAlt[];
                Name: "VideoImageAlt";
                Nullable: false;
            };
            subtitles: {
                Shape: VideoSubtitle[];
                Name: "VideoSubtitle";
                Nullable: false;
            };
            children: {
                Shape: Video[];
                Name: "Video";
                Nullable: false;
            };
            parent: {
                Shape: Video[];
                Name: "Video";
                Nullable: false;
            };
            variants: {
                Shape: VideoVariant[];
                Name: "VideoVariant";
                Nullable: false;
            };
            bibleCitation: {
                Shape: BibleCitation[];
                Name: "BibleCitation";
                Nullable: false;
            };
            keywords: {
                Shape: Keyword[];
                Name: "Keyword";
                Nullable: false;
            };
        };
    };
    VideoTitle: {
        Name: "VideoTitle";
        Shape: VideoTitle;
        Include: Prisma.VideoTitleInclude;
        Select: Prisma.VideoTitleSelect;
        OrderBy: Prisma.VideoTitleOrderByWithRelationAndSearchRelevanceInput;
        WhereUnique: Prisma.VideoTitleWhereUniqueInput;
        Where: Prisma.VideoTitleWhereInput;
        Create: {};
        Update: {};
        RelationName: "video";
        ListRelations: never;
        Relations: {
            video: {
                Shape: Video | null;
                Name: "Video";
                Nullable: true;
            };
        };
    };
    VideoVariantDownload: {
        Name: "VideoVariantDownload";
        Shape: VideoVariantDownload;
        Include: Prisma.VideoVariantDownloadInclude;
        Select: Prisma.VideoVariantDownloadSelect;
        OrderBy: Prisma.VideoVariantDownloadOrderByWithRelationAndSearchRelevanceInput;
        WhereUnique: Prisma.VideoVariantDownloadWhereUniqueInput;
        Where: Prisma.VideoVariantDownloadWhereInput;
        Create: {};
        Update: {};
        RelationName: "videoVariant";
        ListRelations: never;
        Relations: {
            videoVariant: {
                Shape: VideoVariant | null;
                Name: "VideoVariant";
                Nullable: true;
            };
        };
    };
    VideoVariant: {
        Name: "VideoVariant";
        Shape: VideoVariant;
        Include: Prisma.VideoVariantInclude;
        Select: Prisma.VideoVariantSelect;
        OrderBy: Prisma.VideoVariantOrderByWithRelationAndSearchRelevanceInput;
        WhereUnique: Prisma.VideoVariantWhereUniqueInput;
        Where: Prisma.VideoVariantWhereInput;
        Create: {};
        Update: {};
        RelationName: "downloads" | "subtitle" | "video";
        ListRelations: "downloads" | "subtitle";
        Relations: {
            downloads: {
                Shape: VideoVariantDownload[];
                Name: "VideoVariantDownload";
                Nullable: false;
            };
            subtitle: {
                Shape: VideoVariantSubtitle[];
                Name: "VideoVariantSubtitle";
                Nullable: false;
            };
            video: {
                Shape: Video | null;
                Name: "Video";
                Nullable: true;
            };
        };
    };
    VideoSubtitle: {
        Name: "VideoSubtitle";
        Shape: VideoSubtitle;
        Include: Prisma.VideoSubtitleInclude;
        Select: Prisma.VideoSubtitleSelect;
        OrderBy: Prisma.VideoSubtitleOrderByWithRelationAndSearchRelevanceInput;
        WhereUnique: Prisma.VideoSubtitleWhereUniqueInput;
        Where: Prisma.VideoSubtitleWhereInput;
        Create: {};
        Update: {};
        RelationName: "Video";
        ListRelations: never;
        Relations: {
            Video: {
                Shape: Video;
                Name: "Video";
                Nullable: false;
            };
        };
    };
    VideoVariantSubtitle: {
        Name: "VideoVariantSubtitle";
        Shape: VideoVariantSubtitle;
        Include: Prisma.VideoVariantSubtitleInclude;
        Select: Prisma.VideoVariantSubtitleSelect;
        OrderBy: Prisma.VideoVariantSubtitleOrderByWithRelationAndSearchRelevanceInput;
        WhereUnique: Prisma.VideoVariantSubtitleWhereUniqueInput;
        Where: Prisma.VideoVariantSubtitleWhereInput;
        Create: {};
        Update: {};
        RelationName: "variant";
        ListRelations: never;
        Relations: {
            variant: {
                Shape: VideoVariant;
                Name: "VideoVariant";
                Nullable: false;
            };
        };
    };
    VideoSnippet: {
        Name: "VideoSnippet";
        Shape: VideoSnippet;
        Include: Prisma.VideoSnippetInclude;
        Select: Prisma.VideoSnippetSelect;
        OrderBy: Prisma.VideoSnippetOrderByWithRelationAndSearchRelevanceInput;
        WhereUnique: Prisma.VideoSnippetWhereUniqueInput;
        Where: Prisma.VideoSnippetWhereInput;
        Create: {};
        Update: {};
        RelationName: "video";
        ListRelations: never;
        Relations: {
            video: {
                Shape: Video | null;
                Name: "Video";
                Nullable: true;
            };
        };
    };
    VideoDescription: {
        Name: "VideoDescription";
        Shape: VideoDescription;
        Include: Prisma.VideoDescriptionInclude;
        Select: Prisma.VideoDescriptionSelect;
        OrderBy: Prisma.VideoDescriptionOrderByWithRelationAndSearchRelevanceInput;
        WhereUnique: Prisma.VideoDescriptionWhereUniqueInput;
        Where: Prisma.VideoDescriptionWhereInput;
        Create: {};
        Update: {};
        RelationName: "video";
        ListRelations: never;
        Relations: {
            video: {
                Shape: Video | null;
                Name: "Video";
                Nullable: true;
            };
        };
    };
    VideoImageAlt: {
        Name: "VideoImageAlt";
        Shape: VideoImageAlt;
        Include: Prisma.VideoImageAltInclude;
        Select: Prisma.VideoImageAltSelect;
        OrderBy: Prisma.VideoImageAltOrderByWithRelationAndSearchRelevanceInput;
        WhereUnique: Prisma.VideoImageAltWhereUniqueInput;
        Where: Prisma.VideoImageAltWhereInput;
        Create: {};
        Update: {};
        RelationName: "video";
        ListRelations: never;
        Relations: {
            video: {
                Shape: Video | null;
                Name: "Video";
                Nullable: true;
            };
        };
    };
    VideoStudyQuestion: {
        Name: "VideoStudyQuestion";
        Shape: VideoStudyQuestion;
        Include: Prisma.VideoStudyQuestionInclude;
        Select: Prisma.VideoStudyQuestionSelect;
        OrderBy: Prisma.VideoStudyQuestionOrderByWithRelationAndSearchRelevanceInput;
        WhereUnique: Prisma.VideoStudyQuestionWhereUniqueInput;
        Where: Prisma.VideoStudyQuestionWhereInput;
        Create: {};
        Update: {};
        RelationName: "video";
        ListRelations: never;
        Relations: {
            video: {
                Shape: Video | null;
                Name: "Video";
                Nullable: true;
            };
        };
    };
    ImportTimes: {
        Name: "ImportTimes";
        Shape: ImportTimes;
        Include: never;
        Select: Prisma.ImportTimesSelect;
        OrderBy: Prisma.ImportTimesOrderByWithRelationAndSearchRelevanceInput;
        WhereUnique: Prisma.ImportTimesWhereUniqueInput;
        Where: Prisma.ImportTimesWhereInput;
        Create: {};
        Update: {};
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
    BibleCitation: {
        Name: "BibleCitation";
        Shape: BibleCitation;
        Include: Prisma.BibleCitationInclude;
        Select: Prisma.BibleCitationSelect;
        OrderBy: Prisma.BibleCitationOrderByWithRelationAndSearchRelevanceInput;
        WhereUnique: Prisma.BibleCitationWhereUniqueInput;
        Where: Prisma.BibleCitationWhereInput;
        Create: {};
        Update: {};
        RelationName: "video" | "bibleBook";
        ListRelations: never;
        Relations: {
            video: {
                Shape: Video;
                Name: "Video";
                Nullable: false;
            };
            bibleBook: {
                Shape: BibleBook;
                Name: "BibleBook";
                Nullable: false;
            };
        };
    };
    BibleBook: {
        Name: "BibleBook";
        Shape: BibleBook;
        Include: Prisma.BibleBookInclude;
        Select: Prisma.BibleBookSelect;
        OrderBy: Prisma.BibleBookOrderByWithRelationAndSearchRelevanceInput;
        WhereUnique: Prisma.BibleBookWhereUniqueInput;
        Where: Prisma.BibleBookWhereInput;
        Create: {};
        Update: {};
        RelationName: "name" | "bibleCitation";
        ListRelations: "name" | "bibleCitation";
        Relations: {
            name: {
                Shape: BibleBookName[];
                Name: "BibleBookName";
                Nullable: false;
            };
            bibleCitation: {
                Shape: BibleCitation[];
                Name: "BibleCitation";
                Nullable: false;
            };
        };
    };
    BibleBookName: {
        Name: "BibleBookName";
        Shape: BibleBookName;
        Include: Prisma.BibleBookNameInclude;
        Select: Prisma.BibleBookNameSelect;
        OrderBy: Prisma.BibleBookNameOrderByWithRelationAndSearchRelevanceInput;
        WhereUnique: Prisma.BibleBookNameWhereUniqueInput;
        Where: Prisma.BibleBookNameWhereInput;
        Create: {};
        Update: {};
        RelationName: "bibleBook";
        ListRelations: never;
        Relations: {
            bibleBook: {
                Shape: BibleBook;
                Name: "BibleBook";
                Nullable: false;
            };
        };
    };
    Keyword: {
        Name: "Keyword";
        Shape: Keyword;
        Include: Prisma.KeywordInclude;
        Select: Prisma.KeywordSelect;
        OrderBy: Prisma.KeywordOrderByWithRelationAndSearchRelevanceInput;
        WhereUnique: Prisma.KeywordWhereUniqueInput;
        Where: Prisma.KeywordWhereInput;
        Create: {};
        Update: {};
        RelationName: "videos";
        ListRelations: "videos";
        Relations: {
            videos: {
                Shape: Video[];
                Name: "Video";
                Nullable: false;
            };
        };
    };
}