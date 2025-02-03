import { z } from 'zod'

import { ButtonBlockSchema } from './button/button.zod'
import { CardBlockSchema } from './card/card.zod'
import { IconBlockSchema } from './icon/icon.zod'
import { ImageBlockSchema } from './image/image.zod'
import { RadioOptionBlockSchema } from './radioOption/radioOption.zod'
import { RadioQuestionBlockSchema } from './radioQuestion/radioQuestion.zod'
import { SignUpBlockSchema } from './signUp/signUp.zod'
import { StepBlockSchema } from './step/step.zod'
import { TextResponseBlockSchema } from './textResponse/textResponse.zod'
import { TypographyBlockSchema } from './typography/typography.zod'
import { VideoBlockSchema } from './video/video.zod'
import { VideoTriggerBlockSchema } from './videoTrigger/videoTrigger.zod'

const BlockSchema = z.object({
  id: z.string(),
  journeyId: z.string(),
  parentBlockId: z.string().nullable(),
  parentOrder: z.number().nullable()
})

const BlockUnionSchema = z.union([
  ButtonBlockSchema,
  CardBlockSchema,
  IconBlockSchema,
  ImageBlockSchema,
  RadioOptionBlockSchema,
  RadioQuestionBlockSchema,
  SignUpBlockSchema,
  StepBlockSchema,
  TextResponseBlockSchema,
  TypographyBlockSchema,
  VideoBlockSchema,
  VideoTriggerBlockSchema
])

export { BlockSchema, BlockUnionSchema }
