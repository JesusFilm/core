import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import { Formik, FormikProvider, FormikHelpers } from 'formik'
import { object, string } from 'yup'
import { useTranslation } from 'next-i18next'

import ArrowRightIcon from '@core/shared/ui/icons/ArrowRight'
import { transformer } from '@core/journeys/ui/transformer'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { getJourneyLinks } from '../../../utils/getJourneyLinks'
import {
  BlockFields,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../__generated__/BlockFields'
import { CardsPreview } from './CardsPreview'
import { TreeBlock } from '@core/journeys/ui/block'
import { LinksForm } from './LinksForm'
import { useBlockActionLinkUpdateMutation } from '../../../../../libs/useBlockActionLinkUpdateMutation'
import { useBlockActionEmailUpdateMutation } from '../../../../../libs/useBlockActionEmailUpdateMutation'
import { useMutation } from '@apollo/client'
import { JourneyChatButtonUpdate } from '../../../../../../__generated__/JourneyChatButtonUpdate'
import { JOURNEY_CHAT_BUTTON_UPDATE } from '../../../../Editor/Slider/Settings/CanvasDetails/JourneyAppearance/Chat/ChatOption/Details/Details'
import { JourneyFields_chatButtons as JourneyChatButton } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'

interface LinksScreenProps {
  handleNext: () => void
}

export function LinksScreen({ handleNext }: LinksScreenProps): ReactElement {
  const { t } = useTranslation()
  const [journeyChatButtonUpdate, { loading: chatLoading }] =
    useMutation<JourneyChatButtonUpdate>(JOURNEY_CHAT_BUTTON_UPDATE)
  const [updateLinkAction, { loading: linkLoading }] =
    useBlockActionLinkUpdateMutation()
  const [updateEmailAction, { loading: emailLoading }] =
    useBlockActionEmailUpdateMutation()

  const { journey } = useJourney()
  const links = getJourneyLinks(t, journey)
  const treeBlocks = transformer(journey?.blocks ?? []).filter((block) =>
    links.some(
      (link) =>
        (link.linkType === 'url' || link.linkType === 'email') &&
        link.parentStepId === block.id
    )
  ) as Array<TreeBlock<StepBlock>>

  async function handleFormSubmit(
    values: Record<string, string>,
    formikHelpers: FormikHelpers<Record<string, string>>
  ): Promise<void> {
    const errors = await formikHelpers.validateForm()
    formikHelpers.setTouched(
      Object.fromEntries(Object.keys(values).map((k) => [k, true])),
      true
    )

    const hasProtocolPrefix = /^\w+:\/\//
    const normalizeChatLink = (val: string): string => {
      if (val === '') return ''
      return hasProtocolPrefix.test(val) ? val : `https://${val}`
    }

    const updatePromises = links.map((link) => {
      const newValueRaw = (values[link.id] ?? '').trim()
      const oldValueRaw = (link.url ?? '').trim()

      if (errors[link.id] != null) return Promise.resolve(undefined)

      if (link.linkType === 'chatButtons') {
        const chatButton = journey?.chatButtons?.find(
          (button: JourneyChatButton) => button.id === link.id
        )

        if (chatButton == null) return Promise.resolve(undefined)

        const normalizedLink = normalizeChatLink(newValueRaw)
        const normalizedOldLink = normalizeChatLink(oldValueRaw)

        if (normalizedLink === normalizedOldLink)
          return Promise.resolve(undefined)

        return journeyChatButtonUpdate({
          variables: {
            chatButtonUpdateId: chatButton.id,
            journeyId: journey?.id,
            input: { link: normalizedLink, platform: chatButton.platform }
          },
          optimisticResponse: {
            chatButtonUpdate: {
              __typename: 'ChatButton',
              id: chatButton.id,
              link: normalizedLink,
              platform: chatButton.platform
            }
          }
        })
      }
      const block = journey?.blocks?.find((block) => block.id === link.id)

      if (block == null) return Promise.resolve(undefined)
      if (newValueRaw === oldValueRaw) return Promise.resolve(undefined)

      const blockRef = {
        id: link.id,
        __typename: (block as { __typename: BlockFields['__typename'] })
          .__typename
      } as Pick<BlockFields, 'id' | '__typename'>

      return link.linkType === 'email'
        ? updateEmailAction(
            blockRef,
            newValueRaw,
            link.customizable ?? null,
            link.parentStepId ?? null
          )
        : updateLinkAction(
            blockRef,
            newValueRaw,
            link.customizable ?? null,
            link.parentStepId ?? null
          )
    })

    await Promise.allSettled(updatePromises)
    handleNext()
  }

  return (
    <Stack
      alignItems="center"
      sx={{ px: { xs: 2, md: 8 }, maxWidth: '1000px' }}
      gap={6}
    >
      <CardsPreview steps={treeBlocks} />
      <Typography variant="h6" color="text.secondary">
        {t('This invite has buttons leading to external links')}
      </Typography>
      <Typography variant="h6" color="text.secondary">
        {t('Check them and change them here')}
      </Typography>
      <Formik
        enableReinitialize
        initialValues={links.reduce<Record<string, string>>((acc, link) => {
          acc[link.id] = link.url ?? ''
          return acc
        }, {})}
        validationSchema={object().shape(
          links.reduce<Record<string, ReturnType<typeof string>>>(
            (acc, link) => {
              if (link.linkType === 'email') {
                acc[link.id] = string().email(t('Enter a valid email'))
              } else {
                acc[link.id] = string().url(t('Enter a valid URL'))
              }
              return acc
            },
            {}
          )
        )}
        validateOnSubmit={false}
        onSubmit={handleFormSubmit}
        validateOnMount
      >
        {(formik) => (
          <FormikProvider value={formik}>
            <LinksForm links={links} />
            <Button
              variant="contained"
              color="secondary"
              type="submit"
              form="linksForm"
              sx={{ width: '300px', alignSelf: 'center', mt: 4 }}
              endIcon={<ArrowRightIcon />}
              loading={
                formik.isSubmitting ||
                chatLoading ||
                linkLoading ||
                emailLoading
              }
            >
              {t('Replace the links')}
            </Button>
          </FormikProvider>
        )}
      </Formik>
    </Stack>
  )
}
