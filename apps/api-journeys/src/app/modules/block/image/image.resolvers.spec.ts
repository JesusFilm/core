
   
import { Test, TestingModule } from '@nestjs/testing'
import { ImageBlockCreateInput } from '../../../graphql'
import { BlockResolvers } from '../block.resolvers'
import { BlockService } from '../block.service'
import { ImageBlockResolvers } from './image.resolvers'

describe('Image', () => {
  let blockResolver: BlockResolvers, resolver: ImageBlockResolvers, service: BlockService

  const block = {
    _key: "1",
    journeyId: "2",
    type: 'ImageBlock',
    parentBlockId: "3",
    parentOrder: 2,
    src: 'https://source.unsplash.com/random/1920x1080',
    alt: 'random image from unsplash',
    width: 1920,
    height: 1080
  }
  const blockresponse = {
    id: "1",
    journeyId: "2",
    type: 'ImageBlock',
    parentBlockId: "3",
    parentOrder: 2,
    src: 'https://source.unsplash.com/random/1920x1080',
    alt: 'random image from unsplash',
    width: 1920,
    height: 1080
  }

  const input: ImageBlockCreateInput = {
    id: "1",
    parentBlockId: "2",
    journeyId: "3",
    src: 'https://blurha.sh/assets/images/img2.jpg',
    alt: 'grid image'
  }

  const inputUpdate = {
    parentBlockId: "2",
    journeyId: "3",
    src: 'https://blurha.sh/assets/images/img2.jpg',
    alt: 'grid image'
  }

  const imageblockresponse = {
    _key: input.id,
    parentBlockId: input.parentBlockId,
    journeyId: input.journeyId,
    type: 'ImageBlock',
    src: input.src,
    alt: input.alt,
    width: 301,
    height: 193,
    blurhash: 'UHFO~6Yk^6#M@-5b,1J5@[or[k6o};Fxi^OZ'
  }
  
  const imageblockupdateresponse = {
    parentBlockId: input.parentBlockId,
    journeyId: input.journeyId,
    src: input.src,
    alt: input.alt,
    width: 301,
    height: 193,
    blurhash: 'UHFO~6Yk^6#M@-5b,1J5@[or[k6o};Fxi^OZ'
  }

  const blockservice = {
    provide: BlockService,
    useFactory: () => ({
      get: jest.fn(() =>  block),
      getAll: jest.fn(() => [block, block]),
      save: jest.fn(input => input),
      update: jest.fn(input => input)
    })
  }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BlockResolvers, blockservice, ImageBlockResolvers]
    }).compile()
    blockResolver = module.get<BlockResolvers>(BlockResolvers)
    resolver = module.get<ImageBlockResolvers>(ImageBlockResolvers)
    service = await module.resolve(BlockService)
  })

  it('should be defined', () => {
    expect(blockResolver).toBeDefined()
    expect(blockResolver).toBeDefined()
  })

  describe('ImageBlock', () => {
    it('returns ImageBlock', async () => {
      expect(blockResolver.block("1")).resolves.toEqual(blockresponse)
      expect(blockResolver.blocks()).resolves.toEqual([blockresponse, blockresponse])
    })
  })

  describe('imageBlockCreate', () => {
    it('creates an ImageBlock', async () => {
      await resolver.imageBlockCreate(input)
      expect(service.save).toHaveBeenCalledWith(imageblockresponse)
    })
  })

  describe('imageBlockUpdate', () => {
    it('updates an ImageBlock', async () => {
      await resolver.imageBlockUpdate("1", inputUpdate)
      expect(service.update).toHaveBeenCalledWith("1", imageblockupdateresponse)
    })
  })
})
