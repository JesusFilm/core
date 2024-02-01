import { Query, Resolver, Mutation, Args } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';

import { EmailPreferences } from '.prisma/api-users-client';

import { PrismaService } from '../../lib/prisma.service';

import { EmailPreferencesUpdateInput } from '../../__generated__/graphql';

@Resolver('EmailPreferences')
export class EmailPreferencesResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @Query()
  async emailPreferences(): Promise<EmailPreferences[]> {
    const result = await this.prismaService.emailPreferences.findMany();
    return result;
  }

  @Query()
  async emailPreference(@Args('id') id: string, @Args('idType') idType: string): Promise<EmailPreferences> {
    const result = await this.prismaService.emailPreferences.findFirst({
      where: {
        [idType]: id,
      },
    });
    if (result == null)
      throw new GraphQLError('Email Prefrences not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    
    return result;
  }

  @Mutation()
  async updateEmailPreferences(@Args('input') input: EmailPreferencesUpdateInput): Promise<EmailPreferences> {
    const { id, ...data } = input;
    const result = await this.prismaService.emailPreferences.update({
      where: { id },
      data: data,
    });
    return result;
  }
}
