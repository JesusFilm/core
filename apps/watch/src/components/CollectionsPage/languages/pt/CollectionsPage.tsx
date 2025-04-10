/* eslint-disable i18next/no-literal-string */
import { ReactElement, useState } from 'react'

import { PageWrapper } from '../../../PageWrapper'
import { CollectionIntroText } from '../../CollectionIntroText'
import {
  CollectionNavigationCarousel,
  ContentItem
} from '../../CollectionNavigationCarousel'
import { CollectionsPageContent } from '../../CollectionsPageContent'
import { CollectionsVideoContent } from '../../CollectionsVideoContent'
import { CollectionVideoContentCarousel } from '../../CollectionVideoContentCarousel'
import { ContainerHero } from '../../ContainerHero'
import { OtherCollectionsCarousel } from '../../OtherCollectionsCarousel'

export function CollectionsPage(): ReactElement {
  const [mutePage, setMutePage] = useState(true)

  // Content items data with contentId that will match the CollectionsVideoContent IDs
  const navigationContentItems: ContentItem[] = [
    {
      contentId: 'easter-explained/portuguese-brazil',
      title: 'O Verdadeiro Significado da Páscoa',
      category: 'Vídeo Curto',
      image:
        'https://images.unsplash.com/photo-1521106581851-da5b6457f674?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGVhc3RlcnxlbnwwfHwwfHx8MA%3D%3D',
      bgColor: '#1A1815'
    },
    {
      contentId: 'my-last-day/portuguese-brazil',
      title: 'A última hora da vida de Jesus do ponto de vista do criminoso',
      category: 'Vídeo Curto',
      image:
        'https://images.unsplash.com/photo-1522442676585-c751dab71864?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dG9yYWh8ZW58MHx8MHx8fDA%3D',
      bgColor: '#A88E78'
    },
    {
      contentId: 'why-did-jesus-have-to-die/portuguese-brazil',
      title: 'O Propósito do Sacrifício de Jesus',
      category: 'Vídeo Curto',
      image:
        'https://images.unsplash.com/photo-1591561582301-7ce6588cc286?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8YnVubnl8ZW58MHx8MHx8fDA%3D',
      bgColor: '#62884C'
    },
    {
      contentId: 'did-jesus-come-back-from-the-dead/portuguese-brazil',
      title: 'A Verdade Sobre a Ressurreição de Jesus',
      category: 'Vídeo Curto',
      image:
        'https://images.unsplash.com/photo-1650658720644-e1588bd66de3?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cHJvcGhlY2llc3xlbnwwfHwwfHx8MA%3D%3D',
      bgColor: '#5F4C5E'
    },
    {
      contentId: 'the-story-short-film/portuguese-brazil',
      title: 'A História: Como Tudo Começou e Como Nunca Terminará',
      category: 'Vídeo Curto',
      image:
        'https://images.unsplash.com/photo-1678181896030-11cf0237d704?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGplc3VzJTIwcmlzZW58ZW58MHx8MHx8fDA%3D',
      bgColor: '#72593A'
    },
    {
      contentId: 'chosen-witness/portuguese-brazil',
      title: 'Maria Madalena: Uma Vida Transformada por Jesus',
      category: 'Vídeo Curto',
      image:
        'https://images.unsplash.com/photo-1606876538216-0c70a143dd77?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8amVzdXMlMjBjcm9zc3xlbnwwfHwwfHx8MA%3D%3D',
      bgColor: '#1C160B'
    }
  ]

  const shareDataTitle =
    '👋 Confira estes vídeos sobre as origens da Páscoa. Achei que você iria gostar.'

  return (
    <PageWrapper
      hero={
        <ContainerHero
          title="Páscoa"
          descriptionBeforeYear="Páscoa"
          descriptionAfterYear="vídeos e recursos sobre a Quaresma, Semana Santa e Ressurreição"
          feedbackButtonLabel="Dar Feedback"
        />
      }
      hideHeader
      hideFooter
    >
      <CollectionsPageContent>
        <CollectionNavigationCarousel contentItems={navigationContentItems} />
        <CollectionIntroText
          title="A verdadeira história da Páscoa"
          subtitle="Questionando? Buscando? Descubra o verdadeiro poder da Páscoa."
          firstParagraph={{
            beforeHighlight: 'Além dos ovos e coelhos está a história da ',
            highlightedText: 'vida, morte e ressurreição de Jesus.',
            afterHighlight:
              ' O verdadeiro poder da Páscoa vai além dos serviços religiosos e rituais — e chega até a própria razão pela qual os humanos precisam de um Salvador.'
          }}
          secondParagraph="Os Evangelhos são surpreendentemente honestos sobre as emoções que Jesus experimentou — Sua profunda angústia porque um de Seus amigos mais próximos negou conhecê-lo, e a incredulidade dos outros discípulos em Sua ressurreição — emoções cruas que refletem nossas próprias lutas."
          easterDatesTitle="Quando é a Páscoa em {year}?"
          thirdParagraph="Explore nossa coleção de vídeos e recursos interativos que convidam você a conhecer a história autêntica — uma que mudou a história e continua transformando vidas hoje.
Porque a maior celebração na história da humanidade vai muito além das tradições — trata-se do poder da ressurreição"
          westernEasterLabel="Páscoa Ocidental (Católica/Protestante)"
          orthodoxEasterLabel="Ortodoxa"
          passoverLabel="Páscoa Judaica"
          locale="pt-BR"
        />
        <CollectionsVideoContent
          contentId="easter-explained/portuguese-brazil"
          subtitle="A Vitória de Jesus Sobre o Pecado e a Morte"
          title="O Verdadeiro Significado da Páscoa"
          description="A Páscoa é mais do que ovos e coelhos—é sobre Jesus e Seu amor incrível por nós. Ele morreu na cruz pelos nossos pecados e ressuscitou dos mortos, mostrando Seu poder sobre o pecado e a morte. Por causa Dele, podemos ter perdão e a promessa da vida eterna. A Páscoa é um momento para celebrar esta grande esperança e o presente incrível de Deus para nós."
          mutePage={mutePage}
          setMutePage={setMutePage}
          showDivider={false}
          questionsTitle="Perguntas relacionadas"
          askButtonText="Faça a sua"
          bibleQuotesTitle="Citações bíblicas"
          quizButtonText="Qual é seu próximo passo de fé?"
          shareButtonText="Compartilhar"
          shareDataTitle={shareDataTitle}
          questions={[
            {
              id: 1,
              question:
                'Como posso confiar na soberania de Deus quando o mundo parece tão caótico?',
              answer: (
                <>
                  <p>
                    "Mesmo em tempos de caos e incerteza, podemos confiar na
                    soberania de Deus porque:"
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>
                      'Deus permanece no controle mesmo quando as circunstâncias
                      parecem fora de controle'
                    </li>
                    <li>
                      'Seus propósitos são mais elevados que nosso entendimento'
                    </li>
                    <li>
                      'Ele promete fazer todas as coisas cooperarem para o bem
                      daqueles que O amam'
                    </li>
                    <li>
                      'A Bíblia mostra inúmeros exemplos de Deus trazendo ordem
                      do caos'
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 2,
              question: 'Por que a Páscoa é o feriado cristão mais importante?',
              answer: (
                <>
                  <p>'A Páscoa é central para a fé cristã porque:'</p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>
                      'Marca a ressurreição de Jesus, provando Sua vitória sobre
                      a morte'
                    </li>
                    <li>
                      'Cumpre as profecias do Antigo Testamento sobre o Messias'
                    </li>
                    <li>'Demonstra o poder de Deus de dar nova vida'</li>
                    <li>
                      'Fornece esperança para nossa própria ressurreição e vida
                      eterna'
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 3,
              question:
                'O que aconteceu durante os três dias entre a morte e a ressurreição de Jesus?',
              answer: (
                <>
                  <p>'A Bíblia nos conta vários eventos importantes:'</p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>
                      'O corpo de Jesus foi colocado em um túmulo e guardado por
                      soldados romanos'
                    </li>
                    <li>'Seus seguidores choraram e esperaram na incerteza'</li>
                    <li>
                      'De acordo com as Escrituras, Ele desceu ao reino dos
                      mortos'
                    </li>
                    <li>
                      'No terceiro dia, Ele ressuscitou vitorioso sobre a morte'
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
              author: 'Apóstolo Paulo',
              text: '"Onde está, ó morte, a sua vitória? Onde está, ó morte, o seu aguilhão?" O aguilhão da morte é o pecado, e a força do pecado é a lei. Mas graças a Deus! Ele nos dá a vitória por meio de nosso Senhor Jesus Cristo.'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1522442676585-c751dab71864?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dG9yYWh8ZW58MHx8MHx8fDA%3D',
              bgColor: '#A88E78',
              author: 'Apóstolo Paulo',
              text: '"Onde está, ó morte, a sua vitória? Onde está, ó morte, o seu aguilhão?" O aguilhão da morte é o pecado, e a força do pecado é a lei. Mas graças a Deus! Ele nos dá a vitória por meio de nosso Senhor Jesus Cristo.'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1678181896030-11cf0237d704?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGplc3VzJTIwcmlzZW58ZW58MHx8MHx8fDA%3D',
              bgColor: '#72593A',
              author: 'Apocalipse 3:20',
              text: 'Eis que estou à porta e bato. Se alguém ouvir a minha voz e abrir a porta, entrarei e cearei com ele, e ele comigo.'
            }
          ]}
          freeResource={{
            imageUrl:
              'https://images.unsplash.com/photo-1650658720644-e1588bd66de3?w=900&auto=format&fit=crop&q=60',
            bgColor: '#5F4C5E',
            subtitle: 'Recursos Gratuitos',
            title: 'Quer aprofundar seu entendimento sobre a vida de Jesus?',
            buttonText: 'Participe do Nosso Estudo Bíblico'
          }}
        />
        <OtherCollectionsCarousel
          id="other-collections"
          collectionSubtitle="Coleção de Vídeos Bíblicos"
          collectionTitle="A história da Páscoa é parte fundamental de um quadro maior"
          watchButtonText="Assistir"
          missionHighlight="Nossa missão"
          missionDescription="é apresentar pessoas à Bíblia através de filmes e vídeos que trazem os Evangelhos à vida fielmente. Ao contar visualmente a história de Jesus e do amor de Deus pela humanidade, tornamos as Escrituras mais acessíveis, envolventes e fáceis de entender."
          movieUrls={[
            {
              imageUrl: 'https://cdn-std.droplr.net/files/acc_760170/cfER11',
              altText: 'Cartaz do Filme JESUS',
              externalUrl:
                'https://www.jesusfilm.org/watch/jesus.html/portuguese-brazil.html'
            },
            {
              imageUrl: 'https://cdn-std.droplr.net/files/acc_760170/9wGrB0',
              altText: 'Cartaz do Filme JESUS',
              externalUrl:
                'https://www.jesusfilm.org/watch/jesus.html/portuguese-brazil.html'
            },
            {
              imageUrl: 'https://cdn-std.droplr.net/files/acc_760170/zeoyJz',
              altText: 'Cartaz do Filme Gênesis',
              externalUrl:
                'https://www.jesusfilm.org/watch/lumo-the-gospel-of-matthew.html/lumo-matthew-1-1-2-23/portuguese-brazil.html'
            },
            {
              imageUrl: 'https://cdn-std.droplr.net/files/acc_760170/Ol9PXg',
              altText: 'Cartaz do Filme Gênesis',
              externalUrl:
                'https://www.jesusfilm.org/watch/lumo-the-gospel-of-mark.html/lumo-mark-1-1-45/portuguese-brazil.html'
            },
            {
              imageUrl: 'https://cdn-std.droplr.net/files/acc_760170/cft9yz',
              altText: 'Cartaz do Filme Gênesis',
              externalUrl:
                'https://www.jesusfilm.org/watch/lumo-the-gospel-of-luke.html/lumo-luke-1-1-56/portuguese-brazil.html'
            },
            {
              imageUrl: 'https://cdn-std.droplr.net/files/acc_760170/TxsUi3',
              altText: 'Cartaz do Filme Gênesis',
              externalUrl:
                'https://www.jesusfilm.org/watch/lumo-the-gospel-of-john.html/lumo-john-1-1-34/portuguese-brazil.html'
            }
          ]}
        />
        <CollectionsVideoContent
          contentId="my-last-day/portuguese-brazil"
          subtitle={'Meu Último Dia'}
          title={
            'A última hora da vida de Jesus do ponto de vista do criminoso'
          }
          description={
            'Um ladrão condenado observa com horror enquanto Jesus é brutalmente açoitado no pátio de Pilatos, memórias de seus próprios crimes inundando sua mente. Por que eles puniriam um homem inocente? O rugido da multidão sela seus destinos—crucificação. Forçado a carregar suas cruzes até o Gólgota, ele tropeça ao lado de Jesus, o peso de seu passado e sua sentença o esmagando. Enquanto os pregos perfuram a carne e o céu escurece, ele faz um pedido desesperado—poderia este ser verdadeiramente o Messias? Em seus momentos finais, Jesus lhe dá uma promessa inesperada: Hoje, você estará comigo no paraíso. Assista enquanto este momento poderoso se desenrola.'
          }
          mutePage={mutePage}
          setMutePage={setMutePage}
          questionsTitle="Perguntas relacionadas"
          askButtonText="Faça a sua"
          bibleQuotesTitle="Citações bíblicas"
          shareButtonText="Compartilhar"
          shareDataTitle={shareDataTitle}
          quizButtonText="Qual é seu próximo passo de fé?"
          questions={[
            {
              id: 1,
              question: 'Por que Jesus perdoaria um criminoso tão facilmente?',
              answer: (
                <>
                  <p>
                    {
                      'O perdão de Jesus é uma demonstração da graça e misericórdia de Deus. O ladrão na cruz reconheceu a inocência e divindade de Jesus, humildemente pedindo para ser lembrado em Seu reino. A resposta de Jesus mostra:'
                    }
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>{'A salvação é baseada na fé, não nas obras'}</li>
                    <li>
                      {
                        'A misericórdia de Deus se estende a todos, até mesmo aos piores pecadores'
                      }
                    </li>
                    <li>
                      {
                        'Jesus veio para salvar os perdidos, incluindo criminosos e marginalizados'
                      }
                    </li>
                    <li>
                      {
                        'A graça é dada gratuitamente àqueles que a buscam sinceramente'
                      }
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 2,
              question:
                'Se Jesus era inocente, por que ele não se salvou em vez de aceitar a morte?',
              answer: (
                <>
                  <p>
                    {
                      'Jesus aceitou voluntariamente a morte porque era parte do plano de Deus para a redenção. Seu sacrifício era necessário para cumprir a profecia e trazer salvação. As principais razões incluem:'
                    }
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>
                      {
                        'Sua morte cumpriu as profecias do Antigo Testamento (Isaías 53)'
                      }
                    </li>
                    <li>
                      {'Ele assumiu o castigo pelos pecados da humanidade'}
                    </li>
                    <li>
                      {
                        'Ao não se salvar, Ele demonstrou Seu amor supremo e obediência a Deus'
                      }
                    </li>
                    <li>
                      {
                        'Sua ressurreição provou Sua vitória sobre o pecado e a morte'
                      }
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 3,
              question:
                'O que realmente significa estar "no paraíso" com Jesus?',
              answer: (
                <>
                  <p>
                    {
                      'Estar no paraíso com Jesus significa vida eterna na presença de Deus. O ladrão na cruz teve a garantia de seu lugar com Jesus no céu por causa de sua fé. Aspectos importantes dessa promessa incluem:'
                    }
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>
                      {'Significa presença imediata com Cristo após a morte'}
                    </li>
                    <li>{'Confirma a salvação somente pela fé'}</li>
                    <li>{'Oferece esperança de alegria e paz eternas'}</li>
                    <li>
                      {
                        'As palavras de Jesus afirmam a realidade da vida além deste mundo'
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
                'https://images.unsplash.com/photo-1542272201-b1ca555f8505?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHNreXxlbnwwfHwwfHx8MA%3D%3D',
              bgColor: '#176361',
              author: 'Jesus (Lucas 23:43)',
              text: 'Em verdade te digo que hoje estarás comigo no paraíso.'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1709471875678-0b3627a3c099?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzJ8fGZvcmdpdmV8ZW58MHx8MHx8fDA%3D',
              bgColor: '#031829',
              author: 'Jesus (Lucas 23:34)',
              text: 'Pai, perdoa-lhes, porque não sabem o que fazem.'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1595119591974-a9bd1532c1b0?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGNocmlzdHxlbnwwfHwwfHx8MA%3D%3D',
              bgColor: '#0E0D0F',
              author: 'Isaías 53:5',
              text: 'Mas ele foi traspassado por causa das nossas transgressões, foi esmagado por causa de nossas iniquidades; o castigo que nos trouxe paz estava sobre ele, e pelas suas feridas fomos curados.'
            }
          ]}
          freeResource={{
            imageUrl:
              'https://images.unsplash.com/photo-1650658720644-e1588bd66de3?w=900&auto=format&fit=crop&q=60',
            bgColor: '#5F4C5E',
            subtitle: 'Recursos Gratuitos',
            title: 'Quer aprofundar seu entendimento da Bíblia?',
            buttonText: 'Participe do Nosso Estudo Bíblico'
          }}
        />

        <CollectionVideoContentCarousel
          id="easter-documentary-series"
          subtitle={'Série Documentária da Páscoa'}
          title={'Jesus Venceu a Morte?'}
          description={
            'Embarque nesta aventura para viajar no tempo até o século I e verificar outras teorias sobre o túmulo vazio de Jesus.'
          }
          contentId="31-how-did-jesus-die/portuguese-brazil"
          videoTitle={'Como Jesus Morreu?'}
          mutePage={mutePage}
          setMutePage={setMutePage}
          seeAllText="Ver Todos"
          shortVideoText="Vídeo Curto"
          slides={[
            {
              contentId: 'upper-room-teaching/portuguese-brazil',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6143-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#161817',
              title: 'O Ensinamento no Cenáculo'
            },
            {
              contentId: 'jesus-is-betrayed-and-arrested/portuguese-brazil',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6144-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#000906',
              title: 'Jesus é Traído e Preso'
            },
            {
              contentId: 'peter-disowns-jesus/portuguese-brazil',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6145-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#100704',
              title: 'Pedro Nega Jesus'
            },
            {
              contentId: 'jesus-is-mocked-and-questioned/portuguese-brazil',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6146-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#0A0E0D',
              title: 'Jesus é Zombado e Interrogado'
            },
            {
              contentId: 'jesus-is-brought-to-pilate/portuguese-brazil',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6147-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#170E07',
              title: 'Jesus é Levado a Pilatos'
            },
            {
              contentId: 'jesus-is-brought-to-herod/portuguese-brazil',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6148-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#0F0D03',
              title: 'Jesus é Levado a Herodes'
            },
            {
              contentId: 'jesus-is-sentenced/portuguese-brazil',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6149-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#322314',
              title: 'Jesus é Sentenciado'
            },
            {
              contentId: 'death-of-jesus/portuguese-brazil',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6155-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#1D1B13',
              title: 'A Morte de Jesus'
            },
            {
              contentId: 'burial-of-jesus/portuguese-brazil',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6156-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#231E1F',
              title: 'O Sepultamento de Jesus'
            },
            {
              contentId: 'angels-at-the-tomb/portuguese-brazil',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6157-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#1A190E',
              title: 'Anjos no Túmulo'
            },
            {
              contentId: 'the-tomb-is-empty/portuguese-brazil',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6158-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#151D12',
              title: 'O Túmulo está Vazio'
            },
            {
              contentId: 'resurrected-jesus-appears/portuguese-brazil',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6159-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#0B0501',
              title: 'Jesus Ressuscitado Aparece'
            },
            {
              contentId: 'great-commission-and-ascension/portuguese-brazil',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6160-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#2B2118',
              title: 'A Grande Comissão e Ascensão'
            },
            {
              contentId:
                'invitation-to-know-jesus-personally/portuguese-brazil',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6161-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#27160F',
              title: 'Convite para Conhecer Jesus Pessoalmente'
            }
          ]}
        />

        <CollectionsVideoContent
          contentId="why-did-jesus-have-to-die/portuguese-brazil"
          subtitle={'Por Que Jesus Teve Que Morrer?'}
          title={'O Propósito do Sacrifício de Jesus'}
          description={
            'Deus criou os humanos para terem uma conexão espiritual e relacional com Ele, mas como podemos guardar os mandamentos de Deus? Como podemos viver sem vergonha? Não podemos nos restaurar à honra por nós mesmos. Pareceria que estamos condenados, exceto que Deus não quer que Sua criação morra. Ele é misericordioso e amoroso, e quer que sejamos restaurados, vivendo com Ele em vida plena.'
          }
          mutePage={mutePage}
          setMutePage={setMutePage}
          questionsTitle="Perguntas relacionadas"
          askButtonText="Faça a sua"
          bibleQuotesTitle="Citações bíblicas"
          shareButtonText="Compartilhar"
          shareDataTitle={shareDataTitle}
          quizButtonText="Qual é seu próximo passo de fé?"
          questions={[
            {
              id: 1,
              question: 'Por que a morte de Jesus foi necessária?',
              answer: (
                <>
                  <p>
                    {
                      'A morte de Jesus foi necessária para cumprir o plano de redenção de Deus. Por causa do pecado, a humanidade estava separada de Deus, mas o sacrifício de Jesus proporcionou o caminho para a reconciliação. Aqui está por que Sua morte era essencial:'
                    }
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>{'O pecado cria uma barreira entre nós e Deus'}</li>
                    <li>
                      {'A justiça de Deus requer um pagamento pelo pecado'}
                    </li>
                    <li>
                      {'Jesus, como o sacrifício perfeito, tomou nosso lugar'}
                    </li>
                    <li>
                      {'Através de Sua morte, recebemos perdão e restauração'}
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 2,
              question:
                'Se Deus é amoroso, por que Ele não perdoou o pecado sem o sacrifício de Jesus?',
              answer: (
                <>
                  <p>
                    {
                      'O amor e a justiça de Deus andam de mãos dadas. Embora Ele deseje perdoar, Ele também mantém a justiça. O sacrifício de Jesus foi a expressão máxima de ambos:'
                    }
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>
                      {'O perdão requer um custo, e Jesus pagou esse custo'}
                    </li>
                    <li>
                      {
                        'Sua morte satisfez a justiça de Deus enquanto mostrava Sua misericórdia'
                      }
                    </li>
                    <li>
                      {
                        'Através de Jesus, Deus demonstrou Seu amor pela humanidade'
                      }
                    </li>
                    <li>
                      {
                        'Seu sacrifício nos permite ser restaurados sem comprometer a justiça divina'
                      }
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 3,
              question:
                'Como a morte de Jesus afeta nosso relacionamento com Deus?',
              answer: (
                <>
                  <p>
                    {
                      'A morte e ressurreição de Jesus abriram o caminho para sermos reconciliados com Deus. Através Dele, podemos:'
                    }
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>{'Experimentar perdão e liberdade do pecado'}</li>
                    <li>{'Ter acesso direto a Deus através de Cristo'}</li>
                    <li>{'Receber o dom da vida eterna'}</li>
                    <li>
                      {'Viver em relacionamento restaurado com nosso Criador'}
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
              author: 'Romanos 5:8',
              text: 'Mas Deus demonstra seu amor por nós: Cristo morreu em nosso favor quando ainda éramos pecadores.'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1658512341640-2db6ae31906b?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGpvaG4lMjAzJTNBMTZ8ZW58MHx8MHx8fDA%3D',
              bgColor: '#050507',
              author: 'João 3:16',
              text: 'Porque Deus tanto amou o mundo que deu o seu Filho Unigênito, para que todo o que nele crer não pereça, mas tenha a vida eterna.'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1586490110711-7e174d0d043f?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8am9obiUyMDMlM0ExNnxlbnwwfHwwfHx8MA%3D%3D',
              bgColor: '#5B5A5C',
              author: '1 Pedro 2:24',
              text: 'Ele mesmo levou em seu corpo os nossos pecados sobre o madeiro, para que morrêssemos para os pecados e vivêssemos para a justiça; por suas feridas vocês foram curados.'
            }
          ]}
          freeResource={{
            imageUrl:
              'https://images.unsplash.com/photo-1650658720644-e1588bd66de3?w=900&auto=format&fit=crop&q=60',
            bgColor: '#5F4C5E',
            subtitle: 'Recursos Gratuitos',
            title: 'Quer entender mais sobre o sacrifício de Jesus?',
            buttonText: 'Participe do Nosso Estudo Bíblico'
          }}
        />

        <CollectionsVideoContent
          contentId="did-jesus-come-back-from-the-dead/portuguese-brazil"
          subtitle={'Jesus Voltou dos Mortos?'}
          title={'A Verdade Sobre a Ressurreição de Jesus'}
          description={
            'Jesus disse às pessoas que Ele morreria e depois voltaria à vida. Este curto filme explica os detalhes em torno da morte e ressurreição de Jesus. Seus seguidores mais próximos lutaram para acreditar, mas testemunhas oculares confirmaram a verdade: Ele ressuscitou. A notícia de Sua ressurreição se espalhou pelo mundo, mudando vidas para sempre. Por causa dessas testemunhas, podemos ter confiança na realidade da ressurreição de Jesus.'
          }
          mutePage={mutePage}
          setMutePage={setMutePage}
          questionsTitle="Perguntas relacionadas"
          askButtonText="Faça a sua"
          bibleQuotesTitle="Citações bíblicas"
          quizButtonText="Qual é seu próximo passo de fé?"
          shareButtonText="Compartilhar"
          shareDataTitle={shareDataTitle}
          questions={[
            {
              id: 1,
              question:
                'Como sabemos que Jesus realmente morreu e ressuscitou?',
              answer: (
                <>
                  <p>
                    {
                      'Existem fortes evidências históricas e bíblicas da morte e ressurreição de Jesus:'
                    }
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>
                      {
                        'Soldados romanos confirmaram Sua morte antes do sepultamento'
                      }
                    </li>
                    <li>{'O túmulo de Jesus foi selado e guardado'}</li>
                    <li>
                      {
                        'Centenas de testemunhas viram Jesus vivo após Sua ressurreição'
                      }
                    </li>
                    <li>
                      {
                        'Seus discípulos, antes temerosos, pregaram corajosamente e morreram por esta verdade'
                      }
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 2,
              question: 'Por que a ressurreição de Jesus é importante?',
              answer: (
                <>
                  <p>{'A ressurreição é central para a fé cristã porque:'}</p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>
                      {'Prova a vitória de Jesus sobre o pecado e a morte'}
                    </li>
                    <li>{'Cumpre as profecias sobre o Messias'}</li>
                    <li>{'Confirma que Jesus é o Filho de Deus'}</li>
                    <li>{'Dá aos crentes esperança de vida eterna com Ele'}</li>
                  </ul>
                </>
              )
            },
            {
              id: 3,
              question:
                'Como devemos responder à morte e ressurreição de Jesus?',
              answer: (
                <>
                  <p>
                    {
                      'A ressurreição de Jesus exige uma resposta pessoal. Podemos:'
                    }
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>{'Crer nEle como nosso Salvador e Senhor'}</li>
                    <li>
                      {'Arrepender-nos do pecado e seguir Seus ensinamentos'}
                    </li>
                    <li>
                      {
                        'Compartilhar as boas novas de Sua ressurreição com outros'
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
                'https://images.unsplash.com/photo-1482424917728-d82d29662023?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjN8fGNocmlzdHxlbnwwfHwwfHx8MA%3D%3D',
              bgColor: '#060606',
              author: 'Romanos 5:8',
              text: 'Mas Deus demonstra seu amor por nós: Cristo morreu em nosso favor quando ainda éramos pecadores.'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1658512341640-2db6ae31906b?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGpvaG4lMjAzJTNBMTZ8ZW58MHx8MHx8fDA%3D',
              bgColor: '#050507',
              author: 'João 3:16',
              text: 'Porque Deus tanto amou o mundo que deu o seu Filho Unigênito, para que todo o que nele crer não pereça, mas tenha a vida eterna.'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1586490110711-7e174d0d043f?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8am9obiUyMDMlM0ExNnxlbnwwfHwwfHx8MA%3D%3D',
              bgColor: '#5B5A5C',
              author: '1 Pedro 2:24',
              text: 'Ele mesmo levou em seu corpo os nossos pecados sobre o madeiro, para que morrêssemos para os pecados e vivêssemos para a justiça; por suas feridas vocês foram curados.'
            }
          ]}
          freeResource={{
            imageUrl:
              'https://images.unsplash.com/photo-1650658720644-e1588bd66de3?w=900&auto=format&fit=crop&q=60',
            bgColor: '#5F4C5E',
            subtitle: 'Recursos Gratuitos',
            title: 'Quer entender mais sobre a ressurreição?',
            buttonText: 'Participe do Nosso Estudo Bíblico'
          }}
        />

        <CollectionVideoContentCarousel
          id="new-believer-course"
          subtitle={'Curso para Novos Crentes'}
          title={'Curso para Novos Crentes'}
          description={
            'Se você já se perguntou sobre o que é o cristianismo, ou que tipo de estilo de vida ele nos permite viver, o Curso para Novos Crentes existe para ajudá-lo a entender o Evangelho e viver sua vida em resposta a ele.'
          }
          contentId="1-the-simple-gospel/portuguese-brazil"
          videoTitle={'1. O Evangelho Simples'}
          mutePage={mutePage}
          setMutePage={setMutePage}
          seeAllText="Ver Todos"
          shortVideoText="Vídeo Curto"
          slides={[
            {
              contentId: '1-the-simple-gospel/portuguese-brazil',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/8_NBC01.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#FF9A8E',
              title: '1. O Evangelho Simples'
            },
            {
              contentId: '2-the-blood-of-jesus/portuguese-brazil',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/8_NBC02.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#D4BD20',
              title: '2. O Sangue de Jesus'
            },
            {
              contentId: '3-life-after-death/portuguese-brazil',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/8_NBC03.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#FBAB2C',
              title: '3. Vida Após a Morte'
            },
            {
              contentId: '4-god-forgiveness/portuguese-brazil',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/8_NBC04.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#BD862D',
              title: '4. O Perdão de Deus'
            },
            {
              contentId: '5-savior-lord-and-friend/portuguese-brazil',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/8_NBC05.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#3C7B86',
              title: '5. Salvador, Senhor e Amigo'
            },
            {
              contentId: '6-being-made-new/portuguese-brazil',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/8_NBC06.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#02B9B6',
              title: '6. Sendo Renovado'
            },
            {
              contentId: '7-living-for-god/portuguese-brazil',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/8_NBC07.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#243856',
              title: '7. Vivendo para Deus'
            },
            {
              contentId: '8-the-bible/portuguese-brazil',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/8_NBC08.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#FCB02D',
              title: '8. A Bíblia'
            },
            {
              contentId: '9-prayer/portuguese-brazil',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/8_NBC09.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#3C7B86',
              title: '9. Oração'
            },
            {
              contentId: '10-church/portuguese-brazil',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/8_NBC10.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#EB8311',
              title: '10. Igreja'
            }
          ]}
        />

        <CollectionsVideoContent
          contentId="invitation-to-know-jesus-personally/portuguese-brazil"
          subtitle={'Você está pronto para dar o próximo passo de fé?'}
          title={'Convite para Conhecer Jesus Pessoalmente'}
          description={
            'O convite está aberto a todos. Significa voltar-se para Deus e confiar em Jesus com nossas vidas e para perdoar nossos pecados. Podemos falar com Ele em oração quando estivermos prontos para nos tornar seguidores de Jesus.'
          }
          mutePage={mutePage}
          setMutePage={setMutePage}
          questionsTitle="Perguntas relacionadas"
          askButtonText="Faça a sua"
          bibleQuotesTitle="Citações bíblicas"
          quizButtonText="Qual é o seu próximo passo de fé?"
          shareButtonText="Compartilhar"
          shareDataTitle={shareDataTitle}
          questions={[
            {
              id: 1,
              question: 'Por que preciso de salvação se sou uma boa pessoa?',
              answer: (
                <>
                  <p>
                    {
                      'A Bíblia diz: "Não há um justo, nem um sequer" (Romanos 3:10). O padrão de Deus é a perfeição, e todos pecaram e estão destituídos da glória de Deus (Romanos 3:23). Ser bom pelos padrões humanos não é suficiente para remover a culpa do pecado. A salvação não é conquistada por boas obras, mas recebida pela graça através da fé em Jesus (Efésios 2:8-9). Somente Seu sacrifício pode nos limpar e nos tornar justos diante de Deus.'
                    }
                  </p>
                </>
              )
            },
            {
              id: 2,
              question:
                'Por que Jesus teve que morrer? Deus não poderia simplesmente nos perdoar?',
              answer: (
                <>
                  <p>
                    {
                      'Deus é santo e justo, e a Bíblia diz: "O salário do pecado é a morte" (Romanos 6:23). O pecado nos separa de Deus, e a justiça exige uma penalidade. Jesus morreu em nosso lugar como um sacrifício perfeito para satisfazer a justiça de Deus e mostrar Seu amor. Hebreus 9:22 diz: "Sem derramamento de sangue não há perdão". Jesus pagou a dívida que não podíamos pagar, e através Dele, o perdão é oferecido.'
                    }
                  </p>
                </>
              )
            },
            {
              id: 3,
              question:
                'Se Jesus ressuscitou dos mortos, por que nem todos creem nEle?',
              answer: (
                <>
                  <p>
                    {
                      'Muitos rejeitam Jesus porque amam mais as trevas do que a luz (João 3:19). Crer em Jesus requer humildade, arrependimento e rendição. Alguns são cegados pelo orgulho, pecado ou distrações do mundo (2 Coríntios 4:4). Outros não ouviram verdadeiramente o Evangelho ou endureceram seus corações. A fé é uma resposta ao chamado de Deus, mas Ele não força ninguém a crer (Apocalipse 3:20).'
                    }
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
              author: 'João 1:29',
              text: 'Eis o Cordeiro de Deus, que tira o pecado do mundo!'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1522442676585-c751dab71864?w=900&auto=format&fit=crop&q=60',
              bgColor: '#A88E78',
              author: 'Romanos 6:23',
              text: 'Porque o salário do pecado é a morte, mas o dom gratuito de Deus é a vida eterna em Cristo Jesus, nosso Senhor.'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1678181896030-11cf0237d704?w=900&auto=format&fit=crop&q=60',
              bgColor: '#72593A',
              author: 'Apocalipse 3:20',
              text: 'Eis que estou à porta e bato. Se alguém ouvir a minha voz e abrir a porta, entrarei e cearei com ele, e ele comigo.'
            }
          ]}
          freeResource={{
            imageUrl:
              'https://images.unsplash.com/photo-1650658720644-e1588bd66de3?w=900&auto=format&fit=crop&q=60',
            bgColor: '#5F4C5E',
            subtitle: 'Recursos Gratuitos',
            title: 'Quer aprofundar seu entendimento sobre a vida de Jesus?',
            buttonText: 'Participe do Nosso Estudo Bíblico'
          }}
        />
      </CollectionsPageContent>
    </PageWrapper>
  )
}
