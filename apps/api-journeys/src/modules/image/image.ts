import 'reflect-metadata'
import { createModule, gql } from 'graphql-modules'
import { AuthenticationError, UserInputError } from 'apollo-server-errors'
import { transformBlock } from '../block'
import { ImageModule } from './__generated__/types'
import { encode } from 'blurhash'
import { createCanvas, loadImage, Image } from 'canvas'
const typeDefs = gql`
  input ImageBlockCreateInput {
    """
    ID should be unique Response UUID (Provided for optimistic mutation result matching)
    """
    id: ID
    parentBlockId: ID
    journeyId: ID!
    src: String!
    alt: String!
  }

  type ImageBlock implements Block {
    id: ID!
    parentBlockId: ID
    src: String!
    width: Int!
    height: Int!
    alt: String!
    """
    blurhash is a compact representation of a placeholder for an image.
    Find a frontend implementation at https://github.com/woltapp/blurhash
    """
    blurhash: String!
  }

  extend type Mutation {
    imageBlockCreate(input: ImageBlockCreateInput!): ImageBlock!
  }
`

const getImageData = (image: Image): ImageData => {
  const canvas = createCanvas(image.width, image.height)
  const context = canvas.getContext('2d')
  context.drawImage(image, 0, 0)
  return context.getImageData(0, 0, image.width, image.height)
}

const encodeImageToBlurhash = (image: Image): string => {
  const imageData = getImageData(image)
  return encode(imageData.data, imageData.width, imageData.height, 4, 4)
}

const resolvers: ImageModule.Resolvers = {
  Mutation: {
    async imageBlockCreate(
      _parent,
      { input: { id, parentBlockId, journeyId, src, alt } },
      { db, userId }
    ) {
      if (userId == null)
        throw new AuthenticationError('No user token provided')
      let image: Image
      try {
        image = await loadImage(src)
      } catch (ex) {
        throw new UserInputError(ex.message, {
          argumentName: 'src'
        })
      }
      const blurhash = encodeImageToBlurhash(image)
      const block = await db.block.create({
        data: {
          id: id as string | undefined,
          parentBlockId,
          journeyId,
          blockType: 'ImageBlock',
          extraAttrs: {
            src,
            alt,
            width: image.width,
            height: image.height,
            blurhash
          }
        }
      })
      return transformBlock(block)
    }
  }
}

export const imageModule = createModule({
  id: 'image',
  dirname: __dirname,
  typeDefs: [typeDefs],
  resolvers
})
