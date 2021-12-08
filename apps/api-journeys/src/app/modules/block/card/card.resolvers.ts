import { UseGuards } from '@nestjs/common'
import {
  Args,
  Mutation,
  Resolver,
} from '@nestjs/graphql'
import { CardBlock, CardBlockCreateInput, CardBlockUpdateInput } from '../../../graphql'
import { IdAsKey } from '@core/nest/decorators'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard'
import { BlockService } from '../block.service'

@Resolver('CardBlock')
export class CardBlockResolvers {
  constructor(private readonly blockservice: BlockService) { }
  @Mutation()
  @UseGuards(GqlAuthGuard)
  @IdAsKey()  
  async cardBlockCreate(@Args('input') input: CardBlockCreateInput): Promise<CardBlock> {
    input.type = 'CardBlock'
    return await this.blockservice.save(input)
  }

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async cardBlockUpdate(@Args('id') id: string, @Args('input') input: CardBlockUpdateInput): Promise<CardBlock> {
    return await this.blockservice.update(id, input)
  }
}