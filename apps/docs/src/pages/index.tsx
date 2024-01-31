import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import Layout from '@theme/Layout'
import clsx from 'clsx'
import React, { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { FeatureList } from '../components/FeatureList'

import styles from './index.module.css'

function HomepageHeader(): ReactElement {
  const { siteConfig } = useDocusaurusContext()
  const { t } = useTranslation('apps-docs')
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">
          {t('Core Development Kit Documentation')}
        </p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/welcome"
          >
            {t('Welcome - 5min ')}
            {/* eslint-disable-next-line i18next/no-literal-string */}
            <span role="img" aria-label="time emoji">
              ⏱️
            </span>
          </Link>
        </div>
      </div>
    </header>
  )
}

export default function Home(): ReactElement {
  const { siteConfig } = useDocusaurusContext()
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />"
    >
      <HomepageHeader />
      <main>
        <FeatureList />
      </main>
    </Layout>
  )
}
