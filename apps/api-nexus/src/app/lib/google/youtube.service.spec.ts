import { DeepMockProxy, mockDeep } from "jest-mock-extended";
import { PrismaService } from "../prisma.service";
import { Test, TestingModule } from "@nestjs/testing";
import { GoogleYoutubeService } from "./youtube.service";

describe('YoutubeService', () => {
    let service: GoogleYoutubeService;
    let prismaService: DeepMockProxy<PrismaService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GoogleYoutubeService,
                { provide: PrismaService, useValue: mockDeep<PrismaService>() },
            ],
        }).compile();

        service = module.get<GoogleYoutubeService>(GoogleYoutubeService);
        prismaService = module.get<PrismaService>(PrismaService) as DeepMockProxy<PrismaService>;
    });
});