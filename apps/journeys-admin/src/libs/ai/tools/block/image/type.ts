import { z } from 'zod'

import {
  ImageBlockClassNamesInput,
  ImageBlockUpdateInput
} from '../../../../../../__generated__/globalTypes'

export const imageBlockClassNamesInputSchema = z.object({
  self: z.string().describe('Tailwind CSS class names for the image element')
}) satisfies z.ZodType<ImageBlockClassNamesInput>

export const blockImageUpdateInputSchema = z.object({
  parentBlockId: z
    .string()
    .nullable()
    .optional()
    .describe('ID of the parent block'),
  src: z.string().nullable().optional().describe('The source URL of the image'),
  alt: z
    .string()
    .nullable()
    .optional()
    .describe('The alt text description of the image'),
  blurhash: z
    .string()
    .nullable()
    .optional()
    .describe('The blurhash string for progressive loading'),
  width: z
    .number()
    .nullable()
    .optional()
    .describe('The width of the image in pixels'),
  height: z
    .number()
    .nullable()
    .optional()
    .describe('The height of the image in pixels'),
  scale: z
    .number()
    .nullable()
    .optional()
    .describe('The scale factor of the image'),
  focalTop: z
    .number()
    .nullable()
    .optional()
    .describe('The focal point position from the top (percentage)'),
  focalLeft: z
    .number()
    .nullable()
    .optional()
    .describe('The focal point position from the left (percentage)'),
  classNames: imageBlockClassNamesInputSchema
    .nullable()
    .optional()
    .describe('Tailwind CSS class names for styling the image element')
}) satisfies z.ZodType<ImageBlockUpdateInput>
