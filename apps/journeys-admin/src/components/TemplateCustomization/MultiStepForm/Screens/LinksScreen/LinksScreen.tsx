import { useMutation } from '@apollo/client'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Formik, FormikHelpers, FormikProvider } from 'formik'
import { useTranslation } from 'next-i18next'
import { ReactElement, useMemo } from 'react'
import { object, string } from 'yup'

import { TreeBlock } from '@core/journeys/ui/block'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import {
  JourneyFields_chatButtons as JourneyChatButton,
  JourneyFields_blocks_ButtonBlock_action_PhoneAction as JourneyPhoneAction
} from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'
import { transformer } from '@core/journeys/ui/transformer'

import {
  BlockFields,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../__generated__/BlockFields'
import { ContactActionType } from '../../../../../../__generated__/globalTypes'
import { JourneyChatButtonUpdate } from '../../../../../../__generated__/JourneyChatButtonUpdate'
import { useBlockActionEmailUpdateMutation } from '../../../../../libs/useBlockActionEmailUpdateMutation'
import { useBlockActionLinkUpdateMutation } from '../../../../../libs/useBlockActionLinkUpdateMutation'
import { useBlockActionPhoneUpdateMutation } from '../../../../../libs/useBlockActionPhoneUpdateMutation'
import { JOURNEY_CHAT_BUTTON_UPDATE } from '../../../../Editor/Slider/Settings/CanvasDetails/JourneyAppearance/Chat/ChatOption/Details/Details'
import { countries } from '../../../../Editor/Slider/Settings/CanvasDetails/Properties/controls/Action/PhoneAction/countriesList'
import { CustomizationScreen } from '../../../utils/getCustomizeFlowConfig'
import { getJourneyLinks } from '../../../utils/getJourneyLinks'
import { CustomizeFlowNextButton } from '../../CustomizeFlowNextButton'

import { CardsPreview } from './CardsPreview'
import { LinksForm } from './LinksForm'
import { SignUpButton } from '../SignUpButton'

interface LinksScreenProps {
  handleNext: () => void
  handleScreenNavigation: (screen: CustomizationScreen) => void
}

export function LinksScreen({
  handleNext,
  handleScreenNavigation
}: LinksScreenProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const links = useMemo(() => getJourneyLinks(t, journey), [journey])
  const [journeyChatButtonUpdate, { loading: chatLoading }] =
    useMutation<JourneyChatButtonUpdate>(JOURNEY_CHAT_BUTTON_UPDATE)
  const [updateLinkAction, { loading: linkLoading }] =
    useBlockActionLinkUpdateMutation()
  const [updateEmailAction, { loading: emailLoading }] =
    useBlockActionEmailUpdateMutation()
  const [updatePhoneAction, { loading: phoneLoading }] =
    useBlockActionPhoneUpdateMutation()

  const treeBlocks = transformer(journey?.blocks ?? []).filter((block) =>
    links?.some(
      (link) =>
        (link.linkType === 'url' ||
          link.linkType === 'email' ||
          link.linkType === 'phone') &&
        link.parentStepId === block.id
    )
  ) as Array<TreeBlock<StepBlock>>

  async function handleFormSubmit(
    values: Record<string, string>,
    formikHelpers: FormikHelpers<Record<string, string>>
  ): Promise<void> {
    const errors = await formikHelpers.validateForm()
    void formikHelpers.setTouched(
      Object.fromEntries(Object.keys(values).map((k) => [k, true])),
      true
    )

    const hasProtocolPrefix = /^\w+:\/\//
    const normalizeChatLink = (val: string): string => {
      if (val === '') return ''
      return hasProtocolPrefix.test(val) ? val : `https://${val}`
    }

    const updatePromises = links.map((link) => {
      const oldValueRaw = (link.url ?? '').trim()
      const newValueRaw =
        link.linkType === 'phone'
          ? (() => {
              const cc = (values[`${link.id}__cc`] ?? '').trim()
              const local = (values[`${link.id}__local`] ?? '').trim()
              const normalizedCc =
                cc === '' ? '' : cc.startsWith('+') ? cc : `+${cc}`
              const ccDigits = normalizedCc.replace(/[^\d]/g, '')
              const localDigits = local.replace(/[^\d]/g, '')
              if (ccDigits === '' && localDigits === '') return ''
              return `+${ccDigits}${localDigits}`
            })()
          : (values[link.id] ?? '').trim()

      if (
        (link.linkType !== 'phone' && errors[link.id] != null) ||
        (link.linkType === 'phone' &&
          (errors[`${link.id}__cc`] != null ||
            errors[`${link.id}__local`] != null))
      )
        return Promise.resolve(undefined)

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

      if (link.linkType === 'email') {
        return updateEmailAction(
          blockRef,
          newValueRaw,
          link.customizable ?? null,
          link.parentStepId ?? null
        )
      }

      if (link.linkType === 'phone') {
        const action =
          (block as any)?.action?.__typename === 'PhoneAction'
            ? ((block as any).action as JourneyPhoneAction)
            : undefined
        const cc = (values[`${link.id}__cc`] ?? '').trim()
        const normalizedCc = cc === '' ? '' : cc.startsWith('+') ? cc : `+${cc}`
        const matchedCountry =
          countries.find((c) => c.callingCode === normalizedCc) ??
          (action?.countryCode != null
            ? countries.find((c) => c.countryCode === action.countryCode)
            : undefined)
        const countryCode = matchedCountry?.countryCode ?? 'US'
        const contactAction = action?.contactAction ?? ContactActionType.call
        return updatePhoneAction(
          blockRef,
          newValueRaw,
          countryCode,
          contactAction,
          link.customizable ?? null,
          link.parentStepId ?? null
        )
      }

      return updateLinkAction(
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
      gap={6}
      sx={{
        px: { xs: 2, sm: 18 },
        width: '100%'
      }}
    >
      <SignUpButton />
      <Stack alignItems="center" sx={{ pb: 1 }}>
        <Typography
          variant="h4"
          display={{ xs: 'none', sm: 'block' }}
          gutterBottom
          sx={{
            mb: { xs: 0, sm: 2 }
          }}
        >
          {t('Links')}
        </Typography>
        <Typography
          variant="h6"
          display={{ xs: 'block', sm: 'none' }}
          gutterBottom
          sx={{
            mb: { xs: 0, sm: 2 }
          }}
        >
          {t('Links')}
        </Typography>
        <Typography
          variant="subtitle2"
          display={{ xs: 'none', sm: 'block' }}
          color="text.secondary"
          align="center"
        >
          {t(
            'This invite contains buttons linking to external sites. Check them and update the links below.'
          )}
        </Typography>
        <Typography
          variant="body2"
          display={{ xs: 'block', sm: 'none' }}
          color="text.secondary"
          align="center"
        >
          {t(
            'This invite contains buttons linking to external sites. Check them and update the links below.'
          )}
        </Typography>
      </Stack>
      <CardsPreview steps={treeBlocks} />
      <Formik
        enableReinitialize
        initialValues={links.reduce<Record<string, string>>((acc, link) => {
          if (link.linkType === 'phone') {
            const block = journey?.blocks?.find((b) => b.id === link.id)
            const action =
              (block as any)?.action?.__typename === 'PhoneAction'
                ? ((block as any).action as JourneyPhoneAction)
                : undefined
            const country =
              action?.countryCode != null
                ? countries.find((c) => c.countryCode === action.countryCode)
                : undefined
            const callingCode = country?.callingCode ?? '+'
            const ccDigits = callingCode.replace(/[^\d]/g, '')
            const prefix = ccDigits === '' ? '' : `+${ccDigits}`
            const local = (action?.phone ?? '').startsWith(prefix)
              ? (action?.phone ?? '').slice(prefix.length)
              : (action?.phone ?? '').replace(/^\+/, '')
            acc[`${link.id}__cc`] = callingCode
            acc[`${link.id}__local`] = local
          } else {
            acc[link.id] = link.url ?? ''
          }
          return acc
        }, {})}
        validationSchema={object().shape(
          links.reduce<Record<string, ReturnType<typeof string>>>(
            (acc, link) => {
              if (link.linkType === 'email') {
                acc[link.id] = string().email(t('Enter a valid email'))
              } else if (link.linkType === 'phone') {
                acc[`${link.id}__cc`] = string().test(
                  'valid-cc',
                  t('Enter a valid calling code'),
                  (val) => {
                    if (val == null || val.trim() === '') return false
                    const normalized = val.startsWith('+') ? val : `+${val}`
                    return countries.some((c) => c.callingCode === normalized)
                  }
                )
                acc[`${link.id}__local`] = string().test(
                  'valid-local',
                  t('Enter a valid phone number'),
                  (val) =>
                    val == null ||
                    val.trim() === '' ||
                    /^[0-9\s\-()]+$/.test(val.trim())
                )
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
            <CustomizeFlowNextButton
              label={t('Next')}
              type="submit"
              form="linksForm"
              loading={
                formik.isSubmitting ||
                chatLoading ||
                linkLoading ||
                emailLoading ||
                phoneLoading
              }
              ariaLabel={t('Replace the links')}
            />
          </FormikProvider>
        )}
      </Formik>
    </Stack>
  )
}
