import { DeepMockProxy, mockDeep } from "jest-mock-extended";
import { PrismaService } from "../prisma.service";
import { Test, TestingModule } from "@nestjs/testing";
import { CaslAuthModule } from "@core/nest/common/CaslAuthModule";
import { AppCaslFactory } from "../casl/caslFactory";
import { v4 as uuidv4 } from "uuid";
import { BullMQService } from "./bullMQ.service";
import { Queue } from "bull";
import { getQueueToken } from "@nestjs/bull";
import {
  BatchTask,
  Channel,
  ResourceStatus,
  BatchStatus,
  PrivacyStatus,
} from ".prisma/api-nexus-client";
import { includes } from "lodash";

jest.mock("uuid", () => ({
  __esModule: true,
  v4: jest.fn(),
}));

describe("BullMQService", () => {
  let service: BullMQService;
  let prismaService: DeepMockProxy<PrismaService>;

  const mochBatchTask: BatchTask = {
    id: "test-batch-task-id-1",
    batchId: "test-batch-id-1",
    type: "ff",
    task: {
      channelId: "channel-id-1",
      resourceId: "resource-id-1",
    },
    progress: 0,
    error: null,
    status: "processing",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockBatch = {
    id: "test-batch-id-1",
    name: "test-batch-name-1",
    status: BatchStatus.pending,
    createdAt: new Date(),
    updatedAt: new Date(),
    batchTasks: [mochBatchTask],
  };

  const channel: Channel = {
    id: "channel-id-1",
    name: "Channel Name",
    connected: false,
    platform: "youtube",
    createdAt: new Date(),
    deletedAt: null,
    title: null,
    description: null,
    youtubeId: "youtube-id-1",
    imageUrl: null,
    updatedAt: null,
    publishedAt: null,
  };

  const mochResource = {
    id: "resource-id-1",
    name: "Resource Name",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    category: "Example Category",
    language: null,
    customThumbnail: null,
    isMadeForKids: false,
    playlistId: null,
    mediaComponentId: null,
    notifySubscribers: false,
    publishedAt: null,
    videoGoogleDriveId: null,
    videoMimeType: null,
    thumbnailGoogleDriveId: null,
    thumbnailMimeType: null,
    status: ResourceStatus.processing,
    privacy: PrivacyStatus.private,
    resourceLocalizations: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CaslAuthModule.register(AppCaslFactory)],
      providers: [
        BullMQService,
        { provide: PrismaService, useValue: mockDeep<PrismaService>() },
        {
          provide: getQueueToken("nexus-batch-worker"),
          useValue: { addBulk: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<BullMQService>(BullMQService);
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>;

    prismaService.batch.create.mockResolvedValue(mockBatch);
    prismaService.batch.findUnique.mockResolvedValue(mockBatch);
    prismaService.batchTask.findMany.mockResolvedValue([mochBatchTask]);
    prismaService.channel.findUnique.mockResolvedValueOnce(channel);
    prismaService.resource.findMany.mockResolvedValue([mochResource]);
    prismaService.resource.findUnique.mockResolvedValue(mochResource);
  });

  describe("createUploadResourceBatch", () => {
    it("should create a batch and batch tasks", async () => {
      const uploadResourceBatch = await service.createUploadResourceBatch(
        "some-token",
        mockBatch.name,
        channel,
        [mochResource]
      );
      expect(uploadResourceBatch).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        status: BatchStatus.pending,
        batchTasks: expect.any(Array),
      });
    });
  });

  describe("createLocalizationBatch", () => {
    it("should create a batch and batch tasks", async () => {
      const localizationResourceBatch = await service.createLocalizationBatch(
        "some-token",
        mockBatch.name,
        channel.id,
        [mochResource.id]
      );

      expect(localizationResourceBatch).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        status: BatchStatus.pending,
        batchTasks: expect.any(Array),
      });
    });
  });
});
