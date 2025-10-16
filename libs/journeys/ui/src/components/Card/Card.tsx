import { ApolloError, useMutation } from '@apollo/client'
import { graphql } from '@core/shared/gql'
import Paper from '@mui/material/Paper'
import { styled, useTheme } from '@mui/material/styles'
import { sendGTMEvent } from '@next/third-parties/google'
import { Form, Formik, FormikHelpers, FormikValues } from 'formik'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement, useEffect, useMemo } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { TreeBlock, useBlocks } from '../../libs/block'
import { blurImage } from '../../libs/blurImage'
import { getStepHeading } from '../../libs/getStepHeading'
import { getTextResponseLabel } from '../../libs/getTextResponseLabel'
import { useJourney } from '../../libs/JourneyProvider'
// eslint-disable-next-line import/no-cycle
import { BlockRenderer, WrappersProps } from '../BlockRenderer'
import type { ImageFields } from '../Image/imageFields'
import type { BlockFields } from '../../libs/block/blockFields'
type StepFields = Extract<BlockFields, { __typename: 'StepBlock' }>
import { ResultOf, VariablesOf } from '@core/shared/gql'
import { TEXT_RESPONSE_SUBMISSION_EVENT_CREATE } from '../TextResponse/TextResponse'
import type { VideoFields } from '../Video/videoFields'

import type { CardFields } from './cardFields'
import { ContainedCover } from './ContainedCover'
import { ExpandedCover } from './ExpandedCover'
import { getFormInitialValues } from './utils/getFormInitialValues'
import { getTextResponseBlocks } from './utils/getTextResponseBlocks'
import { getValidationSchema } from './utils/getValidationSchema/getValidationSchema'

export const STEP_NEXT_EVENT_CREATE = graphql(`
  mutation StepNextEventCreate($input: StepNextEventCreateInput!) {
    stepNextEventCreate(input: $input) {
      id
    }
  }
`)

export const STEP_PREVIOUS_EVENT_CREATE = graphql(`
  mutation StepPreviousEventCreate($input: StepPreviousEventCreateInput!) {
    stepPreviousEventCreate(input: $input) {
      id
    }
  }
`)

type CardProps = TreeBlock<CardFields> & {
  wrappers?: WrappersProps
}

const StyledForm = styled(Form)(() => ({}))

/**
 * Card component - The primary container for content in a Journey.
 *
 * This component is responsible for rendering a card with various content blocks,
 * handling navigation between steps, managing form state for text responses,
 * and tracking analytics events for user interactions.
 *
 * The Card can display content in different layouts based on configuration:
 * - It can show a cover image or video in contained or expanded mode
 * - It handles form submission for text responses
 * - It provides touch/click navigation between steps
 * - It tracks navigation events and submits them to analytics
 *
 * @param {CardProps} props - Component props
 * @param {string} props.id - Unique identifier for the card
 * @param {Array<TreeBlock>} props.children - Child blocks to render within the card
 * @param {string} [props.backgroundColor] - Background color of the card
 * @param {string} [props.coverBlockId] - ID of the block to use as a cover (image or video)
 * @param {boolean} [props.fullscreen] - Whether the card should be displayed in fullscreen mode
 * @param {WrappersProps} [props.wrappers] - Optional wrapper components for blocks rendered inside the card
 *
 * @returns {ReactElement} The rendered Card component
 */
export function Card(props: CardProps): ReactElement {
  const { wrappers } = props
  const cardBlock = props as unknown as TreeBlock<CardFields>
  const id = (cardBlock as any).id as string
  const children = (cardBlock as any).children as TreeBlock[]
  const backgroundColor = (cardBlock as any).backgroundColor as
    | string
    | undefined
  const backdropBlur = (cardBlock as any).backdropBlur as number | undefined
  const coverBlockId = (cardBlock as any).coverBlockId as string | undefined
  const fullscreen = (cardBlock as any).fullscreen as boolean | undefined
  const { enqueueSnackbar } = useSnackbar()

  type TextResponseSubmissionEventCreate = ResultOf<
    typeof TEXT_RESPONSE_SUBMISSION_EVENT_CREATE
  >
  type TextResponseSubmissionEventCreateVariables = VariablesOf<
    typeof TEXT_RESPONSE_SUBMISSION_EVENT_CREATE
  >
  const [textResponseSubmissionEventCreate] = useMutation<
    TextResponseSubmissionEventCreate,
    TextResponseSubmissionEventCreateVariables
  >(TEXT_RESPONSE_SUBMISSION_EVENT_CREATE)

  const { t } = useTranslation('journeys-ui')
  const theme = useTheme()
  const { blockHistory, treeBlocks } = useBlocks()
  const { variant } = useJourney()
  const activeBlock = blockHistory[
    blockHistory.length - 1
  ] as TreeBlock<StepFields>

  const cardColor =
    backgroundColor != null
      ? backgroundColor
      : // Card theme is determined in Conductor
        `${theme.palette.background.paper}4D`

  useEffect(() => {
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', cardColor)
  }, [cardColor])

  const coverBlock = (children as unknown as Array<TreeBlock<any>>).find(
    (block) =>
      block.id === coverBlockId &&
      (block.__typename === 'ImageBlock' || block.__typename === 'VideoBlock')
  ) as TreeBlock<ImageFields | VideoFields> | undefined

  const videoBlock =
    (coverBlock as any)?.__typename === 'VideoBlock'
      ? (coverBlock as TreeBlock<VideoFields>)
      : undefined

  const imageBlock =
    (coverBlock as any)?.__typename === 'ImageBlock'
      ? (coverBlock as unknown as TreeBlock<ImageFields>)
      : undefined

  const blurUrl = useMemo(() => {
    const bh = (imageBlock as unknown as { blurhash?: string })?.blurhash
    return imageBlock != null && bh != null
      ? blurImage(bh, cardColor)
      : undefined
  }, [imageBlock, cardColor])

  const typedChildren = children as unknown as Array<TreeBlock<any>>
  const renderedChildren = (typedChildren as Array<TreeBlock<any>>)
    .filter(({ id }) => id !== coverBlockId)
    .map((block) => (
      <BlockRenderer block={block} wrappers={wrappers} key={block.id} />
    ))

  const hasFullscreenVideo =
    typedChildren.find(
      (child) => child.__typename === 'VideoBlock' && child.id !== coverBlockId
    ) != null

  const formikInitialValues = useMemo(
    () => getFormInitialValues(children as unknown as TreeBlock[]),
    [children]
  )

  const validationSchema = useMemo(
    () => getValidationSchema(children as unknown as TreeBlock[], t),
    [children, t]
  )

  const textResponseBlocks = useMemo(
    () => getTextResponseBlocks(children as unknown as TreeBlock[]),
    [children]
  )

  /**
   * Handles form submission for text responses within the card.
   * Submits all text response values to the server and tracks analytics events.
   *
   * @param {FormikValues} values - The form values to submit
   * @param {FormikHelpers<FormikValues>} formikHelpers - Formik helpers for resetForm
   * @returns {Promise<void>} A promise that resolves when all submissions are complete
   */
  const handleFormSubmit = async (
    values: FormikValues,
    formikHelpers: FormikHelpers<FormikValues>
  ): Promise<void> => {
    const { resetForm } = formikHelpers
    if (variant !== 'default' && variant !== 'embed') return

    const submissionPromises = (
      textResponseBlocks as Array<TreeBlock<any>>
    ).map((block) => {
      const blockId = (block as any).id as string
      const responseValue = values[blockId]
      if (!responseValue || responseValue?.trim() === '')
        return Promise.resolve(null)

      const heading =
        activeBlock != null
          ? (getTextResponseLabel(block as unknown as TreeBlock<any>) ??
            getStepHeading(
              (activeBlock as any).id as string,
              (activeBlock as any).children as unknown as Array<TreeBlock<any>>,
              treeBlocks as unknown as Array<TreeBlock<any>>,
              t
            ))
          : t('None')
      const id = uuidv4()
      return textResponseSubmissionEventCreate({
        variables: {
          input: {
            id,
            blockId,
            stepId: (activeBlock as any)?.id,
            label: heading,
            value: responseValue
          }
        }
      }).then(() => {
        sendGTMEvent({
          event: 'text_response_submission',
          eventId: id,
          blockId,
          stepName: heading
        })
        return id
      })
    })
    await Promise.all(submissionPromises)
      .then(() => {
        resetForm()
      })
      .catch((e) => {
        if (e instanceof ApolloError)
          enqueueSnackbar(e.message, {
            variant: 'error'
          })
      })
  }

  const isContained = (coverBlock != null && !fullscreen) || videoBlock != null

  return (
    <Formik
      initialValues={formikInitialValues}
      onSubmit={handleFormSubmit}
      validationSchema={validationSchema}
      enableReinitialize
      validateOnChange
    >
      {({ handleSubmit }) => (
        <StyledForm
          data-testid={`card-form-${id}`}
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit()
          }}
          sx={{
            height: '100%',
            width: '100%',
            overflow: 'hidden',
            borderRadius: { xs: 'inherit', lg: 3 }
          }}
        >
          <Paper
            data-testid={`JourneysCard-${id}`}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              borderRadius: { xs: 'inherit', lg: 3 },
              backgroundColor,
              width: '100%',
              height: '100%',
              overflow: 'hidden',
              transform: 'translateZ(0)' // safari glitch with border radius
            }}
            elevation={3}
          >
            {isContained ? (
              <ContainedCover
                backgroundColor={cardColor}
                backgroundBlur={blurUrl}
                videoBlock={videoBlock}
                imageBlock={imageBlock}
                hasFullscreenVideo={hasFullscreenVideo}
              >
                {renderedChildren}
              </ContainedCover>
            ) : (
              <ExpandedCover
                backgroundColor={cardColor}
                backgroundBlur={blurUrl}
                backdropBlur={backdropBlur ?? 20}
                imageBlock={imageBlock}
                hasFullscreenVideo={hasFullscreenVideo}
              >
                {renderedChildren}
              </ExpandedCover>
            )}
          </Paper>
        </StyledForm>
      )}
    </Formik>
  )
}
