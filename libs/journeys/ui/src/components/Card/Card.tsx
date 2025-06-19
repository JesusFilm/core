import { ApolloError, gql, useMutation } from '@apollo/client'
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
import { ImageFields } from '../Image/__generated__/ImageFields'
import { StepFields } from '../Step/__generated__/StepFields'
import { TextResponseSubmissionEventCreate } from '../TextResponse/__generated__/TextResponseSubmissionEventCreate'
import { TEXT_RESPONSE_SUBMISSION_EVENT_CREATE } from '../TextResponse/TextResponse'
import { VideoFields } from '../Video/__generated__/VideoFields'

import { CardFields } from './__generated__/CardFields'
import { ContainedCover } from './ContainedCover'
import { ExpandedCover } from './ExpandedCover'
import { getFormInitialValues } from './utils/getFormInitialValues'
import { getTextResponseBlocks } from './utils/getTextResponseBlocks'
import { getValidationSchema } from './utils/getValidationSchema/getValidationSchema'

export const STEP_NEXT_EVENT_CREATE = gql`
  mutation StepNextEventCreate($input: StepNextEventCreateInput!) {
    stepNextEventCreate(input: $input) {
      id
    }
  }
`

export const STEP_PREVIOUS_EVENT_CREATE = gql`
  mutation StepPreviousEventCreate($input: StepPreviousEventCreateInput!) {
    stepPreviousEventCreate(input: $input) {
      id
    }
  }
`

interface CardProps extends TreeBlock<CardFields> {
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
export function Card({
  id,
  children,
  backgroundColor,
  backdropBlur,
  coverBlockId,
  fullscreen,
  wrappers
}: CardProps): ReactElement {
  const { enqueueSnackbar } = useSnackbar()

  const [textResponseSubmissionEventCreate] =
    useMutation<TextResponseSubmissionEventCreate>(
      TEXT_RESPONSE_SUBMISSION_EVENT_CREATE
    )

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
        theme.palette.background.paper

  useEffect(() => {
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', cardColor)
  }, [cardColor])

  const coverBlock = children.find(
    (block) =>
      block.id === coverBlockId &&
      (block.__typename === 'ImageBlock' || block.__typename === 'VideoBlock')
  ) as TreeBlock<ImageFields | VideoFields> | undefined

  const videoBlock =
    coverBlock?.__typename === 'VideoBlock' ? coverBlock : undefined

  const imageBlock =
    coverBlock?.__typename === 'ImageBlock' ? coverBlock : undefined

  const blurUrl = useMemo(
    () =>
      imageBlock != null
        ? blurImage(imageBlock.blurhash, cardColor)
        : undefined,
    [imageBlock, cardColor]
  )

  const renderedChildren = children
    .filter(({ id }) => id !== coverBlockId)
    .map((block) => (
      <BlockRenderer block={block} wrappers={wrappers} key={block.id} />
    ))

  const hasFullscreenVideo =
    children.find(
      (child) => child.__typename === 'VideoBlock' && child.id !== coverBlockId
    ) != null

  const formikInitialValues = useMemo(
    () => getFormInitialValues(children),
    [children]
  )

  const validationSchema = useMemo(
    () => getValidationSchema(children, t),
    [children, t]
  )

  const textResponseBlocks = useMemo(
    () => getTextResponseBlocks(children),
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

    const submissionPromises = textResponseBlocks.map((block) => {
      const blockId = block.id
      const responseValue = values[blockId]
      if (!responseValue || responseValue?.trim() === '')
        return Promise.resolve(null)

      const heading =
        activeBlock != null
          ? (getTextResponseLabel(block) ??
            getStepHeading(activeBlock.id, activeBlock.children, treeBlocks, t))
          : t('None')
      const id = uuidv4()
      return textResponseSubmissionEventCreate({
        variables: {
          input: {
            id,
            blockId,
            stepId: activeBlock?.id,
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
            {(coverBlock != null && !fullscreen) || videoBlock != null ? (
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
