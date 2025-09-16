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
import { CollectionShowcaseSection } from '../../CollectionShowcaseSection'
import { ContainerHero } from '../../ContainerHero'
import { collectionShowcaseSources } from '../../collectionShowcaseConfig'

export function CollectionsPage(): ReactElement {
  const [mutePage, setMutePage] = useState(true)

  // Content items data with contentId that will match the CollectionsVideoContent IDs
  const navigationContentItems: ContentItem[] = [
    {
      contentId: 'easter-explained/spanish-latin-american',
      title: 'El Verdadero Significado de la Pascua',
      category: 'Video Corto',
      image:
        'https://images.unsplash.com/photo-1521106581851-da5b6457f674?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGVhc3RlcnxlbnwwfHwwfHx8MA%3D%3D',
      bgColor: '#1A1815'
    },
    {
      contentId: 'my-last-day/spanish-latin-american',
      title:
        'La última hora de la vida de Jesús desde el punto de vista de un criminal',
      category: 'Video Corto',
      image:
        'https://images.unsplash.com/photo-1522442676585-c751dab71864?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dG9yYWh8ZW58MHx8MHx8fDA%3D',
      bgColor: '#A88E78'
    },
    {
      contentId: 'why-did-jesus-have-to-die/spanish-latin-american',
      title: 'El Propósito del Sacrificio de Jesús',
      category: 'Video Corto',
      image:
        'https://images.unsplash.com/photo-1591561582301-7ce6588cc286?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8YnVubnl8ZW58MHx8MHx8fDA%3D',
      bgColor: '#62884C'
    },
    {
      contentId: 'did-jesus-come-back-from-the-dead/spanish-latin-american',
      title: 'La Verdad Sobre la Resurrección de Jesús',
      category: 'Video Corto',
      image:
        'https://images.unsplash.com/photo-1650658720644-e1588bd66de3?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cHJvcGhlY2llc3xlbnwwfHwwfHx8MA%3D%3D',
      bgColor: '#5F4C5E'
    },
    {
      contentId: 'the-story-short-film/spanish-latin-american',
      title: 'La Historia: Cómo Todo Comenzó y Cómo Nunca Terminará',
      category: 'Video Corto',
      image:
        'https://images.unsplash.com/photo-1678181896030-11cf0237d704?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGplc3VzJTIwcmlzZW58ZW58MHx8MHx8fDA%3D',
      bgColor: '#72593A'
    },
    {
      contentId: 'chosen-witness/spanish-latin-american',
      title: 'María Magdalena: Una Vida Transformada por Jesús',
      category: 'Video Corto',
      image:
        'https://images.unsplash.com/photo-1606876538216-0c70a143dd77?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8amVzdXMlMjBjcm9zc3xlbnwwfHwwfHx8MA%3D%3D',
      bgColor: '#1C160B'
    }
  ]

  const shareDataTitle =
    '👋 Mira estos videos sobre los orígenes de la Pascua. Pensé que te gustarían.'

  return (
    <PageWrapper
      hero={
        <ContainerHero
          title="Pascua"
          descriptionBeforeYear="Pascua"
          descriptionAfterYear="videos y recursos sobre la Cuaresma, la Semana Santa, la Resurrección"
          feedbackButtonLabel="Dar Comentarios"
        />
      }
      hideHeader
      hideFooter
    >
      <CollectionsPageContent>
        <CollectionNavigationCarousel contentItems={navigationContentItems} />
        <CollectionIntroText
          title="La verdadera historia de la Pascua"
          subtitle="¿Cuestionando? ¿Buscando? Descubre el verdadero poder de la Pascua."
          firstParagraph={{
            beforeHighlight:
              'Más allá de los huevos y conejos está la historia de ',
            highlightedText: 'la vida, muerte y resurrección de Jesús.',
            afterHighlight:
              ' El verdadero poder de la Pascua va más allá de los servicios religiosos y rituales — y llega hasta la razón misma por la que los humanos necesitan un Salvador.'
          }}
          secondParagraph="Los Evangelios son sorprendentemente honestos sobre las emociones que Jesús experimentó — Su profunda angustia porque uno de Sus amigos más cercanos negó conocerlo, y la incredulidad de los otros discípulos en Su resurrección — emociones crudas que reflejan nuestras propias luchas."
          easterDatesTitle="¿Cuándo se celebra la Pascua en {year}?"
          thirdParagraph="Explora nuestra colección de videos y recursos interactivos que te invitan a conocer la historia auténtica — una que cambió la historia y continúa transformando vidas hoy.
Porque la celebración más grande en la historia de la humanidad va mucho más allá de las tradiciones — se trata del poder de la resurrección"
          westernEasterLabel="Pascua Occidental (Católica/Protestante)"
          orthodoxEasterLabel="Ortodoxa"
          passoverLabel="Pascua Judía"
          locale="es-ES"
        />
        <CollectionsVideoContent
          contentId="easter-explained/spanish-latin-american"
          subtitle={'La Victoria de Jesús Sobre el Pecado y la Muerte'}
          title={'El Verdadero Significado de la Pascua'}
          description={
            'La Pascua es más que huevos y conejitos—se trata de Jesús y Su amor asombroso por nosotros. Él murió en la cruz por nuestros pecados y resucitó, mostrando Su poder sobre el pecado y la muerte. Gracias a Él, podemos tener perdón y la promesa de vida eterna. La Pascua es un tiempo para celebrar esta gran esperanza y el increíble regalo de Dios para nosotros.'
          }
          mutePage={mutePage}
          setMutePage={setMutePage}
          showDivider={false}
          questionsTitle="Preguntas relacionadas"
          askButtonText="Haz la tuya"
          bibleQuotesTitle="Citas bíblicas"
          quizButtonText="¿Cuál es tu próximo paso de fe?"
          shareButtonText="Compartir"
          shareDataTitle={shareDataTitle}
          questions={[
            {
              id: 1,
              question:
                '¿Cómo puedo confiar en la soberanía de Dios cuando el mundo se siente tan caótico?',
              answer: (
                <>
                  <p>
                    {
                      'Incluso en tiempos de caos e incertidumbre, podemos confiar en la soberanía de Dios porque:'
                    }
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>
                      {
                        'Dios permanece en control incluso cuando las circunstancias parecen fuera de control'
                      }
                    </li>
                    <li>
                      {'Sus propósitos son más altos que nuestro entendimiento'}
                    </li>
                    <li>
                      {
                        'Él promete hacer que todas las cosas cooperen para bien de los que lo aman'
                      }
                    </li>
                    <li>
                      {
                        'La Biblia muestra innumerables ejemplos de Dios trayendo orden del caos'
                      }
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 2,
              question:
                '¿Por qué la Pascua es la fiesta cristiana más importante?',
              answer: (
                <>
                  <p>{'La Pascua es central para la fe cristiana porque:'}</p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>
                      {
                        'Marca la resurrección de Jesús, demostrando Su victoria sobre la muerte'
                      }
                    </li>
                    <li>
                      {
                        'Cumple las profecías del Antiguo Testamento sobre el Mesías'
                      }
                    </li>
                    <li>{'Demuestra el poder de Dios para dar nueva vida'}</li>
                    <li>
                      {
                        'Proporciona esperanza para nuestra propia resurrección y vida eterna'
                      }
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 3,
              question:
                '¿Qué sucedió durante los tres días entre la muerte y resurrección de Jesús?',
              answer: (
                <>
                  <p>
                    {'La Biblia nos dice que ocurrieron varios eventos clave:'}
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>
                      {
                        'El cuerpo de Jesús fue colocado en una tumba y custodiado por soldados romanos'
                      }
                    </li>
                    <li>
                      {
                        'Sus seguidores estaban de luto y esperaban en incertidumbre'
                      }
                    </li>
                    <li>
                      {
                        'Según las Escrituras, Él descendió al reino de los muertos'
                      }
                    </li>
                    <li>
                      {'Al tercer día, resucitó victorioso sobre la muerte'}
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
              author: 'Apóstol Pablo',
              text: '"¿Dónde está, oh muerte, tu victoria? ¿Dónde, oh muerte, tu aguijón?" El aguijón de la muerte es el pecado, y el poder del pecado es la ley. ¡Pero gracias a Dios, que nos da la victoria por medio de nuestro Señor Jesucristo!'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1522442676585-c751dab71864?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dG9yYWh8ZW58MHx8MHx8fDA%3D',
              bgColor: '#A88E78',
              author: 'Apóstol Pablo',
              text: '"¿Dónde está, oh muerte, tu victoria? ¿Dónde, oh muerte, tu aguijón?" El aguijón de la muerte es el pecado, y el poder del pecado es la ley. ¡Pero gracias a Dios, que nos da la victoria por medio de nuestro Señor Jesucristo!'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1678181896030-11cf0237d704?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGplc3VzJTIwcmlzZW58ZW58MHx8MHx8fDA%3D',
              bgColor: '#72593A',
              author: 'Apóstol Pablo',
              text: '"¿Dónde está, oh muerte, tu victoria? ¿Dónde, oh muerte, tu aguijón?" El aguijón de la muerte es el pecado, y el poder del pecado es la ley. ¡Pero gracias a Dios, que nos da la victoria por medio de nuestro Señor Jesucristo!'
            }
          ]}
          freeResource={{
            imageUrl:
              'https://images.unsplash.com/photo-1650658720644-e1588bd66de3?w=900&auto=format&fit=crop&q=60',
            bgColor: '#5F4C5E',
            subtitle: 'Recursos Gratuitos',
            title: '¿Quieres profundizar tu comprensión de la Biblia?',
            buttonText: 'Únete a nuestro estudio bíblico'
          }}
        />
        <CollectionShowcaseSection
          id="other-collections"
          sources={collectionShowcaseSources}
          primaryCollectionId="LUMOCollection"
          subtitleOverride="Colección de Videos Bíblicos"
          titleOverride="La historia de la Pascua es una parte clave de un cuadro más grande"
          descriptionOverride="<strong>Nuestra misión</strong> es presentar a las personas la Biblia a través de películas y videos que transmiten fielmente los Evangelios a la vida. Al contar visualmente la historia de Jesús y el amor de Dios por la humanidad, hacemos que las Escrituras sean más accesibles, atractivas y fáciles de entender."
          ctaLabelOverride="Ver"
        />
        <CollectionsVideoContent
          contentId="my-last-day/spanish-latin-american"
          subtitle={'Mi Último Día'}
          title={
            'La última hora de la vida de Jesús desde el punto de vista de un criminal'
          }
          description={
            'Un ladrón condenado observa horrorizado cómo Jesús es brutalmente azotado en el patio de Pilato, mientras los recuerdos de sus propios crímenes inundan su mente. ¿Por qué castigarían a un hombre inocente? El rugido de la multitud sella su destino: la crucifixión. Obligados a cargar sus cruces hasta el Gólgota, él tropieza junto a Jesús, aplastado por el peso de su pasado y su sentencia. Mientras los clavos atraviesan la carne y el cielo se oscurece, hace una súplica desesperada: ¿podría ser este realmente el Mesías? En sus últimos momentos, Jesús le da una promesa inesperada: Hoy estarás conmigo en el paraíso. Observa cómo se desarrolla este poderoso momento.'
          }
          mutePage={mutePage}
          setMutePage={setMutePage}
          questionsTitle="Preguntas relacionadas"
          askButtonText="Haz la tuya"
          bibleQuotesTitle="Citas bíblicas"
          shareButtonText="Compartir"
          shareDataTitle={shareDataTitle}
          quizButtonText="¿Cuál es tu próximo paso de fe?"
          questions={[
            {
              id: 1,
              question:
                '¿Por qué Jesús perdonaría a un criminal tan fácilmente?',
              answer: (
                <>
                  <p>
                    {
                      'El perdón de Jesús es una demostración de la gracia y misericordia de Dios. El ladrón en la cruz reconoció la inocencia y divinidad de Jesús, pidiendo humildemente ser recordado en Su reino. La respuesta de Jesús muestra:'
                    }
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>{'La salvación se basa en la fe, no en las obras'}</li>
                    <li>
                      {
                        'La misericordia de Dios se extiende a todos, incluso a los peores pecadores'
                      }
                    </li>
                    <li>
                      {
                        'Jesús vino a salvar a los perdidos, incluidos criminales y marginados'
                      }
                    </li>
                    <li>
                      {
                        'La gracia se da libremente a quienes la buscan sinceramente'
                      }
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 2,
              question:
                'Si Jesús era inocente, ¿por qué no se salvó a sí mismo en lugar de aceptar la muerte?',
              answer: (
                <>
                  <p>
                    {
                      'Jesús aceptó voluntariamente la muerte porque era parte del plan de Dios para la redención. Su sacrificio era necesario para cumplir la profecía y traer salvación. Razones clave incluyen:'
                    }
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>
                      {
                        'Su muerte cumplió las profecías del Antiguo Testamento (Isaías 53)'
                      }
                    </li>
                    <li>
                      {
                        'Él cargó con el castigo por los pecados de la humanidad'
                      }
                    </li>
                    <li>
                      {
                        'Al no salvarse a sí mismo, demostró su máximo amor y obediencia a Dios'
                      }
                    </li>
                    <li>
                      {
                        'Su resurrección probó Su victoria sobre el pecado y la muerte'
                      }
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 3,
              question:
                "¿Qué significa realmente estar 'en el paraíso' con Jesús?",
              answer: (
                <>
                  <p>
                    {
                      'Estar en el paraíso con Jesús significa vida eterna en la presencia de Dios. Al ladrón en la cruz se le aseguró su lugar con Jesús en el cielo debido a su fe. Aspectos importantes de esta promesa incluyen:'
                    }
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>
                      {
                        'Significa presencia inmediata con Cristo después de la muerte'
                      }
                    </li>
                    <li>{'Confirma la salvación solo por fe'}</li>
                    <li>{'Ofrece esperanza de gozo y paz eternos'}</li>
                    <li>
                      {
                        'Las palabras de Jesús afirman la realidad de la vida más allá de este mundo'
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
              author: 'Jesús (Lucas 23:43)',
              text: 'De cierto te digo que hoy estarás conmigo en el paraíso.'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1709471875678-0b3627a3c099?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzJ8fGZvcmdpdmV8ZW58MHx8MHx8fDA%3D',
              bgColor: '#031829',
              author: 'Jesús (Lucas 23:34)',
              text: 'Padre, perdónalos, porque no saben lo que hacen.'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1595119591974-a9bd1532c1b0?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGNocmlzdHxlbnwwfHwwfHx8MA%3D%3D',
              bgColor: '#0E0D0F',
              author: 'Isaías 53:5',
              text: 'Mas él herido fue por nuestras rebeliones, molido por nuestros pecados; el castigo de nuestra paz fue sobre él, y por su llaga fuimos nosotros curados.'
            }
          ]}
          freeResource={{
            imageUrl:
              'https://images.unsplash.com/photo-1650658720644-e1588bd66de3?w=900&auto=format&fit=crop&q=60',
            bgColor: '#5F4C5E',
            subtitle: 'Recursos Gratuitos',
            title: '¿Quieres profundizar tu comprensión de la Biblia?',
            buttonText: 'Únete a nuestro estudio bíblico'
          }}
        />

        <CollectionVideoContentCarousel
          id="easter-documentary-series"
          subtitle={'Serie Documental de Pascua'}
          title={'¿Venció Jesús a la Muerte?'}
          description={
            'Embárcate en esta aventura para viajar en el tiempo al siglo I y examinar otras teorías sobre la tumba vacía de Jesús.'
          }
          contentId="31-how-did-jesus-die/spanish-latin-american"
          videoTitle={'¿Cómo Murió Jesús?'}
          mutePage={mutePage}
          setMutePage={setMutePage}
          seeAllText="Ver Todos"
          shortVideoText="Video Corto"
          slides={[
            {
              contentId: '31-how-did-jesus-die/spanish-latin-american',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/7_0-nfs0301.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#161817',
              title: '¿Cómo Murió Jesús?'
            },
            {
              contentId: '32-what-happened-next/spanish-latin-american',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/7_0-nfs0302.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#000906',
              title: '¿Qué Pasó Después?'
            },
            {
              contentId: '33-do-the-facts-stack-up/spanish-latin-american',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/7_0-nfs0303.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#2B2018',
              title: '¿Por qué se celebra la Pascua con conejitos?'
            }
          ]}
        />
        <CollectionsVideoContent
          contentId="why-did-jesus-have-to-die/spanish-latin-american"
          subtitle={'¿Por Qué Jesús Tuvo Que Morir?'}
          title={'El Propósito del Sacrificio de Jesús'}
          description={
            'Dios creó a los humanos para estar espiritual y relacionalmente conectados con Él, pero ¿cómo podemos guardar los mandamientos de Dios? ¿Cómo podemos vivir sin vergüenza? No podemos restaurarnos a nosotros mismos al honor. Parecería que estamos condenados, excepto que Dios no quiere que Su creación muera. Él es misericordioso y amoroso, y quiere que seamos restaurados, viviendo con Él en plenitud de vida.'
          }
          mutePage={mutePage}
          setMutePage={setMutePage}
          questionsTitle="Preguntas relacionadas"
          askButtonText="Haz la tuya"
          bibleQuotesTitle="Citas bíblicas"
          shareButtonText="Compartir"
          shareDataTitle={shareDataTitle}
          quizButtonText="¿Cuál es tu próximo paso de fe?"
          questions={[
            {
              id: 1,
              question: '¿Por qué fue necesaria la muerte de Jesús?',
              answer: (
                <>
                  <p>
                    {
                      'La muerte de Jesús fue necesaria para cumplir el plan de redención de Dios. Debido al pecado, la humanidad estaba separada de Dios, pero el sacrificio de Jesús proporcionó el camino para la reconciliación. He aquí por qué Su muerte era esencial:'
                    }
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>
                      {'El pecado crea una barrera entre nosotros y Dios'}
                    </li>
                    <li>
                      {'La justicia de Dios requiere un pago por el pecado'}
                    </li>
                    <li>
                      {'Jesús, como sacrificio perfecto, tomó nuestro lugar'}
                    </li>
                    <li>
                      {'A través de Su muerte, recibimos perdón y restauración'}
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 2,
              question:
                'Si Dios es amoroso, ¿por qué no perdonó el pecado sin el sacrificio de Jesús?',
              answer: (
                <>
                  <p>
                    {
                      'El amor y la justicia de Dios van de la mano. Aunque Él desea perdonar, también mantiene la justicia. El sacrificio de Jesús fue la máxima expresión de ambos:'
                    }
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>
                      {'El perdón requiere un costo, y Jesús pagó ese costo'}
                    </li>
                    <li>
                      {
                        'Su muerte satisfizo la justicia de Dios mientras mostraba Su misericordia'
                      }
                    </li>
                    <li>
                      {
                        'A través de Jesús, Dios demostró Su amor por la humanidad'
                      }
                    </li>
                    <li>
                      {
                        'Su sacrificio nos permite ser restaurados sin comprometer la justicia divina'
                      }
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 3,
              question:
                '¿Cómo afecta la muerte de Jesús nuestra relación con Dios?',
              answer: (
                <>
                  <p>
                    {
                      'La muerte y resurrección de Jesús abrieron el camino para que seamos reconciliados con Dios. A través de Él, podemos:'
                    }
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>{'Experimentar perdón y libertad del pecado'}</li>
                    <li>{'Tener acceso directo a Dios a través de Cristo'}</li>
                    <li>{'Recibir el don de la vida eterna'}</li>
                    <li>
                      {'Vivir en una relación restaurada con nuestro Creador'}
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
              text: 'Mas Dios muestra su amor para con nosotros, en que siendo aún pecadores, Cristo murió por nosotros.'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1658512341640-2db6ae31906b?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGpvaG4lMjAzJTNBMTZ8ZW58MHx8MHx8fDA%3D',
              bgColor: '#050507',
              author: 'Juan 3:16',
              text: 'Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1586490110711-7e174d0d043f?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8am9obiUyMDMlM0ExNnxlbnwwfHwwfHx8MA%3D%3D',
              bgColor: '#5B5A5C',
              author: '1 Pedro 2:24',
              text: 'Él mismo llevó nuestros pecados en su cuerpo sobre el madero, para que nosotros, estando muertos a los pecados, vivamos a la justicia; y por cuya herida fuisteis sanados.'
            }
          ]}
          freeResource={{
            imageUrl:
              'https://images.unsplash.com/photo-1650658720644-e1588bd66de3?w=900&auto=format&fit=crop&q=60',
            bgColor: '#5F4C5E',
            subtitle: 'Recursos Gratuitos',
            title: '¿Quieres entender más sobre el sacrificio de Jesús?',
            buttonText: 'Únete a nuestro estudio bíblico'
          }}
        />

        <CollectionsVideoContent
          contentId="talk-with-nicodemus/spanish-latin-american"
          subtitle={'De la Religión a la Relación'}
          title={'El Evangelio en Una Conversación'}
          description={
            'En una conversación privada por la noche, Nicodemo, un respetado maestro judío, vino a Jesús buscando la verdad. Jesús le dijo que nadie puede ver el reino de Dios a menos que nazca de nuevo. Esta profunda conversación revela el corazón de la misión de Jesús: traer un renacimiento espiritual a través del Espíritu Santo. Descubre lo que significa nacer de nuevo y por qué es esencial para la vida eterna.'
          }
          mutePage={mutePage}
          setMutePage={setMutePage}
          questionsTitle="Preguntas relacionadas"
          askButtonText="Haz la tuya"
          bibleQuotesTitle="Citas bíblicas"
          quizButtonText="¿Cuál es tu próximo paso de fe?"
          shareButtonText="Compartir"
          shareDataTitle={shareDataTitle}
          questions={[
            {
              id: 1,
              question: '¿Qué significa nacer de nuevo?',
              answer: (
                <>
                  <p>
                    {
                      "'Nacer de nuevo' significa experimentar un renacimiento espiritual. Jesús le explicó a Nicodemo que este renacimiento no es físico sino espiritual—nacer del agua y del Espíritu."
                    }
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>{'Es una obra del Espíritu Santo'}</li>
                    <li>{'Implica creer en Jesús como Salvador'}</li>
                    <li>{'Trae nueva vida y una nueva relación con Dios'}</li>
                  </ul>
                </>
              )
            },
            {
              id: 2,
              question:
                '¿Por qué Jesús le dijo a Nicodemo que debía nacer de nuevo?',
              answer: (
                <>
                  <p>
                    {
                      'Jesús quería que Nicodemo entendiera que el conocimiento religioso y las buenas obras no son suficientes. Para entrar en el reino de Dios, se necesita una transformación interior completa.'
                    }
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>
                      {'Muestra nuestra necesidad de renovación espiritual'}
                    </li>
                    <li>{'Señala la salvación por fe, no por obras'}</li>
                    <li>{'Enfatiza el papel del Espíritu Santo'}</li>
                  </ul>
                </>
              )
            },
            {
              id: 3,
              question: '¿Cómo puede alguien nacer de nuevo?',
              answer: (
                <>
                  <p>
                    {
                      'Jesús explicó que nacer de nuevo viene a través de creer en Él. Es un paso personal de fe que resulta en una nueva vida en Dios.'
                    }
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>{'Creer en Jesucristo como el Hijo de Dios'}</li>
                    <li>{'Aceptar Su sacrificio por tus pecados'}</li>
                    <li>
                      {'Invitar al Espíritu Santo a renovar tu corazón y mente'}
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
              author: 'Juan 3:3',
              text: 'Respondió Jesús y le dijo: "De cierto, de cierto te digo, que el que no naciere de nuevo, no puede ver el reino de Dios."'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1574957973698-418ac4c877af?w=1400&auto=format&fit=crop&q=60',
              bgColor: '#1A1A1D',
              author: 'Juan 3:5',
              text: 'Respondió Jesús: "De cierto, de cierto te digo, que el que no naciere de agua y del Espíritu, no puede entrar en el reino de Dios."'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=1400&auto=format&fit=crop&q=60',
              bgColor: '#3E3E42',
              author: 'Juan 3:16',
              text: 'Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.'
            }
          ]}
          freeResource={{
            imageUrl:
              'https://images.unsplash.com/photo-1650658720644-e1588bd66de3?w=900&auto=format&fit=crop&q=60',
            bgColor: '#5F4C5E',
            subtitle: 'Recursos Gratuitos',
            title: '¿Quieres entender más sobre la resurrección?',
            buttonText: 'Únete a nuestro estudio bíblico'
          }}
        />

        <CollectionsVideoContent
          contentId="did-jesus-come-back-from-the-dead/spanish-latin-american"
          subtitle={'¿Volvió Jesús de la Muerte?'}
          title={'La Verdad Sobre la Resurrección de Jesús'}
          description={
            'Jesús le dijo a la gente que moriría y luego volvería a la vida. Este cortometraje explica los detalles que rodean la muerte y resurrección de Jesús. Sus seguidores más cercanos lucharon por creer, pero los testigos oculares confirmaron la verdad: Él resucitó. La noticia de Su resurrección se extendió por todo el mundo, cambiando vidas para siempre. Gracias a estos testigos, podemos tener confianza en la realidad de la resurrección de Jesús.'
          }
          mutePage={mutePage}
          setMutePage={setMutePage}
          questionsTitle="Preguntas relacionadas"
          askButtonText="Haz la tuya"
          bibleQuotesTitle="Citas bíblicas"
          quizButtonText="¿Cuál es tu próximo paso de fe?"
          shareButtonText="Compartir"
          shareDataTitle={shareDataTitle}
          questions={[
            {
              id: 1,
              question: '¿Cómo sabemos que Jesús realmente murió y resucitó?',
              answer: (
                <>
                  <p>
                    {
                      'Hay fuertes evidencias históricas y bíblicas de la muerte y resurrección de Jesús:'
                    }
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>
                      {
                        'Los soldados romanos confirmaron Su muerte antes de enterrarlo'
                      }
                    </li>
                    <li>{'La tumba de Jesús fue sellada y vigilada'}</li>
                    <li>
                      {
                        'Cientos de testigos vieron a Jesús vivo después de Su resurrección'
                      }
                    </li>
                    <li>
                      {
                        'Sus discípulos, que antes tenían miedo, predicaron valientemente y murieron por esta verdad'
                      }
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 2,
              question: '¿Por qué es importante la resurrección de Jesús?',
              answer: (
                <>
                  <p>
                    {'La resurrección es central para la fe cristiana porque:'}
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>
                      {
                        'Demuestra la victoria de Jesús sobre el pecado y la muerte'
                      }
                    </li>
                    <li>{'Cumple las profecías sobre el Mesías'}</li>
                    <li>{'Confirma que Jesús es el Hijo de Dios'}</li>
                    <li>
                      {'Da a los creyentes esperanza de vida eterna con Él'}
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 3,
              question:
                '¿Cómo debemos responder a la muerte y resurrección de Jesús?',
              answer: (
                <>
                  <p>
                    {
                      'La resurrección de Jesús exige una respuesta personal. Podemos:'
                    }
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>{'Creer en Él como nuestro Salvador y Señor'}</li>
                    <li>
                      {'Arrepentirnos del pecado y seguir Sus enseñanzas'}
                    </li>
                    <li>
                      {
                        'Compartir las buenas nuevas de Su resurrección con otros'
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
              text: 'Mas Dios muestra su amor para con nosotros, en que siendo aún pecadores, Cristo murió por nosotros.'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1658512341640-2db6ae31906b?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGpvaG4lMjAzJTNBMTZ8ZW58MHx8MHx8fDA%3D',
              bgColor: '#050507',
              author: 'Juan 3:16',
              text: 'Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1586490110711-7e174d0d043f?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8am9obiUyMDMlM0ExNnxlbnwwfHwwfHx8MA%3D%3D',
              bgColor: '#5B5A5C',
              author: '1 Pedro 2:24',
              text: 'Él mismo llevó nuestros pecados en su cuerpo sobre el madero, para que nosotros, estando muertos a los pecados, vivamos a la justicia; y por cuya herida fuisteis sanados.'
            }
          ]}
          freeResource={{
            imageUrl:
              'https://images.unsplash.com/photo-1650658720644-e1588bd66de3?w=900&auto=format&fit=crop&q=60',
            bgColor: '#5F4C5E',
            subtitle: 'Recursos Gratuitos',
            title: '¿Quieres entender más sobre la resurrección?',
            buttonText: 'Únete a nuestro estudio bíblico'
          }}
        />

        <CollectionVideoContentCarousel
          id="easter-events-day-by-day"
          subtitle={'Videos Bíblicos'}
          title={'Eventos de Pascua Día a Día'}
          description={
            'Sigue día a día los acontecimientos de la Pascua tal como se describen en el Evangelio de Lucas.'
          }
          contentId="upper-room-teaching/spanish-latin-american"
          videoTitle={'Enseñanza en el Aposento Alto'}
          mutePage={mutePage}
          setMutePage={setMutePage}
          seeAllText="Ver Todos"
          shortVideoText="Video Corto"
          slides={[
            {
              contentId: 'upper-room-teaching/spanish-latin-american',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6143-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#161817',
              title: 'Enseñanza en el Aposento Alto'
            },
            {
              contentId:
                'jesus-is-betrayed-and-arrested/spanish-latin-american',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6144-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#000906',
              title: 'Jesús es Traicionado y Arrestado'
            },
            {
              contentId: 'peter-disowns-jesus/spanish-latin-american',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6145-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#100704',
              title: 'Pedro Niega a Jesús'
            },
            {
              contentId:
                'jesus-is-mocked-and-questioned/spanish-latin-american',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6146-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#0A0E0D',
              title: 'Jesús es Burlado e Interrogado'
            },
            {
              contentId: 'jesus-is-brought-to-pilate/spanish-latin-american',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6147-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#170E07',
              title: 'Jesús es Llevado Ante Pilato'
            },
            {
              contentId: 'jesus-is-brought-to-herod/spanish-latin-american',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6148-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#0F0D03',
              title: 'Jesús es Llevado Ante Herodes'
            },
            {
              contentId: 'jesus-is-sentenced/spanish-latin-american',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6149-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#322314',
              title: 'Jesús es Condenado'
            },
            {
              contentId: 'death-of-jesus/spanish-latin-american',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6155-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#1D1B13',
              title: 'Muerte de Jesús'
            },
            {
              contentId: 'burial-of-jesus/spanish-latin-american',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6156-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#231E1F',
              title: 'Sepultura de Jesús'
            },
            {
              contentId: 'angels-at-the-tomb/spanish-latin-american',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6157-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#1A190E',
              title: 'Ángeles en la Tumba'
            },
            {
              contentId: 'the-tomb-is-empty/spanish-latin-american',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6158-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#151D12',
              title: 'La Tumba está Vacía'
            },
            {
              contentId: 'resurrected-jesus-appears/spanish-latin-american',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6159-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#0B0501',
              title: 'Jesús Resucitado Aparece'
            },
            {
              contentId:
                'great-commission-and-ascension/spanish-latin-american',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6160-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#2B2118',
              title: 'La Gran Comisión y la Ascensión'
            },
            {
              contentId:
                'invitation-to-know-jesus-personally/spanish-latin-american',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6161-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#27160F',
              title: 'Invitación a Conocer a Jesús Personalmente'
            }
          ]}
        />

        <CollectionsVideoContent
          contentId="the-story-short-film/spanish-latin-american"
          subtitle={'Cortometraje La Historia'}
          title={'La Historia: Cómo Todo Comenzó y Cómo Nunca Terminará'}
          description={
            'La Historia es un cortometraje sobre cómo comenzó todo y cómo nunca puede terminar. Esta película comparte la historia general de la Biblia, una historia que redime todas las historias y trae nueva vida a través de la salvación solo en Jesús. Responde a las preguntas más grandes de la vida: ¿De dónde venimos? ¿Qué salió mal? ¿Hay alguna esperanza? ¿Y qué depara el futuro?'
          }
          mutePage={mutePage}
          setMutePage={setMutePage}
          questionsTitle="Preguntas relacionadas"
          askButtonText="Haz la tuya"
          bibleQuotesTitle="Citas bíblicas"
          quizButtonText="¿Cuál es tu próximo paso de fe?"
          shareButtonText="Compartir"
          shareDataTitle={shareDataTitle}
          questions={[
            {
              id: 1,
              question: '¿De dónde vino todo? ¿Hay un propósito en la vida?',
              answer: (
                <>
                  <p>
                    {
                      'La Biblia enseña que todo comenzó con Dios, el Creador del universo. Él habló y todo existió con propósito y diseño. La humanidad fue creada a Su imagen para vivir en armonía con Él, entre sí y con la creación.'
                    }
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>{'Dios creó el mundo con amor y orden'}</li>
                    <li>
                      {
                        'Todo era originalmente perfecto, sin dolor ni sufrimiento'
                      }
                    </li>
                    <li>
                      {
                        'Los humanos fueron diseñados para tener una relación personal con Dios'
                      }
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 2,
              question:
                'Si Dios es bueno, ¿por qué hay tanto sufrimiento en el mundo?',
              answer: (
                <>
                  <p>
                    {
                      'El sufrimiento existe porque el pecado entró en el mundo cuando la humanidad eligió rebelarse contra Dios. Esta desobediencia rompió la perfección original, introduciendo muerte, dolor y separación de Dios.'
                    }
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>
                      {'El pecado trajo sufrimiento, quebrantamiento y muerte'}
                    </li>
                    <li>{'Todos contribuimos al problema del pecado'}</li>
                    <li>
                      {
                        'A pesar de esto, Dios no abandonó a la humanidad—proporcionó un camino para la restauración'
                      }
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 3,
              question:
                '¿Hay alguna esperanza de que el mundo vuelva a estar bien?',
              answer: (
                <>
                  <p>
                    {
                      '¡Sí! Dios envió a Jesús como el rescatador. Jesús vivió una vida perfecta, murió en la cruz para pagar por el pecado y resucitó de entre los muertos para vencer a la muerte misma. A través de Él, podemos ser restaurados a Dios y experimentar una nueva vida.'
                    }
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>{'El sacrificio de Jesús hace posible el perdón'}</li>
                    <li>
                      {'Su resurrección demuestra Su poder sobre la muerte'}
                    </li>
                    <li>
                      {
                        'Aquellos que confían en Jesús reciben nueva vida y una relación restaurada con Dios'
                      }
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 4,
              question:
                '¿Qué sucederá en el futuro? ¿Hay vida después de la muerte?',
              answer: (
                <>
                  <p>
                    {
                      'Según la Biblia, Dios ha prometido un futuro donde restaurará todas las cosas. Aquellos que confían en Jesús vivirán para siempre con Él en un mundo perfecto y renovado. El pecado, el sufrimiento y la muerte ya no existirán.'
                    }
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>{'Dios creará un nuevo cielo y una nueva tierra'}</li>
                    <li>{'No habrá más dolor, sufrimiento o muerte'}</li>
                    <li>{'Jesús volverá para juzgar a vivos y muertos'}</li>
                    <li>
                      {'Todos deben decidir cómo responderán a esta verdad'}
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
              author: 'Génesis 1:1',
              text: 'En el principio creó Dios los cielos y la tierra.'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1513082325166-c105b20374bb?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG1pc3Rha2V8ZW58MHx8MHx8fDA%3D',
              bgColor: '#6C7B80',
              author: 'Romanos 3:23-24',
              text: 'Por cuanto todos pecaron, y están destituidos de la gloria de Dios, siendo justificados gratuitamente por su gracia, mediante la redención que es en Cristo Jesús.'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1524088484081-4ca7e08e3e19?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dGVhcnN8ZW58MHx8MHx8fDA%3D',
              bgColor: '#87695B',
              author: 'Apocalipsis 21:4',
              text: 'Enjugará Dios toda lágrima de los ojos de ellos; y ya no habrá muerte, ni habrá más llanto, ni clamor, ni dolor; porque las primeras cosas pasaron.'
            }
          ]}
          freeResource={{
            imageUrl:
              'https://images.unsplash.com/photo-1650658720644-e1588bd66de3?w=900&auto=format&fit=crop&q=60',
            bgColor: '#5F4C5E',
            subtitle: 'Recursos Gratuitos',
            title: '¿Quieres explorar las grandes preguntas de la vida?',
            buttonText: 'Únete a nuestro estudio bíblico'
          }}
        />
        <CollectionsVideoContent
          contentId="chosen-witness/spanish-latin-american"
          subtitle={'Testigo Elegida'}
          title={'María Magdalena: Una Vida Transformada por Jesús'}
          description={
            'La vida de María Magdalena fue transformada dramáticamente por Jesús, el hombre que cambiaría el mundo para siempre. Antes una marginada, se convirtió en una de Sus seguidoras más devotas. En este cortometraje animado, presencia la vida de Jesús a través de sus ojos—desde su redención hasta el momento en que se convirtió en la primera en presenciar Su resurrección.'
          }
          mutePage={mutePage}
          setMutePage={setMutePage}
          questionsTitle="Preguntas relacionadas"
          askButtonText="Haz la tuya"
          bibleQuotesTitle="Citas bíblicas"
          quizButtonText="¿Cuál es tu próximo paso de fe?"
          shareButtonText="Compartir"
          shareDataTitle={shareDataTitle}
          questions={[
            {
              id: 1,
              question:
                '¿De qué manera te identificas con el personaje principal, María Magdalena?',
              answer: (
                <>
                  <p>
                    {
                      'La historia de María Magdalena es una de transformación y redención. Como muchos de nosotros, llevaba un pasado lleno de luchas, pero Jesús la liberó y le dio un nuevo propósito. Su historia nos enseña:'
                    }
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>
                      {'Jesús ofrece redención sin importar nuestro pasado'}
                    </li>
                    <li>{'La fe en Cristo trae sanidad y propósito'}</li>
                    <li>
                      {'Dios llama a los menos esperados a ser Sus testigos'}
                    </li>
                    <li>{'Encontrarse con Jesús lo cambia todo'}</li>
                  </ul>
                </>
              )
            },
            {
              id: 2,
              question: '¿Por qué crees que los ancianos no aprobaban a Jesús?',
              answer: (
                <>
                  <p>
                    {
                      'Los líderes religiosos se oponían a Jesús porque Sus enseñanzas desafiaban su autoridad y tradiciones. Las razones clave incluyen:'
                    }
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>
                      {
                        'Él daba la bienvenida a pecadores y marginados, alterando las normas sociales'
                      }
                    </li>
                    <li>
                      {
                        'Su afirmación de ser el Hijo de Dios amenazaba su poder'
                      }
                    </li>
                    <li>
                      {
                        'Él enfatizaba la misericordia sobre el legalismo, enfureciendo a quienes dependían de la ley'
                      }
                    </li>
                    <li>
                      {
                        'Sus milagros y creciente influencia perturbaban su control sobre el pueblo'
                      }
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 3,
              question:
                'Después de su resurrección, ¿por qué crees que Jesús eligió hablar primero con María?',
              answer: (
                <>
                  <p>
                    {
                      'La primera aparición de Jesús a María Magdalena fue profundamente significativa. Mostró:'
                    }
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>
                      {'Su cuidado por aquellos que el mundo pasaba por alto'}
                    </li>
                    <li>
                      {
                        'La importancia de la fe y la devoción por encima del estatus'
                      }
                    </li>
                    <li>
                      {
                        'Que las mujeres jugaron un papel vital en Su ministerio y mensaje'
                      }
                    </li>
                    <li>
                      {
                        'Cómo una vida transformada puede convertirse en un poderoso testimonio'
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
              author: 'Lucas 8:2',
              text: 'Y también algunas mujeres que habían sido sanadas de espíritus malignos y de enfermedades: María, que se llamaba Magdalena, de la que habían salido siete demonios.'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1522442676585-c751dab71864?w=900&auto=format&fit=crop&q=60',
              bgColor: '#A88E78',
              author: 'Juan 20:16',
              text: 'Jesús le dijo: "¡María!" Volviéndose ella, le dijo en hebreo: "¡Raboni!" (que quiere decir, Maestro).'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1678181896030-11cf0237d704?w=900&auto=format&fit=crop&q=60',
              bgColor: '#72593A',
              author: 'Marcos 16:9',
              text: 'Habiendo, pues, resucitado Jesús por la mañana, el primer día de la semana, apareció primeramente a María Magdalena, de quien había echado siete demonios.'
            }
          ]}
          freeResource={{
            imageUrl:
              'https://images.unsplash.com/photo-1650658720644-e1588bd66de3?w=900&auto=format&fit=crop&q=60',
            bgColor: '#5F4C5E',
            subtitle: 'Recursos Gratuitos',
            title: '¿Quieres profundizar tu comprensión de la vida de Jesús?',
            buttonText: 'Únete a nuestro estudio bíblico'
          }}
        />

        <CollectionVideoContentCarousel
          id="new-believer-course"
          subtitle={'Curso en Video'}
          title={'Curso para Nuevos Creyentes'}
          description={
            'Si alguna vez te has preguntado de qué se trata el cristianismo, o qué tipo de estilo de vida te permite vivir, el Curso para Nuevos Creyentes existe para ayudarte a entender el Evangelio y vivir tu vida en respuesta a él.'
          }
          contentId="1-the-simple-gospel/spanish-latin-american"
          videoTitle={'1. El Evangelio Simple'}
          mutePage={mutePage}
          setMutePage={setMutePage}
          seeAllText="Ver Todos"
          shortVideoText="Video Corto"
          slides={[
            {
              contentId: '1-the-simple-gospel/spanish-latin-american',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/8_NBC01.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#FF9A8E',
              title: '1. El Evangelio Simple'
            },
            {
              contentId: '2-the-blood-of-jesus/spanish-latin-american',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/8_NBC02.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#D4BD20',
              title: '2. La Sangre de Jesús'
            },
            {
              contentId: '3-life-after-death/spanish-latin-american',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/8_NBC03.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#FBAB2C',
              title: '3. La Vida Después de la Muerte'
            },
            {
              contentId: '4-god-forgiveness/spanish-latin-american',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/8_NBC04.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#BD862D',
              title: '4. El Perdón de Dios'
            },
            {
              contentId: '5-savior-lord-and-friend/spanish-latin-american',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/8_NBC05.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#3C7B86',
              title: '5. Salvador, Señor y Amigo'
            },
            {
              contentId: '6-being-made-new/spanish-latin-american',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/8_NBC06.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#02B9B6',
              title: '6. Siendo Renovados'
            },
            {
              contentId: '7-living-for-god/spanish-latin-american',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/8_NBC07.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#243856',
              title: '7. Viviendo para Dios'
            },
            {
              contentId: '8-the-bible/spanish-latin-american',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/8_NBC08.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#FCB02D',
              title: '8. La Biblia'
            },
            {
              contentId: '9-prayer/spanish-latin-american',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/8_NBC09.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#3C7B86',
              title: '9. La Oración'
            },
            {
              contentId: '10-church/spanish-latin-american',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/8_NBC10.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#EB8311',
              title: '10. La Iglesia'
            }
          ]}
        />

        <CollectionsVideoContent
          contentId="invitation-to-know-jesus-personally/spanish-latin-american"
          subtitle={'¿Estás listo para dar el siguiente paso de fe?'}
          title={'Invitación a Conocer a Jesús Personalmente'}
          description={
            'La invitación está abierta para todos. Significa volverse a Dios y confiar nuestras vidas a Jesús para que perdone nuestros pecados. Podemos hablarle en oración cuando estemos listos para convertirnos en seguidores de Jesús.'
          }
          mutePage={mutePage}
          setMutePage={setMutePage}
          questionsTitle="Preguntas relacionadas"
          askButtonText="Haz la tuya"
          bibleQuotesTitle="Citas bíblicas"
          quizButtonText="¿Cuál es tu próximo paso de fe?"
          shareButtonText="Compartir"
          shareDataTitle={shareDataTitle}
          questions={[
            {
              id: 1,
              question: '¿Por qué necesito salvación si soy una buena persona?',
              answer: (
                <>
                  <p>
                    La Biblia dice: "No hay justo, ni aun uno" (Romanos 3:10).
                    El estándar de Dios es la perfección, y todos han pecado y
                    están destituidos de la gloria de Dios (Romanos 3:23). Ser
                    bueno según los estándares humanos no es suficiente para
                    eliminar la culpa del pecado. La salvación no se gana por
                    buenas obras, sino que se recibe por gracia mediante la fe
                    en Jesús (Efesios 2:8-9). Solo Su sacrificio puede
                    limpiarnos y hacernos justos ante Dios.
                  </p>
                </>
              )
            },
            {
              id: 2,
              question:
                '¿Por qué Jesús tuvo que morir? ¿No podía Dios simplemente perdonarnos?',
              answer: (
                <>
                  <p>
                    Dios es santo y justo, y la Biblia dice: "La paga del pecado
                    es muerte" (Romanos 6:23). El pecado nos separa de Dios, y
                    la justicia exige un castigo. Jesús murió en nuestro lugar
                    como un sacrificio perfecto para satisfacer la justicia de
                    Dios y mostrar Su amor. Hebreos 9:22 dice: "Sin
                    derramamiento de sangre no hay perdón". Jesús pagó la deuda
                    que no podíamos pagar, y a través de Él, se ofrece el
                    perdón.
                  </p>
                </>
              )
            },
            {
              id: 3,
              question:
                'Si Jesús resucitó de entre los muertos, ¿por qué no todos creen en Él?',
              answer: (
                <>
                  <p>
                    Muchos rechazan a Jesús porque aman más las tinieblas que la
                    luz (Juan 3:19). Creer en Jesús requiere humildad,
                    arrepentimiento y rendición. Algunos están cegados por el
                    orgullo, el pecado o las distracciones del mundo (2
                    Corintios 4:4). Otros no han escuchado realmente el
                    Evangelio o han endurecido sus corazones. La fe es una
                    respuesta al llamado de Dios, pero Él no obliga a nadie a
                    creer (Apocalipsis 3:20).
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
              author: 'Juan 1:29',
              text: '¡He aquí el Cordero de Dios, que quita el pecado del mundo!'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1522442676585-c751dab71864?w=900&auto=format&fit=crop&q=60',
              bgColor: '#A88E78',
              author: 'Romanos 6:23',
              text: 'Porque la paga del pecado es muerte, mas la dádiva de Dios es vida eterna en Cristo Jesús Señor nuestro.'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1678181896030-11cf0237d704?w=900&auto=format&fit=crop&q=60',
              bgColor: '#72593A',
              author: 'Apocalipsis 3:20',
              text: '¡Mira! Yo estoy a la puerta y llamo; si alguno oye mi voz y abre la puerta, entraré a él, y cenaré con él, y él conmigo.'
            }
          ]}
          freeResource={{
            imageUrl:
              'https://images.unsplash.com/photo-1650658720644-e1588bd66de3?w=900&auto=format&fit=crop&q=60',
            bgColor: '#5F4C5E',
            subtitle: 'Recursos Gratuitos',
            title: '¿Quieres profundizar tu comprensión de la vida de Jesús?',
            buttonText: 'Únete a nuestro estudio bíblico'
          }}
        />
      </CollectionsPageContent>
    </PageWrapper>
  )
}
