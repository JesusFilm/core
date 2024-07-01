import { Test, TestingModule } from "@nestjs/testing";
import { BatchService } from "./batch.service";
import { PrismaService } from "../../lib/prisma.service";
import { DeepMockProxy, mockDeep } from "jest-mock-extended";
import { SpreadsheetRow } from "../../lib/google/sheets.service";
import {
  Channel,
  Resource,
  ResourceLocalization,
  ResourceStatus,
} from ".prisma/api-nexus-client";
import { PrivacyStatus } from "../../__generated__/graphql";

describe("BatchService", () => {
  let service: BatchService;
  let prismaService: DeepMockProxy<PrismaService>;

  const mochLocalization = {
    id: "resource-localization-id-1",
    resourceId: "resource-id-1",
    title: "title",
    description: "description",
    keywords: "keyword, word",
    captionFile: null,
    audioTrackFile: null,
    language: "en",
    videoId: "video-id-1",
    captionGoogleDriveId: null,
    captionMimeType: null,
    audioTrackGoogleDriveId: null,
    audioTrackMimeType: null,
  };
  const mockResource = {
    id: "resource-id-1",
    name: "Resource 1",
    category: null,
    language: null,
    customThumbnail: null,
    playlistId: null,
    isMadeForKids: false,
    mediaComponentId: null,
    notifySubscribers: false,
    videoGoogleDriveId: null,
    videoMimeType: null,
    thumbnailGoogleDriveId: null,
    thumbnailMimeType: null,
    status: ResourceStatus.processing,
    privacy: PrivacyStatus.private,
    createdAt: new Date(),
    updatedAt: null,
    publishedAt: null,
    deletedAt: null,
    resourceLocalizations: [mochLocalization],
  };

  const mochChannel: Channel = {
    id: "channel-id-1",
    name: "Channel 1",
    platform: "youtube",
    title: null,
    description: null,
    youtubeId: "youtube-id-1",
    imageUrl: null,
    connected: false,
    createdAt: new Date(),
    updatedAt: null,
    publishedAt: null,
    deletedAt: null,
  };
  const mochSpreadsheetRow: SpreadsheetRow = {
    filename: "",
    language: "en",
    videoId: "video-id-1",
    channelData: mochChannel,
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BatchService,
        { provide: PrismaService, useValue: mockDeep<PrismaService>() },
      ],
    }).compile();

    service = module.get<BatchService>(BatchService);
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>;

    prismaService.resource.findFirst.mockResolvedValue(mockResource);
    prismaService.resourceLocalization.update.mockResolvedValue(
      mochLocalization
    );
  });

  describe("createUpdateResourcesLocalization", () => {
    it("should create an update resources localization batch", async () => {
      const updateResourceBatches =
        await service.createUpdateResourcesLocalization("some-token", [
          mochSpreadsheetRow,
        ]);
      updateResourceBatches.forEach((batch) => {
        expect(batch).toMatchObject({
          channel: expect.any(String),
          resourceIds: expect.any(Array),
        });
      });
    });
  });
});
