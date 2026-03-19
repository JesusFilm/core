/* eslint-disable i18next/no-literal-string */
import { ReactElement, useState } from 'react'

import { PageWrapper } from '../../../PageWrapper'
import { CollectionIntroText } from '../../CollectionIntroText'
import { CollectionsPageContent } from '../../CollectionsPageContent'
import { CollectionsVideoContent } from '../../CollectionsVideoContent'
import { CollectionVideoContentCarousel } from '../../CollectionVideoContentCarousel'
import { ContainerHero } from '../../ContainerHero'
import { OtherCollectionsCarousel } from '../../OtherCollectionsCarousel'

interface CollectionsPageProps {
  year: number
}

export function CollectionsPage({ year }: CollectionsPageProps): ReactElement {
  const [mutePage, setMutePage] = useState(true)

  const shareDataTitle =
    '👋 Посмотрите эти видео о происхождении Пасхи. Думаю, вам понравится.'

  return (
    <PageWrapper
      hero={
        <ContainerHero
          title="Пасха"
          descriptionBeforeYear="Пасха"
          descriptionAfterYear="видео об истории воскресения более чем на 2 000 языках"
          feedbackButtonLabel="Оставить отзыв"
          year={year}
        />
      }
      hideHeader
      hideFooter
    >
      <CollectionsPageContent>
        {/* <CollectionNavigationCarousel contentItems={navigationContentItems} /> */}
        <CollectionIntroText
          title="В чем истинный смысл Пасхи?"
          subtitle="Есть вопросы? В поиске? Откройте для себя истинную силу Пасхи."
          firstParagraph={{
            beforeHighlight:
              'За пределами пасхальных яиц и кроликов лежит история ',
            highlightedText: 'жизни, смерти и воскресения Иисуса.',
            afterHighlight:
              ' Истинная сила Пасхи выходит за рамки церковных служб и обрядов — она касается самой причины, почему человечеству нужен Спаситель.'
          }}
          secondParagraph="Евангелия удивительно честно рассказывают об эмоциях, которые испытывал Иисус — Его глубокой скорби из-за того, что один из Его ближайших друзей отрекся от знакомства с Ним, и неверии других учеников в Его воскресение — эти искренние эмоции отражают наши собственные борения."
          easterDatesTitle="Когда празднуется Пасха в {year} году?"
          thirdParagraph="Исследуйте нашу коллекцию видео и интерактивных материалов, которые приглашают вас познакомиться с подлинной историей — историей, изменившей ход времени и продолжающей преображать жизни сегодня.
Потому что величайшее празднование в истории человечества выходит далеко за рамки традиций — оно о силе воскресения"
          westernEasterLabel="Западная Пасха (Католическая/Протестантская)"
          orthodoxEasterLabel="Православная"
          passoverLabel="Еврейская Пасха"
          locale="ru-RU"
          year={year}
        />
        <CollectionsVideoContent
          contentId="easter-explained/russian"
          subtitle="Победа Иисуса над грехом и смертью"
          title="Истинное значение Пасхи"
          description="Пасха - это больше, чем яйца и кролики — это об Иисусе и Его удивительной любви к нам. Он умер на кресте за наши грехи и воскрес из мертвых, показав Свою власть над грехом и смертью. Благодаря Ему мы можем получить прощение и обетование вечной жизни. Пасха - это время празднования этой великой надежды и невероятного дара Божьего нам."
          mutePage={mutePage}
          setMutePage={setMutePage}
          showDivider={false}
          questionsTitle="Часто задаваемые вопросы о Пасхе"
          askButtonText="Задайте свой"
          bibleQuotesTitle="Цитаты из Библии"
          quizButtonText="Какой ваш следующий шаг веры?"
          shareButtonText="Поделиться"
          shareDataTitle={shareDataTitle}
          questions={[
            {
              id: 1,
              question:
                'Как довериться Божьему суверенитету, когда мир кажется таким хаотичным?',
              answer: (
                <>
                  <p>
                    {
                      'Даже во времена хаоса и неопределенности мы можем доверять Божьему суверенитету, потому что:'
                    }
                  </p>
                  <ul className="mt-2 list-disc space-y-2 pl-6">
                    <li>
                      {
                        'Бог остается в контроле даже тогда, когда обстоятельства кажутся неконтролируемыми'
                      }
                    </li>
                    <li>{'Его цели выше нашего понимания'}</li>
                    <li>
                      {
                        'Он обещает обратить все во благо для тех, кто любит Его'
                      }
                    </li>
                    <li>
                      {
                        'Библия показывает бесчисленные примеры того, как Бог приносит порядок из хаоса'
                      }
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 2,
              question: 'Почему Пасха - самый важный христианский праздник?',
              answer: (
                <>
                  <p>
                    {
                      'Пасха является центральной для христианской веры, потому что:'
                    }
                  </p>
                  <ul className="mt-2 list-disc space-y-2 pl-6">
                    <li>
                      {
                        'Она отмечает воскресение Иисуса, доказывающее Его победу над смертью'
                      }
                    </li>
                    <li>
                      {'Она исполняет ветхозаветные пророчества о Мессии'}
                    </li>
                    <li>{'Она демонстрирует Божью силу давать новую жизнь'}</li>
                    <li>
                      {
                        'Она дает надежду на наше собственное воскресение и вечную жизнь'
                      }
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 3,
              question:
                'Что произошло в течение трех дней между смертью и воскресением Иисуса?',
              answer: (
                <>
                  <p>
                    {'Библия рассказывает нам о нескольких ключевых событиях:'}
                  </p>
                  <ul className="mt-2 list-disc space-y-2 pl-6">
                    <li>
                      {
                        'Тело Иисуса было положено в гробницу и охранялось римскими солдатами'
                      }
                    </li>
                    <li>
                      {'Его последователи скорбели и ждали в неопределенности'}
                    </li>
                    <li>{'Согласно Писанию, Он сошел в царство мертвых'}</li>
                    <li>
                      {'На третий день Он воскрес победителем над смертью'}
                    </li>
                  </ul>
                </>
              )
            }
          ]}
          bibleQuotes={[
            {
              imageUrl:
                'https://images.unsplash.com/photo-1508558936510-0af1e3cccbab?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dmljdG9yeXxlbnwwfHwwfHx8MA%3D%3D',
              bgColor: '#201617',
              author: 'Апостол Павел',
              text: '"Смерть! где твое жало? ад! где твоя победа?" Жало же смерти - грех, а сила греха - закон. Благодарение Богу, даровавшему нам победу Господом нашим Иисусом Христом!'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1522442676585-c751dab71864?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dG9yYWh8ZW58MHx8MHx8fDA%3D',
              bgColor: '#A88E78',
              author: 'Апостол Павел',
              text: '"Смерть! где твое жало? ад! где твоя победа?" Жало же смерти - грех, а сила греха - закон. Благодарение Богу, даровавшему нам победу Господом нашим Иисусом Христом!'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1678181896030-11cf0237d704?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGplc3VzJTIwcmlzZW58ZW58MHx8MHx8fDA%3D',
              bgColor: '#72593A',
              author: 'Апостол Павел',
              text: '"Смерть! где твое жало? ад! где твоя победа?" Жало же смерти - грех, а сила греха - закон. Благодарение Богу, даровавшему нам победу Господом нашим Иисусом Христом!'
            }
          ]}
          freeResource={{
            imageUrl:
              'https://images.unsplash.com/photo-1650658720644-e1588bd66de3?w=900&auto=format&fit=crop&q=60',
            bgColor: '#5F4C5E',
            subtitle: 'Бесплатные ресурсы',
            title: 'Хотите углубить свое понимание Библии?',
            buttonText: 'Присоединиться к изучению Библии'
          }}
        />
        <OtherCollectionsCarousel
          id="other-collections"
          collectionSubtitle="Библейская видеоколлекция"
          collectionTitle="История Пасхи - ключевая часть большой картины"
          watchButtonText="Смотреть"
          missionHighlight="Наша миссия"
          missionDescription="знакомить людей с Библией через фильмы и видео, которые верно воплощают Евангелия в жизнь. Визуально рассказывая историю Иисуса и Божьей любви к человечеству, мы делаем Писание более доступным, увлекательным и понятным."
          movieUrls={[
            {
              imageUrl: 'https://cdn-std.droplr.net/files/acc_760170/cfER11',
              altText: 'Постер фильма ИИСУС',
              externalUrl:
                'https://www.jesusfilm.org/watch/jesus.html/russian.html'
            },
            {
              imageUrl: 'https://cdn-std.droplr.net/files/acc_760170/9wGrB0',
              altText: 'Постер фильма Жизнь Иисуса',
              externalUrl:
                'https://www.jesusfilm.org/watch/life-of-jesus-gospel-of-john.html/russian.html'
            },
            {
              imageUrl: 'https://cdn-std.droplr.net/files/acc_760170/zeoyJz',
              altText: 'Постер фильма Евангелие от Матфея',
              externalUrl:
                'https://www.jesusfilm.org/watch/lumo-the-gospel-of-matthew.html/lumo-matthew-1-1-2-23/russian.html'
            },
            {
              imageUrl: 'https://cdn-std.droplr.net/files/acc_760170/Ol9PXg',
              altText: 'Постер фильма Евангелие от Марка',
              externalUrl:
                'https://www.jesusfilm.org/watch/lumo-the-gospel-of-mark.html/lumo-mark-1-1-45/russian.html'
            },
            {
              imageUrl: 'https://cdn-std.droplr.net/files/acc_760170/cft9yz',
              altText: 'Постер фильма Евангелие от Луки',
              externalUrl:
                'https://www.jesusfilm.org/watch/lumo-the-gospel-of-luke.html/lumo-luke-1-1-56/russian.html'
            }
          ]}
        />
        <CollectionsVideoContent
          contentId="my-last-day/russian"
          subtitle={'Мой последний день'}
          title={'Последний час жизни Иисуса глазами преступника'}
          description={
            'Осужденный преступник с ужасом наблюдает, как Иисуса жестоко бичуют во дворе Пилата, воспоминания о собственных преступлениях наполняют его разум. Почему они наказывают невиновного человека? Рев толпы решает их судьбу — распятие. Вынужденные нести свои кресты на Голгофу, он спотыкается рядом с Иисусом, тяжесть его прошлого и приговора давит на него. Когда гвозди пронзают плоть и небо темнеет, он делает отчаянную мольбу — неужели это действительно Мессия? В свои последние минуты Иисус дает ему неожиданное обещание: сегодня ты будешь со Мною в раю. Смотрите, как разворачивается этот могущественный момент.'
          }
          mutePage={mutePage}
          setMutePage={setMutePage}
          questionsTitle="Связанные вопросы"
          askButtonText="Задайте свой"
          bibleQuotesTitle="Цитаты из Библии"
          shareButtonText="Поделиться"
          shareDataTitle={shareDataTitle}
          quizButtonText="Какой ваш следующий шаг веры?"
          questions={[
            {
              id: 1,
              question: 'Почему Иисус так легко простил преступника?',
              answer: (
                <>
                  <p>
                    {
                      'Прощение Иисуса демонстрирует благодать и милость Божью. Разбойник на кресте признал невиновность и божественность Иисуса, смиренно прося помнить о нем в Его Царстве. Ответ Иисуса показывает:'
                    }
                  </p>
                  <ul className="mt-2 list-disc space-y-2 pl-6">
                    <li>{'Спасение основано на вере, а не на делах'}</li>
                    <li>
                      {
                        'Божья милость распространяется на всех, даже на худших грешников'
                      }
                    </li>
                    <li>
                      {
                        'Иисус пришел спасти погибших, включая преступников и отверженных'
                      }
                    </li>
                    <li>
                      {'Благодать даётся даром тем, кто искренне ищет её'}
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 2,
              question:
                'Если Иисус был невиновен, почему Он не спас Себя вместо того, чтобы принять смерть?',
              answer: (
                <>
                  <p>
                    {
                      'Иисус добровольно принял смерть, потому что это было частью Божьего плана искупления. Его жертва была необходима для исполнения пророчеств и принесения спасения. Основные причины включают:'
                    }
                  </p>
                  <ul className="mt-2 list-disc space-y-2 pl-6">
                    <li>
                      {
                        'Его смерть исполнила пророчества Ветхого Завета (Исаия 53)'
                      }
                    </li>
                    <li>{'Он принял наказание за грехи человечества'}</li>
                    <li>
                      {
                        'Не спасая Себя, Он проявил Свою совершенную любовь и послушание Богу'
                      }
                    </li>
                    <li>
                      {
                        'Его воскресение доказало Его победу над грехом и смертью'
                      }
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 3,
              question: 'Что на самом деле значит быть "в раю" с Иисусом?',
              answer: (
                <>
                  <p>
                    {
                      'Быть в раю с Иисусом означает вечную жизнь в присутствии Бога. Разбойник на кресте получил уверенность в своем месте с Иисусом на небесах благодаря своей вере. Важные аспекты этого обещания включают:'
                    }
                  </p>
                  <ul className="mt-2 list-disc space-y-2 pl-6">
                    <li>
                      {
                        'Оно означает немедленное присутствие со Христом после смерти'
                      }
                    </li>
                    <li>{'Оно подтверждает спасение только через веру'}</li>
                    <li>{'Оно дает надежду на вечную радость и мир'}</li>
                    <li>
                      {
                        'Слова Иисуса подтверждают реальность жизни за пределами этого мира'
                      }
                    </li>
                  </ul>
                </>
              )
            }
          ]}
          bibleQuotes={[
            {
              imageUrl:
                'https://images.unsplash.com/photo-1542272201-b1ca555f8505?w=1400&auto=format&fit=crop&q=60',
              bgColor: '#176361',
              author: 'Иисус (Луки 23:43)',
              text: 'Истинно говорю тебе, ныне же будешь со Мною в раю.'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1709471875678-0b3627a3c099?w=1400&auto=format&fit=crop&q=60',
              bgColor: '#031829',
              author: 'Иисус (Луки 23:34)',
              text: 'Отче! прости им, ибо не знают, что делают.'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1595119591974-a9bd1532c1b0?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGNocmlzdHxlbnwwfHwwfHx8MA%3D%3D',
              bgColor: '#0E0D0F',
              author: 'Исаия 53:5',
              text: 'Но Он изъязвлен был за грехи наши и мучим за беззакония наши; наказание мира нашего было на Нем, и ранами Его мы исцелились.'
            }
          ]}
          freeResource={{
            imageUrl:
              'https://images.unsplash.com/photo-1650658720644-e1588bd66de3?w=900&auto=format&fit=crop&q=60',
            bgColor: '#5F4C5E',
            subtitle: 'Бесплатные ресурсы',
            title: 'Хотите углубить свое понимание Библии?',
            buttonText: 'Присоединиться к изучению Библии'
          }}
        />

        <CollectionVideoContentCarousel
          id="easter-events-day-by-day"
          subtitle={'Пасхальный документальный сериал'}
          title={'Победил ли Иисус смерть?'}
          description={
            'Отправьтесь в это путешествие, чтобы перенестись в 1-й век и проверить другие теории о пустой гробнице Иисуса.'
          }
          contentId="31-how-did-jesus-die/russian"
          videoTitle={'Как умер Иисус?'}
          mutePage={mutePage}
          setMutePage={setMutePage}
          seeAllText="Смотреть все"
          shortVideoText="Короткое видео"
          slides={[
            {
              contentId: '31-how-did-jesus-die/russian',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/7_0-nfs0301.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#161817',
              title: 'Как умер Иисус?'
            },
            {
              contentId: '32-what-happened-next/russian',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/7_0-nfs0302.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#000906',
              title: 'Что произошло дальше?'
            },
            {
              contentId: '33-do-the-facts-stack-up/russian',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/7_0-nfs0303.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#2B2018',
              title: 'Почему Пасха празднуется с кроликами?'
            }
          ]}
        />
        <CollectionsVideoContent
          contentId="why-did-jesus-have-to-die/russian"
          subtitle={'Почему Иисус должен был умереть?'}
          title={'Цель жертвы Иисуса'}
          description={
            'Бог создал людей для духовной и личной связи с Ним, но как мы можем соблюдать Божьи заповеди? Как мы можем жить без стыда? Мы не можем восстановить себя к чести сами. Казалось бы, мы обречены, но Бог не хочет, чтобы Его творение погибло. Он милостив и любящ, и хочет, чтобы мы были восстановлены, живя с Ним полной жизнью.'
          }
          mutePage={mutePage}
          setMutePage={setMutePage}
          questionsTitle="Связанные вопросы"
          askButtonText="Задайте свой"
          bibleQuotesTitle="Цитаты из Библии"
          shareButtonText="Поделиться"
          shareDataTitle={shareDataTitle}
          quizButtonText="Какой ваш следующий шаг веры?"
          questions={[
            {
              id: 1,
              question: 'Почему Бог не может просто простить грехи без жертвы?',
              answer: (
                <>
                  <p>
                    {
                      'Божья природа включает как любовь, так и справедливость. Его святость требует наказания за грех:'
                    }
                  </p>
                  <ul className="mt-2 list-disc space-y-2 pl-6">
                    <li>
                      {'Грех должен быть наказан из-за Божьей справедливости'}
                    </li>
                    <li>{'Только совершенная жертва может искупить грех'}</li>
                    <li>
                      {'Иисус добровольно стал этой жертвой из любви к нам'}
                    </li>
                    <li>
                      {'Его смерть удовлетворила требования справедливости'}
                    </li>
                  </ul>
                </>
              )
            }
          ]}
          bibleQuotes={[
            {
              imageUrl:
                'https://images.unsplash.com/photo-1542272201-b1ca555f8505?w=1400&auto=format&fit=crop&q=60',
              bgColor: '#176361',
              author: 'Евреям 9:22',
              text: 'Без пролития крови не бывает прощения.'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1709471875678-0b3627a3c099?w=1400&auto=format&fit=crop&q=60',
              bgColor: '#031829',
              author: 'Римлянам 5:8',
              text: 'Но Бог Свою любовь к нам доказывает тем, что Христос умер за нас, когда мы были еще грешниками.'
            }
          ]}
          freeResource={{
            imageUrl:
              'https://images.unsplash.com/photo-1650658720644-e1588bd66de3?w=900&auto=format&fit=crop&q=60',
            bgColor: '#5F4C5E',
            subtitle: 'Бесплатные ресурсы',
            title: 'Хотите лучше понять жертву Иисуса?',
            buttonText: 'Присоединиться к изучению Библии'
          }}
        />

        <CollectionsVideoContent
          contentId="talk-with-nicodemus/russian"
          subtitle={'От религии к отношениям'}
          title={'Евангелие в одной беседе'}
          description={
            'Ночью Никодим, уважаемый иудейский учитель, пришел к Иисусу в поисках истины. Иисус сказал ему, что никто не может увидеть Царствие Божие, если не родится свыше. Эта глубокая беседа раскрывает суть миссии Иисуса — принести духовное возрождение через Святого Духа. Узнайте, что значит родиться свыше и почему это необходимо для вечной жизни.'
          }
          mutePage={mutePage}
          setMutePage={setMutePage}
          questionsTitle="Связанные вопросы"
          askButtonText="Задайте свой"
          bibleQuotesTitle="Цитаты из Библии"
          quizButtonText="Какой ваш следующий шаг веры?"
          shareButtonText="Поделиться"
          shareDataTitle={shareDataTitle}
          questions={[
            {
              id: 1,
              question: 'Что значит родиться свыше?',
              answer: (
                <>
                  <p>
                    {
                      'Родиться свыше означает пережить духовное возрождение. Иисус объяснил Никодиму, что это возрождение не физическое, а духовное — рождение от воды и Духа.'
                    }
                  </p>
                  <ul className="mt-2 list-disc space-y-2 pl-6">
                    <li>{'Это работа Святого Духа'}</li>
                    <li>{'Это включает веру в Иисуса как Спасителя'}</li>
                    <li>
                      {'Это приносит новую жизнь и новые отношения с Богом'}
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 2,
              question:
                'Почему Иисус сказал Никодиму, что он должен родиться свыше?',
              answer: (
                <>
                  <p>
                    {
                      'Иисус хотел, чтобы Никодим понял, что религиозных знаний и добрых дел недостаточно. Для входа в Царство Божие необходимо полное внутреннее преображение.'
                    }
                  </p>
                  <ul className="mt-2 list-disc space-y-2 pl-6">
                    <li>{'Это показывает нашу нужду в духовном обновлении'}</li>
                    <li>
                      {'Это указывает на спасение через веру, а не через дела'}
                    </li>
                    <li>{'Это подчеркивает роль Святого Духа'}</li>
                  </ul>
                </>
              )
            },
            {
              id: 3,
              question: 'Как человек может родиться свыше?',
              answer: (
                <>
                  <p>
                    {
                      'Иисус объяснил, что рождение свыше приходит через веру в Него. Это личный шаг веры, который приводит к новой жизни в Боге.'
                    }
                  </p>
                  <ul className="mt-2 list-disc space-y-2 pl-6">
                    <li>{'Поверить в Иисуса Христа как Сына Божьего'}</li>
                    <li>{'Принять Его жертву за наши грехи'}</li>
                    <li>
                      {'Пригласить Святого Духа обновить наше сердце и разум'}
                    </li>
                  </ul>
                </>
              )
            }
          ]}
          bibleQuotes={[
            {
              imageUrl:
                'https://images.unsplash.com/photo-1497449493050-aad1e7cad165?w=1400&auto=format&fit=crop&q=60',
              bgColor: '#0A0A0A',
              author: 'Иоанна 3:3',
              text: 'Иисус сказал ему в ответ: истинно, истинно говорю тебе, если кто не родится свыше, не может увидеть Царствия Божия.'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1574957973698-418ac4c877af?w=1400&auto=format&fit=crop&q=60',
              bgColor: '#1A1A1D',
              author: 'Иоанна 3:5',
              text: 'Иисус отвечал: истинно, истинно говорю тебе, если кто не родится от воды и Духа, не может войти в Царствие Божие.'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=1400&auto=format&fit=crop&q=60',
              bgColor: '#3E3E42',
              author: 'Иоанна 3:16',
              text: 'Ибо так возлюбил Бог мир, что отдал Сына Своего Единородного, дабы всякий верующий в Него не погиб, но имел жизнь вечную.'
            }
          ]}
          freeResource={{
            imageUrl:
              'https://images.unsplash.com/photo-1650658720644-e1588bd66de3?w=900&auto=format&fit=crop&q=60',
            bgColor: '#5F4C5E',
            subtitle: 'Бесплатные ресурсы',
            title: 'Хотите лучше понять воскресение?',
            buttonText: 'Присоединиться к изучению Библии'
          }}
        />

        <CollectionsVideoContent
          contentId="did-jesus-come-back-from-the-dead/russian"
          subtitle={'Воскрес ли Иисус из мертвых?'}
          title={'Правда о воскресении Иисуса'}
          description={
            'Иисус говорил людям, что Он умрет и воскреснет. Этот короткий фильм объясняет подробности смерти и воскресения Иисуса. Его ближайшим последователям было трудно поверить, но очевидцы подтвердили истину: Он воскрес. Весть о Его воскресении распространилась по всему миру, навсегда изменяя жизни. Благодаря этим свидетелям мы можем быть уверены в реальности воскресения Иисуса.'
          }
          mutePage={mutePage}
          setMutePage={setMutePage}
          questionsTitle="Связанные вопросы"
          askButtonText="Задайте свой"
          bibleQuotesTitle="Цитаты из Библии"
          quizButtonText="Какой ваш следующий шаг веры?"
          shareButtonText="Поделиться"
          shareDataTitle={shareDataTitle}
          questions={[
            {
              id: 1,
              question:
                'Откуда мы знаем, что Иисус действительно умер и воскрес?',
              answer: (
                <>
                  <p>
                    {
                      'Существуют сильные исторические и библейские доказательства смерти и воскресения Иисуса:'
                    }
                  </p>
                  <ul className="mt-2 list-disc space-y-2 pl-6">
                    <li>
                      {'Римские воины подтвердили Его смерть перед погребением'}
                    </li>
                    <li>{'Гробница Иисуса была запечатана и охранялась'}</li>
                    <li>
                      {
                        'Сотни свидетелей видели Иисуса живым после Его воскресения'
                      }
                    </li>
                    <li>
                      {
                        'Его ученики, прежде боявшиеся, смело проповедовали и умирали за эту истину'
                      }
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 2,
              question: 'Почему воскресение Иисуса так важно?',
              answer: (
                <>
                  <p>
                    {
                      'Воскресение является центральным для христианской веры, потому что:'
                    }
                  </p>
                  <ul className="mt-2 list-disc space-y-2 pl-6">
                    <li>
                      {'Оно доказывает победу Иисуса над грехом и смертью'}
                    </li>
                    <li>{'Оно исполняет пророчества о Мессии'}</li>
                    <li>{'Оно подтверждает, что Иисус - Сын Божий'}</li>
                    <li>{'Оно дает верующим надежду на вечную жизнь с Ним'}</li>
                  </ul>
                </>
              )
            },
            {
              id: 3,
              question:
                'Как мы должны реагировать на смерть и воскресение Иисуса?',
              answer: (
                <>
                  <p>
                    {'Воскресение Иисуса требует личного ответа. Мы можем:'}
                  </p>
                  <ul className="mt-2 list-disc space-y-2 pl-6">
                    <li>{'Поверить в Него как нашего Спасителя и Господа'}</li>
                    <li>{'Покаяться в грехах и следовать Его учению'}</li>
                    <li>
                      {'Делиться благой вестью о Его воскресении с другими'}
                    </li>
                  </ul>
                </>
              )
            }
          ]}
          bibleQuotes={[
            {
              imageUrl:
                'https://images.unsplash.com/photo-1482424917728-d82d29662023?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjN8fGNocmlzdHxlbnwwfHwwfHx8MA%3D%3D',
              bgColor: '#060606',
              author: 'Римлянам 5:8',
              text: 'Но Бог Свою любовь к нам доказывает тем, что Христос умер за нас, когда мы были еще грешниками.'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1658512341640-2db6ae31906b?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGpvaG4lMjAzJTNBMTZ8ZW58MHx8MHx8fDA%3D',
              bgColor: '#050507',
              author: 'Иоанна 3:16',
              text: 'Ибо так возлюбил Бог мир, что отдал Сына Своего Единородного, дабы всякий верующий в Него не погиб, но имел жизнь вечную.'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1586490110711-7e174d0d043f?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8am9obiUyMDMlM0ExNnxlbnwwfHwwfHx8MA%3D%3D',
              bgColor: '#5B5A5C',
              author: '1 Петра 2:24',
              text: 'Он грехи наши Сам вознес телом Своим на древо, дабы мы, избавившись от грехов, жили для правды: ранами Его вы исцелились.'
            }
          ]}
          freeResource={{
            imageUrl:
              'https://images.unsplash.com/photo-1650658720644-e1588bd66de3?w=900&auto=format&fit=crop&q=60',
            bgColor: '#5F4C5E',
            subtitle: 'Бесплатные ресурсы',
            title: 'Хотите больше узнать о воскресении?',
            buttonText: 'Присоединиться к изучению Библии'
          }}
        />

        <CollectionVideoContentCarousel
          id="easter-events-day-by-day"
          subtitle={'Библейские видео'}
          title={'События Пасхи день за днем'}
          description={
            'Следите за событиями Пасхи день за днем, как описано в Евангелии от Луки.'
          }
          contentId="upper-room-teaching/russian"
          videoTitle={'Учение в Горнице'}
          mutePage={mutePage}
          setMutePage={setMutePage}
          seeAllText="Смотреть все"
          shortVideoText="Короткое видео"
          slides={[
            {
              contentId: 'upper-room-teaching/russian',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6143-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#161817',
              title: 'Учение в Горнице'
            },
            {
              contentId: 'jesus-is-betrayed-and-arrested/russian',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6144-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#000906',
              title: 'Предательство и арест Иисуса'
            },
            {
              contentId: 'peter-disowns-jesus/russian',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6145-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#100704',
              title: 'Петр отрекается от Иисуса'
            },
            {
              contentId: 'jesus-is-mocked-and-questioned/russian',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6146-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#0A0E0D',
              title: 'Иисуса высмеивают и допрашивают'
            },
            {
              contentId: 'jesus-is-brought-to-pilate/russian',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6147-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#170E07',
              title: 'Иисуса приводят к Пилату'
            },
            {
              contentId: 'jesus-is-brought-to-herod/russian',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6148-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#0F0D03',
              title: 'Иисуса приводят к Ироду'
            },
            {
              contentId: 'jesus-is-sentenced/russian',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6149-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#322314',
              title: 'Приговор Иисусу'
            },
            {
              contentId: 'death-of-jesus/russian',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6155-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#1D1B13',
              title: 'Смерть Иисуса'
            },
            {
              contentId: 'burial-of-jesus/russian',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6156-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#231E1F',
              title: 'Погребение Иисуса'
            },
            {
              contentId: 'angels-at-the-tomb/russian',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6157-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#1A190E',
              title: 'Ангелы у гробницы'
            },
            {
              contentId: 'the-tomb-is-empty/russian',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6158-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#151D12',
              title: 'Гробница пуста'
            },
            {
              contentId: 'resurrected-jesus-appears/russian',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6159-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#0B0501',
              title: 'Явление воскресшего Иисуса'
            },
            {
              contentId: 'great-commission-and-ascension/russian',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6160-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#2B2118',
              title: 'Великое поручение и вознесение'
            },
            {
              contentId: 'invitation-to-know-jesus-personally/russian',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6161-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#27160F',
              title: 'Приглашение познать Иисуса лично'
            }
          ]}
        />

        <CollectionsVideoContent
          contentId="the-story-short-film/russian"
          subtitle={'История'}
          title={'История: Как всё началось и как это никогда не закончится'}
          description={
            'История - это короткий фильм о том, как всё началось и как это никогда не закончится. Этот фильм рассказывает всеобъемлющую историю Библии, историю, которая искупает все истории и приносит новую жизнь через спасение только в Иисусе. Он отвечает на самые важные вопросы жизни: Откуда мы пришли? Что пошло не так? Есть ли надежда? И что ждет нас в будущем?'
          }
          mutePage={mutePage}
          setMutePage={setMutePage}
          questionsTitle="Связанные вопросы"
          askButtonText="Задайте свой"
          bibleQuotesTitle="Цитаты из Библии"
          quizButtonText="Какой ваш следующий шаг веры?"
          shareButtonText="Поделиться"
          shareDataTitle={shareDataTitle}
          questions={[
            {
              id: 1,
              question: 'Откуда всё появилось? Есть ли у жизни цель?',
              answer: (
                <>
                  <p>
                    {
                      'Библия учит, что всё началось с Бога, Творца вселенной. Он словом создал всё с целью и замыслом. Человечество было создано по Его образу, чтобы жить в гармонии с Ним, друг с другом и творением.'
                    }
                  </p>
                  <ul className="mt-2 list-disc space-y-2 pl-6">
                    <li>{'Бог создал мир из любви и порядка'}</li>
                    <li>
                      {'Изначально всё было совершенным, без боли и страданий'}
                    </li>
                    <li>{'Люди были созданы для личных отношений с Богом'}</li>
                  </ul>
                </>
              )
            },
            {
              id: 2,
              question: 'Если Бог добр, почему в мире так много страданий?',
              answer: (
                <>
                  <p>
                    {
                      'Страдания существуют потому, что грех вошел в мир, когда человечество решило восстать против Бога. Это непослушание нарушило первоначальное совершенство, принеся смерть, боль и разделение с Богом.'
                    }
                  </p>
                  <ul className="mt-2 list-disc space-y-2 pl-6">
                    <li>{'Грех принес страдания, разрушение и смерть'}</li>
                    <li>{'Мы все вносим свой вклад в проблему греха'}</li>
                    <li>
                      {
                        'Несмотря на это, Бог не оставил человечество — Он обеспечил путь для восстановления'
                      }
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 3,
              question:
                'Есть ли надежда на то, что мир снова станет правильным?',
              answer: (
                <>
                  <p>
                    {
                      'Да! Бог послал Иисуса как спасителя. Иисус прожил совершенную жизнь, умер на кресте, чтобы заплатить за грех, и воскрес из мертвых, чтобы победить саму смерть. Через Него мы можем быть восстановлены для Бога и обрести новую жизнь.'
                    }
                  </p>
                  <ul className="mt-2 list-disc space-y-2 pl-6">
                    <li>{'Жертва Иисуса делает прощение возможным'}</li>
                    <li>
                      {'Его воскресение доказывает Его власть над смертью'}
                    </li>
                    <li>
                      {
                        'Те, кто верит в Иисуса, получают новую жизнь и восстановленные отношения с Богом'
                      }
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 4,
              question: 'Что произойдет в будущем? Есть ли жизнь после смерти?',
              answer: (
                <>
                  <p>
                    {
                      'Согласно Библии, Бог обещал будущее, где Он восстановит всё. Те, кто верит в Иисуса, будут жить вечно с Ним в совершенном, обновленном мире. Греха, страданий и смерти больше не будет.'
                    }
                  </p>
                  <ul className="mt-2 list-disc space-y-2 pl-6">
                    <li>{'Бог создаст новое небо и новую землю'}</li>
                    <li>{'Не будет больше боли, страданий и смерти'}</li>
                    <li>{'Иисус вернется, чтобы судить живых и мертвых'}</li>
                    <li>
                      {'Каждый должен решить, как он ответит на эту истину'}
                    </li>
                  </ul>
                </>
              )
            }
          ]}
          bibleQuotes={[
            {
              imageUrl:
                'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y3JlYXRpb258ZW58MHx8MHx8fDA%3D',
              bgColor: '#010101',
              author: 'Бытие 1:1',
              text: 'В начале сотворил Бог небо и землю.'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1513082325166-c105b20374bb?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG1pc3Rha2V8ZW58MHx8MHx8fDA%3D',
              bgColor: '#6C7B80',
              author: 'Римлянам 3:23-24',
              text: 'Потому что все согрешили и лишены славы Божией, получая оправдание даром, по благодати Его, искуплением во Христе Иисусе.'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1524088484081-4ca7e08e3e19?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dGVhcnN8ZW58MHx8MHx8fDA%3D',
              bgColor: '#87695B',
              author: 'Откровение 21:4',
              text: 'И отрет Бог всякую слезу с очей их, и смерти не будет уже; ни плача, ни вопля, ни болезни уже не будет, ибо прежнее прошло.'
            }
          ]}
          freeResource={{
            imageUrl:
              'https://images.unsplash.com/photo-1650658720644-e1588bd66de3?w=900&auto=format&fit=crop&q=60',
            bgColor: '#5F4C5E',
            subtitle: 'Бесплатные ресурсы',
            title: 'Хотите исследовать самые важные вопросы жизни?',
            buttonText: 'Присоединиться к изучению Библии'
          }}
        />
        <CollectionsVideoContent
          contentId="chosen-witness/russian"
          subtitle={'Избранный свидетель'}
          title={'Мария Магдалина: Жизнь, преображенная Иисусом'}
          description={
            'Жизнь Марии Магдалины была кардинально изменена Иисусом, человеком, который навсегда изменит мир. Когда-то отверженная, она стала одной из Его самых преданных последовательниц. В этом анимационном короткометражном фильме увидьте жизнь Иисуса через её глаза — от её искупления до момента, когда она стала первой свидетельницей Его воскресения.'
          }
          mutePage={mutePage}
          setMutePage={setMutePage}
          questionsTitle="Связанные вопросы"
          askButtonText="Задайте свой"
          bibleQuotesTitle="Цитаты из Библии"
          quizButtonText="Какой ваш следующий шаг веры?"
          shareButtonText="Поделиться"
          shareDataTitle={shareDataTitle}
          questions={[
            {
              id: 1,
              question:
                'Как вы отождествляете себя с главной героиней, Марией Магдалиной?',
              answer: (
                <>
                  <p>
                    {
                      'История Марии Магдалины — это история преображения и искупления. Как и многие из нас, она несла бремя прошлого, полного борьбы, но Иисус освободил её и дал новую цель. Её история учит нас:'
                    }
                  </p>
                  <ul className="mt-2 list-disc space-y-2 pl-6">
                    <li>
                      {
                        'Иисус предлагает искупление независимо от нашего прошлого'
                      }
                    </li>
                    <li>{'Вера во Христа приносит исцеление и цель'}</li>
                    <li>
                      {'Бог призывает самых неожиданных быть Его свидетелями'}
                    </li>
                    <li>{'Встреча с Иисусом меняет всё'}</li>
                  </ul>
                </>
              )
            },
            {
              id: 2,
              question: 'Почему, по-вашему, старейшины не одобряли Иисуса?',
              answer: (
                <>
                  <p>
                    {
                      'Религиозные лидеры противостояли Иисусу, потому что Его учение бросало вызов их авторитету и традициям. Основные причины включают:'
                    }
                  </p>
                  <ul className="mt-2 list-disc space-y-2 pl-6">
                    <li>
                      {
                        'Он принимал грешников и отверженных, нарушая социальные нормы'
                      }
                    </li>
                    <li>
                      {'Его утверждение, что Он Сын Божий, угрожало их власти'}
                    </li>
                    <li>
                      {
                        'Он подчеркивал милость вместо законничества, что гневало тех, кто полагался на закон'
                      }
                    </li>
                    <li>
                      {
                        'Его чудеса и растущее влияние подрывали их контроль над людьми'
                      }
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 3,
              question:
                'Почему, по-вашему, после воскресения Иисус решил первым явиться Марии?',
              answer: (
                <>
                  <p>
                    {
                      'Первое явление Иисуса Марии Магдалине имело глубокое значение. Это показало:'
                    }
                  </p>
                  <ul className="mt-2 list-disc space-y-2 pl-6">
                    <li>{'Его заботу о тех, кого мир не замечал'}</li>
                    <li>{'Важность веры и преданности превыше статуса'}</li>
                    <li>
                      {
                        'Что женщины играли важную роль в Его служении и послании'
                      }
                    </li>
                    <li>
                      {
                        'Как преображенная жизнь может стать сильным свидетельством'
                      }
                    </li>
                  </ul>
                </>
              )
            }
          ]}
          bibleQuotes={[
            {
              imageUrl:
                'https://images.unsplash.com/photo-1521106581851-da5b6457f674?w=900&auto=format&fit=crop&q=60',
              bgColor: '#1A1815',
              author: 'Луки 8:2',
              text: 'И некоторые женщины, которых Он исцелил от злых духов и болезней: Мария, называемая Магдалиною, из которой вышли семь бесов.'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1522442676585-c751dab71864?w=900&auto=format&fit=crop&q=60',
              bgColor: '#A88E78',
              author: 'Иоанна 20:16',
              text: 'Иисус говорит ей: Мария! Она, обратившись, говорит Ему: Раввуни! - что значит: Учитель!'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1678181896030-11cf0237d704?w=900&auto=format&fit=crop&q=60',
              bgColor: '#72593A',
              author: 'Марка 16:9',
              text: 'Воскреснув рано в первый день недели, Иисус явился сперва Марии Магдалине, из которой изгнал семь бесов.'
            }
          ]}
          freeResource={{
            imageUrl:
              'https://images.unsplash.com/photo-1650658720644-e1588bd66de3?w=900&auto=format&fit=crop&q=60',
            bgColor: '#5F4C5E',
            subtitle: 'Бесплатные ресурсы',
            title: 'Хотите углубить свое понимание жизни Иисуса?',
            buttonText: 'Присоединиться к изучению Библии'
          }}
        />

        <CollectionVideoContentCarousel
          id="new-believer-course"
          subtitle={'Видеокурс'}
          title={'Курс для новых верующих'}
          description={
            'Если вы когда-либо задумывались о том, что такое христианство или какой образ жизни оно дает возможность вести, Курс для новых верующих поможет вам понять Евангелие и жить в соответствии с ним.'
          }
          contentId="1-the-simple-gospel/russian"
          videoTitle={'1. Простое Евангелие'}
          mutePage={mutePage}
          setMutePage={setMutePage}
          seeAllText="Смотреть все"
          shortVideoText="Короткое видео"
          slides={[
            {
              contentId: '1-the-simple-gospel/russian',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/8_NBC01.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#FF9A8E',
              title: '1. Простое Евангелие'
            },
            {
              contentId: '2-the-blood-of-jesus/russian',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/8_NBC02.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#D4BD20',
              title: '2. Кровь Иисуса'
            },
            {
              contentId: '3-life-after-death/russian',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/8_NBC03.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#FBAB2C',
              title: '3. Жизнь после смерти'
            },
            {
              contentId: '4-god-forgiveness/russian',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/8_NBC04.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#BD862D',
              title: '4. Божье прощение'
            },
            {
              contentId: '5-savior-lord-and-friend/russian',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/8_NBC05.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#3C7B86',
              title: '5. Спаситель, Господь и Друг'
            },
            {
              contentId: '6-being-made-new/russian',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/8_NBC06.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#02B9B6',
              title: '6. Обновление'
            },
            {
              contentId: '7-living-for-god/russian',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/8_NBC07.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#243856',
              title: '7. Жизнь для Бога'
            },
            {
              contentId: '8-the-bible/russian',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/8_NBC08.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#FCB02D',
              title: '8. Библия'
            },
            {
              contentId: '9-prayer/russian',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/8_NBC09.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#3C7B86',
              title: '9. Молитва'
            },
            {
              contentId: '10-church/russian',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/8_NBC10.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#EB8311',
              title: '10. Церковь'
            }
          ]}
        />

        <CollectionsVideoContent
          contentId="invitation-to-know-jesus-personally/russian"
          subtitle={'Готовы ли вы сделать следующий шаг веры?'}
          title={'Приглашение познать Иисуса лично'}
          description={
            'Приглашение открыто для всех. Это означает обращение к Богу и доверие Иисусу нашей жизни и прощение наших грехов. Мы можем обратиться к Нему в молитве, когда будем готовы стать последователями Иисуса.'
          }
          mutePage={mutePage}
          setMutePage={setMutePage}
          questionsTitle="Связанные вопросы"
          askButtonText="Задайте свой"
          bibleQuotesTitle="Цитаты из Библии"
          quizButtonText="Какой ваш следующий шаг веры?"
          shareButtonText="Поделиться"
          shareDataTitle={shareDataTitle}
          questions={[
            {
              id: 1,
              question: 'Зачем мне спасение, если я хороший человек?',
              answer: (
                <>
                  <p>
                    Библия говорит: "Нет праведного ни одного" (Римлянам 3:10).
                    Божий стандарт - это совершенство, и все согрешили и лишены
                    славы Божьей (Римлянам 3:23). Быть хорошим по человеческим
                    меркам недостаточно, чтобы снять вину греха. Спасение не
                    заслуживается добрыми делами, но получается по благодати
                    через веру в Иисуса (Ефесянам 2:8-9). Только Его жертва
                    может очистить нас и примирить с Богом.
                  </p>
                </>
              )
            },
            {
              id: 2,
              question:
                'Почему Иисус должен был умереть? Разве Бог не мог просто простить нас?',
              answer: (
                <>
                  <p>
                    Бог свят и праведен, и Библия говорит: "Возмездие за грех -
                    смерть" (Римлянам 6:23). Грех отделяет нас от Бога, и
                    справедливость требует наказания. Иисус умер вместо нас как
                    совершенная жертва, чтобы удовлетворить Божью справедливость
                    и показать Его любовь. В Евреям 9:22 сказано: "Без пролития
                    крови не бывает прощения". Иисус заплатил долг, который мы
                    не могли заплатить, и через Него предлагается прощение.
                  </p>
                </>
              )
            },
            {
              id: 3,
              question:
                'Если Иисус воскрес из мертвых, почему не все верят в Него?',
              answer: (
                <>
                  <p>
                    Многие отвергают Иисуса, потому что любят тьму больше света
                    (Иоанна 3:19). Вера в Иисуса требует смирения, покаяния и
                    подчинения. Некоторые ослеплены гордостью, грехом или
                    мирскими отвлечениями (2 Corinthians 4:4). Другие не слышали
                    по-настоящему Евангелие или ожесточили свои сердца. Вера -
                    это ответ на Божий призыв, но Он никого не принуждает верить
                    (Откровение 3:20).
                  </p>
                </>
              )
            }
          ]}
          bibleQuotes={[
            {
              imageUrl:
                'https://images.unsplash.com/photo-1521106581851-da5b6457f674?w=900&auto=format&fit=crop&q=60',
              bgColor: '#1A1815',
              author: 'Иоанна 1:29',
              text: 'Вот Агнец Божий, Который берет на Себя грех мира!'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1522442676585-c751dab71864?w=900&auto=format&fit=crop&q=60',
              bgColor: '#A88E78',
              author: 'Римлянам 6:23',
              text: 'Ибо возмездие за грех - смерть, а дар Божий - жизнь вечная во Христе Иисусе, Господе нашем.'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1678181896030-11cf0237d704?w=900&auto=format&fit=crop&q=60',
              bgColor: '#72593A',
              author: 'Revelation 3:20',
              text: 'Се, стою у двери и стучу: если кто услышит голос Мой и отворит дверь, войду к нему, и буду вечерять с ним, и он со Мною.'
            }
          ]}
          freeResource={{
            imageUrl:
              'https://images.unsplash.com/photo-1650658720644-e1588bd66de3?w=900&auto=format&fit=crop&q=60',
            bgColor: '#5F4C5E',
            subtitle: 'Free Resources',
            title: 'Хотите углубить свое понимание жизни Иисуса?',
            buttonText: 'Присоединиться к изучению Библии'
          }}
        />
      </CollectionsPageContent>
    </PageWrapper>
  )
}
