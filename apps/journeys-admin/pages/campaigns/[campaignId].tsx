import { NormalizedCacheObject } from '@apollo/client'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'

import { CampaignEditor } from '../../src/components/CampaignEditor'
import {
  getAuthTokens,
  redirectToLogin,
  toUser
} from '../../src/libs/auth/getAuthTokens'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'
import { useCampaignQuery } from '../../src/libs/useCampaignQuery'

function CampaignEditPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const campaignId = router.query.campaignId
  const { data, error } = useCampaignQuery(
    typeof campaignId === 'string' ? { id: campaignId } : undefined
  )

  return (
    <>
      <NextSeo
        title={
          data?.campaign.title != null
            ? t('Edit {{title}}', { title: data.campaign.title })
            : t('Edit campaign')
        }
      />
      {error != null ? (
        <Stack
          sx={{
            minHeight: '100vh',
            alignItems: 'center',
            justifyContent: 'center',
            p: 6
          }}
        >
          <Typography variant="h5">{t('Campaign not found')}</Typography>
          <Typography color="text.secondary">{error.message}</Typography>
        </Stack>
      ) : (
        <CampaignEditor campaign={data?.campaign} />
      )}
    </>
  )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const tokens = await getAuthTokens(ctx)
  if (tokens == null) return redirectToLogin(ctx)
  const user = toUser(tokens)

  const { apolloClient, flags, redirect, translations } = await initAndAuthApp({
    user,
    locale: ctx.locale,
    resolvedUrl: ctx.resolvedUrl
  })

  if (redirect != null) return { redirect }

  if (flags.campaignBuilder !== true)
    return { redirect: { destination: '/', permanent: false } }

  return {
    props: {
      userSerialized: JSON.stringify(user),
      initialApolloState: apolloClient.cache.extract() as NormalizedCacheObject,
      ...translations,
      flags
    }
  }
}

export default CampaignEditPage
