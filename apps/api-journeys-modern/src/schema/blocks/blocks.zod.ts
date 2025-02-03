import { z } from 'zod'

import { CardBlockSchema } from './card/card.zod'
import { ImageBlockSchema } from './image/image.zod'
import { StepBlockSchema } from './step/step.zod'
import { TypographyBlockSchema } from './typography/typography.zod'

export const BlockSchema = z.union([
  ImageBlockSchema,
  TypographyBlockSchema,
  CardBlockSchema,
  StepBlockSchema
])
