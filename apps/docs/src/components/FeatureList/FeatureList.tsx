import clsx from 'clsx'
import React, { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import styles from './FeatureList.module.css'

interface Item {
  title: string
  image?: string
  description: ReactElement
}

function Feature({ title, image, description }: Item): ReactElement {
  return (
    <div className={clsx('col col--4')}>
      {image != null && (
        <div className="text--center">
          <img className={styles.featureSvg} alt={title} src={image} />
        </div>
      )}
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  )
}

export function FeatureList(): ReactElement {
  const { t } = useTranslation('apps-docs')

  const features: Item[] = [
    {
      title: 'Deploy Quickly',
      description: (
        <>
          {t(
            'Our Continuous Integration & Continuous Delivery pipeline lets you ' +
              'deliver code changes more frequently and reliably.'
          )}
        </>
      )
    },
    {
      title: 'Common Environment',
      description: (
        <>
          {t(
            'We run on Docker. This means every developer shares the same environment ' +
              'that closely mimics production making collaboration simple.'
          )}
        </>
      )
    },
    {
      title: 'Powered by Typescript',
      description: (
        <>
          {t(
            'TypeScript is a strongly typed programming language that builds on' +
              'JavaScript, giving you better tooling at any scale.'
          )}
        </>
      )
    }
  ]

  return (
    <section className={styles.featureList}>
      <div className="container">
        <div className="row">
          {features.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  )
}
