/* eslint-disable i18next/no-literal-string */
import { GetStaticProps } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { ReactElement } from 'react'

import i18nConfig from '../../next-i18next.config'
import { PageWrapper } from '../../src/components/PageWrapper'
import { getFlags } from '../../src/libs/getFlags'

function StrategiesPage(): ReactElement {
  const { t } = useTranslation('apps-watch')

  return (
    <PageWrapper>
      <div>{t('Strategies')}</div>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum
        sagittis est vel semper lacinia. Phasellus tellus erat, fringilla ac
        faucibus vitae, tincidunt ac libero. Proin mattis sagittis sapien eget
        congue. Mauris tellus ligula, porta eget risus quis, varius feugiat
        libero. Aliquam non odio ex. Mauris semper, magna ut ornare convallis,
        ligula nisl aliquet sapien, sit amet sagittis tellus purus id est. Duis
        tempus massa sit amet magna laoreet placerat. Fusce tincidunt sed justo
        non iaculis. Cras rutrum, ipsum sed viverra varius, ipsum nulla faucibus
        lorem, sed vehicula quam lacus nec quam. Sed ut turpis mauris.
        Suspendisse magna elit, lacinia id nulla quis, vestibulum cursus nunc.
        Donec scelerisque ultrices dui. Curabitur ultricies dolor sapien, et
        aliquet velit auctor in. Cras dignissim ex facilisis eros iaculis
        aliquam ac vel erat. Aenean nec fermentum tellus.
      </p>

      <p>
        Etiam feugiat ipsum nisl. Fusce varius tellus sed justo lobortis,
        elementum pulvinar quam accumsan. Curabitur aliquam lacus eget efficitur
        ultricies. Etiam eget eros nec risus consequat tincidunt. Duis efficitur
        ipsum non bibendum lacinia. Sed posuere eros sed dapibus sagittis.
        Aliquam nec ipsum lorem. Pellentesque feugiat in nibh vitae tincidunt.
        Vivamus sit amet arcu felis. Etiam eu molestie elit.
      </p>

      <p>
        Etiam neque sem, elementum fringilla quam nec, rhoncus rutrum nibh.
        Fusce maximus porttitor ligula, eu suscipit purus euismod eu. Aliquam ac
        enim sagittis libero imperdiet maximus eget at enim. Morbi id ligula a
        ante suscipit tincidunt varius non quam. Mauris eu felis et turpis
        convallis pulvinar. Nulla blandit libero at augue sodales vestibulum.
        Aliquam neque erat, blandit eget massa viverra, lobortis porta est.
        Aliquam quis libero convallis, ultrices orci id, condimentum ante. Nam
        id maximus lectus. Nunc bibendum venenatis commodo. Nam a ante quis
        augue feugiat interdum et ac velit. Ut quis eros porttitor, pellentesque
        augue nec, pulvinar dolor. Sed elementum massa non molestie congue.
        Nulla ligula mi, efficitur sed pretium vitae, rutrum in libero.
      </p>

      <p>
        Integer consectetur lorem nulla. Proin feugiat nisi ligula. In in nulla
        velit. Integer et sem facilisis, rhoncus urna sed, tempus libero.
        Pellentesque laoreet nibh vitae dictum rutrum. Vestibulum pellentesque
        vestibulum nisi, sed ultrices arcu fringilla vitae. Nullam venenatis sem
        id convallis lobortis. Sed et tempus ligula, in varius mi. Sed
        condimentum eleifend ipsum, ut scelerisque eros volutpat et.
      </p>

      <p>
        Donec vel commodo augue, eget tincidunt est. Donec condimentum vulputate
        est, ac imperdiet ante feugiat nec. Pellentesque eleifend, nisl iaculis
        dapibus tempus, erat tortor varius dui, vitae fermentum nulla urna eget
        dolor. Nunc nunc enim, egestas a urna non, bibendum gravida sem. Sed
        vulputate diam felis, non blandit augue tincidunt eu. Donec vel tellus
        sagittis, volutpat lorem et, finibus massa. Suspendisse sit amet ante
        lobortis, feugiat eros id, iaculis neque. Aliquam dapibus et dui id
        suscipit. Phasellus a magna a velit iaculis ornare. Nam id vestibulum
        lorem. Quisque a ipsum eu quam aliquet fringilla vel vitae sem. Quisque
        pulvinar mi et commodo dignissim. Phasellus erat ligula, faucibus quis
        efficitur ut, sollicitudin et libero. Duis accumsan ex metus, sed cursus
        nisl auctor non. Aliquam erat volutpat. In hac habitasse platea
        dictumst.
      </p>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum
        sagittis est vel semper lacinia. Phasellus tellus erat, fringilla ac
        faucibus vitae, tincidunt ac libero. Proin mattis sagittis sapien eget
        congue. Mauris tellus ligula, porta eget risus quis, varius feugiat
        libero. Aliquam non odio ex. Mauris semper, magna ut ornare convallis,
        ligula nisl aliquet sapien, sit amet sagittis tellus purus id est. Duis
        tempus massa sit amet magna laoreet placerat. Fusce tincidunt sed justo
        non iaculis. Cras rutrum, ipsum sed viverra varius, ipsum nulla faucibus
        lorem, sed vehicula quam lacus nec quam. Sed ut turpis mauris.
        Suspendisse magna elit, lacinia id nulla quis, vestibulum cursus nunc.
        Donec scelerisque ultrices dui. Curabitur ultricies dolor sapien, et
        aliquet velit auctor in. Cras dignissim ex facilisis eros iaculis
        aliquam ac vel erat. Aenean nec fermentum tellus.
      </p>

      <p>
        Etiam feugiat ipsum nisl. Fusce varius tellus sed justo lobortis,
        elementum pulvinar quam accumsan. Curabitur aliquam lacus eget efficitur
        ultricies. Etiam eget eros nec risus consequat tincidunt. Duis efficitur
        ipsum non bibendum lacinia. Sed posuere eros sed dapibus sagittis.
        Aliquam nec ipsum lorem. Pellentesque feugiat in nibh vitae tincidunt.
        Vivamus sit amet arcu felis. Etiam eu molestie elit.
      </p>

      <p>
        Etiam neque sem, elementum fringilla quam nec, rhoncus rutrum nibh.
        Fusce maximus porttitor ligula, eu suscipit purus euismod eu. Aliquam ac
        enim sagittis libero imperdiet maximus eget at enim. Morbi id ligula a
        ante suscipit tincidunt varius non quam. Mauris eu felis et turpis
        convallis pulvinar. Nulla blandit libero at augue sodales vestibulum.
        Aliquam neque erat, blandit eget massa viverra, lobortis porta est.
        Aliquam quis libero convallis, ultrices orci id, condimentum ante. Nam
        id maximus lectus. Nunc bibendum venenatis commodo. Nam a ante quis
        augue feugiat interdum et ac velit. Ut quis eros porttitor, pellentesque
        augue nec, pulvinar dolor. Sed elementum massa non molestie congue.
        Nulla ligula mi, efficitur sed pretium vitae, rutrum in libero.
      </p>

      <p>
        Integer consectetur lorem nulla. Proin feugiat nisi ligula. In in nulla
        velit. Integer et sem facilisis, rhoncus urna sed, tempus libero.
        Pellentesque laoreet nibh vitae dictum rutrum. Vestibulum pellentesque
        vestibulum nisi, sed ultrices arcu fringilla vitae. Nullam venenatis sem
        id convallis lobortis. Sed et tempus ligula, in varius mi. Sed
        condimentum eleifend ipsum, ut scelerisque eros volutpat et.
      </p>

      <p>
        Donec vel commodo augue, eget tincidunt est. Donec condimentum vulputate
        est, ac imperdiet ante feugiat nec. Pellentesque eleifend, nisl iaculis
        dapibus tempus, erat tortor varius dui, vitae fermentum nulla urna eget
        dolor. Nunc nunc enim, egestas a urna non, bibendum gravida sem. Sed
        vulputate diam felis, non blandit augue tincidunt eu. Donec vel tellus
        sagittis, volutpat lorem et, finibus massa. Suspendisse sit amet ante
        lobortis, feugiat eros id, iaculis neque. Aliquam dapibus et dui id
        suscipit. Phasellus a magna a velit iaculis ornare. Nam id vestibulum
        lorem. Quisque a ipsum eu quam aliquet fringilla vel vitae sem. Quisque
        pulvinar mi et commodo dignissim. Phasellus erat ligula, faucibus quis
        efficitur ut, sollicitudin et libero. Duis accumsan ex metus, sed cursus
        nisl auctor non. Aliquam erat volutpat. In hac habitasse platea
        dictumst.
      </p>
    </PageWrapper>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const flags = await getFlags()

  if (flags.strategies !== true)
    return {
      revalidate: 60,
      redirect: '/',
      props: {}
    }

  return {
    revalidate: 3600,
    props: {
      flags,
      ...(await serverSideTranslations(
        locale ?? 'en',
        ['apps-watch'],
        i18nConfig
      ))
    }
  }
}

export default StrategiesPage
