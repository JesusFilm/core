import { Test } from "@nestjs/testing";
import { before } from "lodash";
import { GoogleSheetsService } from "./sheets.service";
import { mockDeep } from "jest-mock-extended";
import { PrismaService } from "../prisma.service";
import { GoogleOAuthService } from "./oauth.service";
import { GoogleDriveService } from "./drive.service";

describe("Sheets Service", () => {
  let service: GoogleSheetsService;
  let prismaService: PrismaService;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        GoogleSheetsService,
        {
          provide: GoogleSheetsService,
          useValue: mockDeep<GoogleSheetsService>(),
        },
        {
          provide: GoogleOAuthService,
          useValue: mockDeep<GoogleOAuthService>(),
        },
        {
          provide: GoogleDriveService,
          useValue: mockDeep<GoogleDriveService>(),
        },
        { provide: PrismaService, useValue: mockDeep<PrismaService>() },
      ],
    }).compile();

    service = module.get<GoogleSheetsService>(GoogleSheetsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });
});
