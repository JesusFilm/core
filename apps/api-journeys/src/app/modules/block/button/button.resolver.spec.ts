import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { mockDeep } from 'jest-mock-extended'
import { BlockResolver } from '../block.resolver'
import { BlockService } from '../block.service'
import {
  ButtonVariant,
  ButtonColor,
  ButtonSize
} from '../../../__generated__/graphql'
import { UserJourneyService } from '../../userJourney/userJourney.service'
import { ButtonBlockResolver } from './button.resolver'

describe('Button', () => {
  let resolver: BlockResolver,
    buttonBlockResolver: ButtonBlockResolver,
    service: BlockService

  const block = {
    _key: '1',
    journeyId: '2',
    __typename: 'ButtonBlock',
    parentBlockId: '0',
    parentOrder: 1,
    label: 'label',
    variant: ButtonVariant.contained,
    color: ButtonColor.primary,
    size: ButtonSize.large,
    startIcon: {
      name: 'ArrowForwardRounded',
      color: 'secondary',
      size: 'lg'
    },
    endIcon: {
      name: 'LockOpenRounded',
      color: 'action',
      size: 'xl'
    },
    action: {
      gtmEventName: 'gtmEventName',
      url: 'https://jesusfilm.org',
      target: 'target'
    }
  }
  const blockResponse = {
    id: '1',
    journeyId: '2',
    __typename: 'ButtonBlock',
    parentBlockId: '0',
    parentOrder: 1,
    label: 'label',
    variant: ButtonVariant.contained,
    color: ButtonColor.primary,
    size: ButtonSize.large,
    startIcon: {
      name: 'ArrowForwardRounded',
      color: 'secondary',
      size: 'lg'
    },
    endIcon: {
      name: 'LockOpenRounded',
      color: 'action',
      size: 'xl'
    },
    action: {
      gtmEventName: 'gtmEventName',
      url: 'https://jesusfilm.org',
      target: 'target'
    }
  }

  const blockUpdate = {
    __typname: '',
    journeyId: '2',
    parentBlockId: '0',
    parentOrder: 1,
    label: 'label',
    variant: ButtonVariant.contained,
    color: ButtonColor.primary,
    size: ButtonSize.small,
    startIcon: {
      name: 'ArrowForwardRounded',
      color: 'secondary',
      size: 'lg'
    },
    endIcon: {
      name: 'LockOpenRounded',
      color: 'action',
      size: 'xl'
    },
    action: {
      gtmEventName: 'gtmEventName',
      url: 'https://jesusfilm.org',
      target: 'target'
    }
  }

  const blockService = {
    provide: BlockService,
    useFactory: () => ({
      get: jest.fn(() => block),
      getAll: jest.fn(() => [block, block]),
      update: jest.fn((input) => input)
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockResolver,
        blockService,
        ButtonBlockResolver,
        UserJourneyService,
        {
          provide: 'DATABASE',
          useFactory: () => mockDeep<Database>()
        }
      ]
    }).compile()
    resolver = module.get<BlockResolver>(BlockResolver)
    buttonBlockResolver = module.get<ButtonBlockResolver>(ButtonBlockResolver)
    resolver = module.get<BlockResolver>(BlockResolver)
    service = await module.resolve(BlockService)
  })

  describe('ButtonBlock', () => {
    it('returns ButtonBlock', async () => {
      expect(await resolver.block('1')).toEqual(blockResponse)
      expect(await resolver.blocks()).toEqual([blockResponse, blockResponse])
    })
  })

  describe('ButtonBlockUpdate', () => {
    it('updates a ButtonBlock', async () => {
      void buttonBlockResolver.buttonBlockUpdate(
        block._key,
        block.journeyId,
        blockUpdate
      )
      expect(service.update).toHaveBeenCalledWith(block._key, blockUpdate)
    })
  })
})
