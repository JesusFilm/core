import { Injectable } from '@nestjs/common'
import { z } from 'zod'

import { Prisma } from '.prisma/api-videos-client'

import { PrismaService } from '../../../lib/prisma.service'
import { ImporterService } from '../importer.service'

const keywordSchema = z.object({
  value: z.string(),
  languageId: z.string(),
  videoIds: z.array(z.string()).optional()
});

type Keyword = z.infer<typeof keywordSchema>

@Injectable()
export class ImporterKeywordsService extends ImporterService<Keyword> {
  schema = keywordSchema
  usedSlugs: Record<string, string> | undefined
  ids: string[] = []

  constructor(private readonly prismaService: PrismaService) {
    super()
  }

  private transform(keyword: z.infer<typeof keywordSchema>): Prisma.KeywordCreateInput {
    return {
      value: keyword.value,
      languageId: keyword.languageId,
      videos: keyword.videoIds 
        ? { connect: keyword.videoIds.map(id => ({ id })) }
        : undefined
    };
  }

  protected async save(keyword: z.infer<typeof keywordSchema>): Promise<void> {
    const input = this.transform(keyword);
    await this.prismaService.keyword.upsert({
      where: { value_languageId: { value: keyword.value, languageId: keyword.languageId } },
      update: input,
      create: input
    });
  }
  
  protected async saveMany(keywords: z.infer<typeof keywordSchema>[]): Promise<void> {
    const transformedKeywords = keywords.map(this.transform);
    await this.prismaService.keyword.createMany({
      data: transformedKeywords,
      skipDuplicates: true
    });
  }
}
