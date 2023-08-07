import clsx from 'clsx'
import React, { ReactElement } from 'react'

import styles from './FeatureList.module.css'

interface Item {
  title: string
  image?: string
  description: ReactElement
}

const features: Item[] = [
  {
    title: 'Deploy Quickly',
    description: (
      <>
        Our Continuous Integration &amp; Continuous Delivery pipeline lets you
        deliver code changes more frequently and reliably.
      </>
    )
  },
  {
    title: 'Common Environment',
    description: (
      <>
        We run on Docker. This means every developer shares the same environment
        that closely mimics production making collaboration simple.
      </>
    )
  },
  {
    title: 'Powered by Typescript',
    description: (
      <>
        TypeScript is a strongly typed programming language that builds on
        JavaScript, giving you better tooling at any scale.
      </>
    )
  }
]

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
