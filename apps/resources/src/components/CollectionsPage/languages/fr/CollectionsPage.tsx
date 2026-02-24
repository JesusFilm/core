/* eslint-disable i18next/no-literal-string */
import { ReactElement, useState } from 'react'

import { PageWrapper } from '../../../PageWrapper'
import { CollectionIntroText } from '../../CollectionIntroText'
import { CollectionsPageContent } from '../../CollectionsPageContent'
import { CollectionsVideoContent } from '../../CollectionsVideoContent'
import { CollectionVideoContentCarousel } from '../../CollectionVideoContentCarousel'
import { ContainerHero } from '../../ContainerHero'
import { OtherCollectionsCarousel } from '../../OtherCollectionsCarousel'

export function CollectionsPage(): ReactElement {
  const [mutePage, setMutePage] = useState(true)

  const shareDataTitle =
    "👋 Découvre ces vidéos sur les origines de Pâques. J'ai pensé que ça pourrait te plaire."

  return (
    <PageWrapper
      hero={
        <ContainerHero
          title="Pâques"
          descriptionBeforeYear="Pâques"
          descriptionAfterYear="vidéos et ressources sur le Carême, la Semaine Sainte, la Résurrection"
          feedbackButtonLabel="Donner un Avis"
        />
      }
      hideHeader
      hideFooter
    >
      <CollectionsPageContent>
        {/* <CollectionNavigationCarousel contentItems={navigationContentItems} /> */}
        <CollectionIntroText
          title="La véritable histoire de Pâques"
          subtitle="Des questions ? En recherche ? Découvrez le véritable pouvoir de Pâques."
          firstParagraph={{
            beforeHighlight:
              "Au-delà des œufs et des lapins se trouve l'histoire de ",
            highlightedText: 'la vie, la mort et la résurrection de Jésus.',
            afterHighlight:
              " Le véritable pouvoir de Pâques va au-delà des services religieux et des rituels — il touche à la raison même pour laquelle l'humanité a besoin d'un Sauveur."
          }}
          secondParagraph="Les Évangiles sont étonnamment honnêtes sur les émotions que Jésus a ressenties — Sa profonde angoisse lorsque l\'un de Ses plus proches amis a nié Le connaître, et l\'incrédulité des autres disciples face à Sa résurrection — des émotions brutes qui reflètent nos propres luttes."
          easterDatesTitle="Quand Pâques est-il célébré en {year} ?"
          thirdParagraph="Explorez notre collection de vidéos et de ressources interactives qui vous invitent à découvrir l\'histoire authentique — une histoire qui a changé le cours de l\'histoire et continue de transformer des vies aujourd\'hui. Car la plus grande célébration de l\'histoire humaine va bien au-delà des traditions — elle concerne le pouvoir de la résurrection"
          westernEasterLabel="Pâques Occidental (Catholique/Protestant)"
          orthodoxEasterLabel="Orthodoxe"
          passoverLabel="Pâque Juive"
          locale="fr-FR"
        />
        <CollectionsVideoContent
          contentId="easter-explained/french"
          subtitle={'La Victoire de Jésus sur le Péché et la Mort'}
          title={'La Vraie Signification de Pâques'}
          description={
            "Pâques, c'est bien plus que des œufs et des lapins—c'est l'histoire de Jésus et de Son amour incroyable pour nous. Il est mort sur la croix pour nos péchés et ressuscité des morts, démontrant Son pouvoir sur le péché et la mort. Grâce à Lui, nous pouvons obtenir le pardon et la promesse de la vie éternelle. Pâques est un moment pour célébrer cette grande espérance et ce don incroyable de Dieu."
          }
          mutePage={mutePage}
          setMutePage={setMutePage}
          showDivider={false}
          questionsTitle="Questions connexes"
          askButtonText="Posez la vôtre"
          bibleQuotesTitle="Citations bibliques"
          quizButtonText="Quelle est votre prochaine étape de foi ?"
          shareButtonText="Partager"
          shareDataTitle={shareDataTitle}
          questions={[
            {
              id: 1,
              question:
                'Comment puis-je faire confiance à la souveraineté de Dieu quand le monde semble si chaotique ?',
              answer: (
                <>
                  <p>
                    {
                      "Même en période de chaos et d'incertitude, nous pouvons faire confiance à la souveraineté de Dieu car :"
                    }
                  </p>
                  <ul className="mt-2 list-disc space-y-2 pl-6">
                    <li>
                      {
                        'Dieu reste aux commandes même quand les circonstances semblent échapper à tout contrôle'
                      }
                    </li>
                    <li>
                      {'Ses desseins sont plus élevés que notre compréhension'}
                    </li>
                    <li>
                      {
                        "Il promet de faire concourir toutes choses au bien de ceux qui L'aiment"
                      }
                    </li>
                    <li>
                      {
                        "La Bible montre d'innombrables exemples où Dieu a apporté l'ordre à partir du chaos"
                      }
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 2,
              question:
                'Pourquoi Pâques est-elle la fête chrétienne la plus importante ?',
              answer: (
                <>
                  <p>{'Pâques est au cœur de la foi chrétienne car :'}</p>
                  <ul className="mt-2 list-disc space-y-2 pl-6">
                    <li>
                      {
                        'Elle marque la résurrection de Jésus, prouvant Sa victoire sur la mort'
                      }
                    </li>
                    <li>
                      {
                        "Elle accomplit les prophéties de l'Ancien Testament concernant le Messie"
                      }
                    </li>
                    <li>
                      {
                        'Elle démontre le pouvoir de Dieu de donner une nouvelle vie'
                      }
                    </li>
                    <li>
                      {
                        "Elle nous donne l'espoir de notre propre résurrection et de la vie éternelle"
                      }
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 3,
              question:
                "Que s'est-il passé pendant les trois jours entre la mort de Jésus et sa résurrection ?",
              answer: (
                <>
                  <p>{'La Bible nous raconte plusieurs événements clés :'}</p>
                  <ul className="mt-2 list-disc space-y-2 pl-6">
                    <li>
                      {
                        'Le corps de Jésus a été placé dans un tombeau et gardé par des soldats romains'
                      }
                    </li>
                    <li>
                      {
                        "Ses disciples étaient en deuil et attendaient dans l'incertitude"
                      }
                    </li>
                    <li>
                      {
                        'Selon les Écritures, Il est descendu dans le séjour des morts'
                      }
                    </li>
                    <li>
                      {
                        'Le troisième jour, Il est ressuscité victorieux de la mort'
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
                'https://images.unsplash.com/photo-1508558936510-0af1e3cccbab?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dmljdG9yeXxlbnwwfHwwfHx8MA%3D%3D',
              bgColor: '#201617',
              author: 'Apôtre Paul',
              text: "\"Où est, ô mort, ta victoire ? Où est, ô mort, ton aiguillon ?\" L'aiguillon de la mort, c'est le péché; et la puissance du péché, c'est la loi. Mais grâces soient rendues à Dieu, qui nous donne la victoire par notre Seigneur Jésus-Christ."
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1522442676585-c751dab71864?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dG9yYWh8ZW58MHx8MHx8fDA%3D',
              bgColor: '#A88E78',
              author: 'Apôtre Paul',
              text: "\"Où est, ô mort, ta victoire ? Où est, ô mort, ton aiguillon ?\" L'aiguillon de la mort, c'est le péché; et la puissance du péché, c'est la loi. Mais grâces soient rendues à Dieu, qui nous donne la victoire par notre Seigneur Jésus-Christ."
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1678181896030-11cf0237d704?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGplc3VzJTIwcmlzZW58ZW58MHx8MHx8fDA%3D',
              bgColor: '#72593A',
              author: 'Apôtre Paul',
              text: "\"Où est, ô mort, ta victoire ? Où est, ô mort, ton aiguillon ?\" L'aiguillon de la mort, c'est le péché; et la puissance du péché, c'est la loi. Mais grâces soient rendues à Dieu, qui nous donne la victoire par notre Seigneur Jésus-Christ."
            }
          ]}
          freeResource={{
            imageUrl:
              'https://images.unsplash.com/photo-1650658720644-e1588bd66de3?w=900&auto=format&fit=crop&q=60',
            bgColor: '#5F4C5E',
            subtitle: 'Ressources Gratuites',
            title: 'Vous voulez approfondir votre compréhension de la Bible ?',
            buttonText: 'Rejoindre Notre Étude Biblique'
          }}
        />
        <OtherCollectionsCarousel
          id="other-collections"
          collectionSubtitle="Collection Bible Vidéo"
          collectionTitle="L'histoire de Pâques fait partie d'un tableau plus grand"
          watchButtonText="Regarder"
          missionHighlight="Notre mission"
          missionDescription="est de présenter la Bible aux gens à travers des films et des vidéos qui donnent fidèlement vie aux Évangiles. En racontant visuellement l'histoire de Jésus et de l'amour de Dieu pour l'humanité, nous rendons les Écritures plus accessibles, engageantes et faciles à comprendre."
          movieUrls={[
            {
              imageUrl: 'https://cdn-std.droplr.net/files/acc_760170/cfER11',
              altText: 'Affiche du Film JÉSUS',
              externalUrl:
                'https://www.jesusfilm.org/watch/jesus.html/french.html'
            },
            {
              imageUrl: 'https://cdn-std.droplr.net/files/acc_760170/9wGrB0',
              altText: 'Affiche du Film La Vie de Jésus',
              externalUrl:
                'https://www.jesusfilm.org/watch/life-of-jesus-gospel-of-john.html/french.html'
            },
            {
              imageUrl: 'https://cdn-std.droplr.net/files/acc_760170/zeoyJz',
              altText: 'Affiche du Film Évangile selon Matthieu',
              externalUrl:
                'https://www.jesusfilm.org/watch/lumo-the-gospel-of-matthew.html/lumo-matthew-1-1-2-23/french.html'
            },
            {
              imageUrl: 'https://cdn-std.droplr.net/files/acc_760170/Ol9PXg',
              altText: 'Affiche du Film Évangile selon Marc',
              externalUrl:
                'https://www.jesusfilm.org/watch/lumo-the-gospel-of-mark.html/lumo-mark-1-1-45/french.html'
            },
            {
              imageUrl: 'https://cdn-std.droplr.net/files/acc_760170/cft9yz',
              altText: 'Affiche du Film Évangile selon Luc',
              externalUrl:
                'https://www.jesusfilm.org/watch/lumo-the-gospel-of-luke.html/lumo-luke-1-1-56/french.html'
            },
            {
              imageUrl: 'https://cdn-std.droplr.net/files/acc_760170/TxsUi3',
              altText: 'Affiche du Film Évangile selon Jean',
              externalUrl:
                'https://www.jesusfilm.org/watch/lumo-the-gospel-of-john.html/lumo-john-1-1-34/french.html'
            }
          ]}
        />
        <CollectionsVideoContent
          contentId="my-last-day/french"
          subtitle={'Mon Dernier Jour'}
          title={'La dernière heure de la vie de Jésus vue par un criminel'}
          description={
            "Un voleur condamné regarde avec horreur Jésus être brutalement flagellé dans la cour de Pilate, les souvenirs de ses propres crimes envahissant son esprit. Pourquoi puniraient-ils un homme innocent ? La clameur de la foule scelle leur destin—la crucifixion. Forcés de porter leurs croix jusqu'à Golgotha, il trébuche à côté de Jésus, écrasé par le poids de son passé et de sa sentence. Alors que les clous percent la chair et que le ciel s'obscurcit, il fait une supplication désespérée—pourrait-ce vraiment être le Messie ? Dans ses derniers moments, Jésus lui fait une promesse inattendue : Aujourd'hui, tu seras avec moi dans le paradis. Regardez comment ce moment puissant se déroule."
          }
          mutePage={mutePage}
          setMutePage={setMutePage}
          questionsTitle="Questions connexes"
          askButtonText="Posez la vôtre"
          bibleQuotesTitle="Citations bibliques"
          shareButtonText="Partager"
          shareDataTitle={shareDataTitle}
          quizButtonText="Quelle est votre prochaine étape de foi ?"
          questions={[
            {
              id: 1,
              question:
                'Pourquoi Jésus pardonnerait-il si facilement à un criminel ?',
              answer: (
                <>
                  <p>
                    {
                      "Le pardon de Jésus est une démonstration de la grâce et de la miséricorde de Dieu. Le voleur sur la croix a reconnu l'innocence et la divinité de Jésus, demandant humblement d'être souvenu dans Son royaume. La réponse de Jésus montre que :"
                    }
                  </p>
                  <ul className="mt-2 list-disc space-y-2 pl-6">
                    <li>
                      {'Le salut est basé sur la foi, non sur les œuvres'}
                    </li>
                    <li>
                      {
                        "La miséricorde de Dieu s'étend à tous, même aux pires pécheurs"
                      }
                    </li>
                    <li>
                      {
                        'Jésus est venu pour sauver les perdus, y compris les criminels et les exclus'
                      }
                    </li>
                    <li>
                      {
                        'La grâce est donnée gratuitement à ceux qui la cherchent sincèrement'
                      }
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 2,
              question:
                "Si Jésus était innocent, pourquoi ne s'est-il pas sauvé lui-même au lieu d'accepter la mort ?",
              answer: (
                <>
                  <p>
                    {
                      'Jésus a volontairement accepté la mort parce que cela faisait partie du plan de Dieu pour la rédemption. Son sacrifice était nécessaire pour accomplir la prophétie et apporter le salut. Les raisons principales incluent :'
                    }
                  </p>
                  <ul className="mt-2 list-disc space-y-2 pl-6">
                    <li>
                      {
                        "Sa mort a accompli les prophéties de l'Ancien Testament (Ésaïe 53)"
                      }
                    </li>
                    <li>
                      {
                        "Il a pris sur lui la punition pour les péchés de l'humanité"
                      }
                    </li>
                    <li>
                      {
                        'En ne se sauvant pas Lui-même, Il a démontré Son amour ultime et Son obéissance à Dieu'
                      }
                    </li>
                    <li>
                      {
                        'Sa résurrection a prouvé Sa victoire sur le péché et la mort'
                      }
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 3,
              question: "Que signifie vraiment être 'au paradis' avec Jésus ?",
              answer: (
                <>
                  <p>
                    {
                      'Être au paradis avec Jésus signifie la vie éternelle en présence de Dieu. Le voleur sur la croix a été assuré de sa place avec Jésus au ciel à cause de sa foi. Les aspects importants de cette promesse incluent :'
                    }
                  </p>
                  <ul className="mt-2 list-disc space-y-2 pl-6">
                    <li>
                      {
                        'Cela signifie une présence immédiate avec Christ après la mort'
                      }
                    </li>
                    <li>{'Cela confirme le salut par la foi seule'}</li>
                    <li>
                      {
                        "Cela offre l'espoir d'une joie et d'une paix éternelles"
                      }
                    </li>
                    <li>
                      {
                        'Les paroles de Jésus affirment la réalité de la vie au-delà de ce monde'
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
              author: 'Jésus (Luc 23:43)',
              text: "Je te le dis en vérité, aujourd'hui tu seras avec moi dans le paradis."
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1709471875678-0b3627a3c099?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzJ8fGZvcmdpdmV8ZW58MHx8MHx8fDA%3D',
              bgColor: '#031829',
              author: 'Jésus (Luc 23:34)',
              text: "Père, pardonne-leur, car ils ne savent pas ce qu'ils font."
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1595119591974-a9bd1532c1b0?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGNocmlzdHxlbnwwfHwwfHx8MA%3D%3D',
              bgColor: '#0E0D0F',
              author: 'Ésaïe 53:5',
              text: "Mais il était blessé pour nos péchés, brisé pour nos iniquités; le châtiment qui nous donne la paix est tombé sur lui, et c'est par ses meurtrissures que nous sommes guéris."
            }
          ]}
          freeResource={{
            imageUrl:
              'https://images.unsplash.com/photo-1650658720644-e1588bd66de3?w=900&auto=format&fit=crop&q=60',
            bgColor: '#5F4C5E',
            subtitle: 'Ressources Gratuites',
            title: 'Vous voulez approfondir votre compréhension de la Bible ?',
            buttonText: 'Rejoindre Notre Étude Biblique'
          }}
        />

        <CollectionVideoContentCarousel
          id="easter-documentary-series"
          subtitle={'Série Documentaire de Pâques'}
          title={'Jésus a-t-il vaincu la mort ?'}
          description={
            "Embarquez dans cette aventure pour voyager dans le temps jusqu'au 1er siècle et examiner d'autres théories concernant le tombeau vide de Jésus."
          }
          contentId="31-how-did-jesus-die/french"
          videoTitle={'Comment Jésus est-il mort ?'}
          mutePage={mutePage}
          setMutePage={setMutePage}
          seeAllText="Voir Tout"
          shortVideoText="Courte Vidéo"
          slides={[
            {
              contentId: '31-how-did-jesus-die/french',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/7_0-nfs0301.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#161817',
              title: 'Comment Jésus est-il mort ?'
            },
            {
              contentId: '32-what-happened-next/french',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/7_0-nfs0302.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#000906',
              title: "Que s'est-il passé ensuite ?"
            },
            {
              contentId: '33-do-the-facts-stack-up/french',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/7_0-nfs0303.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#2B2018',
              title: 'Pourquoi Pâques est-il célébré avec des lapins ?'
            }
          ]}
        />
        <CollectionsVideoContent
          contentId="why-did-jesus-have-to-die/french"
          subtitle={'Pourquoi Jésus devait-il mourir ?'}
          title={'Le But du Sacrifice de Jésus'}
          description={
            "Dieu a créé les humains pour être spirituellement et relationnellement connectés avec Lui, mais comment pouvons-nous garder les commandements de Dieu ? Comment pouvons-nous vivre sans honte ? Nous ne pouvons pas nous restaurer nous-mêmes à l'honneur. Il semblerait que nous soyons condamnés, sauf que Dieu ne veut pas que Sa création meure. Il est miséricordieux et aimant, et veut que nous soyons restaurés, vivant avec Lui dans une vie pleine."
          }
          mutePage={mutePage}
          setMutePage={setMutePage}
          questionsTitle="Questions connexes"
          askButtonText="Posez la vôtre"
          bibleQuotesTitle="Citations bibliques"
          shareButtonText="Partager"
          shareDataTitle={shareDataTitle}
          quizButtonText="Quelle est votre prochaine étape de foi ?"
          questions={[
            {
              id: 1,
              question: 'Pourquoi la mort de Jésus était-elle nécessaire ?',
              answer: (
                <>
                  <p>
                    {
                      "La mort de Jésus était nécessaire pour accomplir le plan de rédemption de Dieu. À cause du péché, l'humanité était séparée de Dieu, mais le sacrifice de Jésus a fourni le moyen de réconciliation. Voici pourquoi Sa mort était essentielle :"
                    }
                  </p>
                  <ul className="mt-2 list-disc space-y-2 pl-6">
                    <li>{'Le péché crée une barrière entre nous et Dieu'}</li>
                    <li>
                      {'La justice de Dieu exige un paiement pour le péché'}
                    </li>
                    <li>
                      {
                        'Jésus, en tant que sacrifice parfait, a pris notre place'
                      }
                    </li>
                    <li>
                      {
                        'Par Sa mort, nous recevons le pardon et la restauration'
                      }
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 2,
              question:
                "Si Dieu est aimant, pourquoi n'a-t-il pas simplement pardonné le péché sans le sacrifice de Jésus ?",
              answer: (
                <>
                  <p>
                    {
                      "L'amour et la justice de Dieu vont de pair. Bien qu'Il désire pardonner, Il maintient aussi la justice. Le sacrifice de Jésus était l'expression ultime des deux :"
                    }
                  </p>
                  <ul className="mt-2 list-disc space-y-2 pl-6">
                    <li>{'Le pardon a un coût, et Jésus a payé ce coût'}</li>
                    <li>
                      {
                        'Sa mort a satisfait la justice de Dieu tout en montrant Sa miséricorde'
                      }
                    </li>
                    <li>
                      {
                        "À travers Jésus, Dieu a démontré Son amour pour l'humanité"
                      }
                    </li>
                    <li>
                      {
                        "Son sacrifice nous permet d'être restaurés sans compromettre la justice divine"
                      }
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 3,
              question:
                'Comment la mort de Jésus affecte-t-elle notre relation avec Dieu ?',
              answer: (
                <>
                  <p>
                    {
                      'La mort et la résurrection de Jésus ont ouvert la voie pour que nous soyons réconciliés avec Dieu. À travers Lui, nous pouvons :'
                    }
                  </p>
                  <ul className="mt-2 list-disc space-y-2 pl-6">
                    <li>{'Expérimenter le pardon et la liberté du péché'}</li>
                    <li>{'Avoir un accès direct à Dieu par Christ'}</li>
                    <li>{'Recevoir le don de la vie éternelle'}</li>
                    <li>
                      {'Vivre dans une relation restaurée avec notre Créateur'}
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
              author: 'Romains 5:8',
              text: 'Mais Dieu prouve son amour envers nous, en ce que, lorsque nous étions encore des pécheurs, Christ est mort pour nous.'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1658512341640-2db6ae31906b?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGpvaG4lMjAzJTNBMTZ8ZW58MHx8MHx8fDA%3D',
              bgColor: '#050507',
              author: 'Jean 3:16',
              text: "Car Dieu a tant aimé le monde qu'il a donné son Fils unique, afin que quiconque croit en lui ne périsse point, mais qu'il ait la vie éternelle."
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1586490110711-7e174d0d043f?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8am9obiUyMDMlM0ExNnxlbnwwfHwwfHx8MA%3D%3D',
              bgColor: '#5B5A5C',
              author: '1 Pierre 2:24',
              text: "Il a porté lui-même nos péchés en son corps sur le bois, afin que morts aux péchés nous vivions pour la justice; c'est par ses meurtrissures que vous avez été guéris."
            }
          ]}
          freeResource={{
            imageUrl:
              'https://images.unsplash.com/photo-1650658720644-e1588bd66de3?w=900&auto=format&fit=crop&q=60',
            bgColor: '#5F4C5E',
            subtitle: 'Ressources Gratuites',
            title: 'Vous voulez mieux comprendre le sacrifice de Jésus ?',
            buttonText: 'Rejoindre Notre Étude Biblique'
          }}
        />

        <CollectionVideoContentCarousel
          id="easter-events-day-by-day"
          subtitle={'Vidéos Bibliques'}
          title={'Les Événements de Pâques Jour par Jour'}
          description={
            "Suivez les événements de Pâques jour par jour tels que décrits dans l'Évangile de Luc."
          }
          contentId="upper-room-teaching/french"
          videoTitle={'Enseignement dans la Chambre Haute'}
          mutePage={mutePage}
          setMutePage={setMutePage}
          seeAllText="Voir Tout"
          shortVideoText="Courte Vidéo"
          slides={[
            {
              contentId: 'upper-room-teaching/french',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6143-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#161817',
              title: 'Enseignement dans la Chambre Haute'
            },
            {
              contentId: 'jesus-is-betrayed-and-arrested/french',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6144-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#000906',
              title: 'Jésus est Trahi et Arrêté'
            },
            {
              contentId: 'peter-disowns-jesus/french',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6145-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#100704',
              title: 'Pierre Renie Jésus'
            },
            {
              contentId: 'jesus-is-mocked-and-questioned/french',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6146-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#0A0E0D',
              title: 'Jésus est Moqué et Interrogé'
            },
            {
              contentId: 'jesus-is-brought-to-pilate/french',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6147-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#170E07',
              title: 'Jésus est Amené à Pilate'
            },
            {
              contentId: 'jesus-is-brought-to-herod/french',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6148-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#0F0D03',
              title: 'Jésus est Amené à Hérode'
            },
            {
              contentId: 'jesus-is-sentenced/french',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6149-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#322314',
              title: 'Jésus est Condamné'
            },
            {
              contentId: 'death-of-jesus/french',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6155-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#1D1B13',
              title: 'La Mort de Jésus'
            },
            {
              contentId: 'burial-of-jesus/french',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6156-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#231E1F',
              title: "L'Ensevelissement de Jésus"
            },
            {
              contentId: 'angels-at-the-tomb/french',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6157-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#1A190E',
              title: 'Les Anges au Tombeau'
            },
            {
              contentId: 'the-tomb-is-empty/french',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6158-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#151D12',
              title: 'Le Tombeau est Vide'
            },
            {
              contentId: 'resurrected-jesus-appears/french',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6159-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#0B0501',
              title: 'Jésus Ressuscité Apparaît'
            },
            {
              contentId: 'great-commission-and-ascension/french',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6160-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#2B2118',
              title: "La Grande Commission et l'Ascension"
            },
            {
              contentId: 'invitation-to-know-jesus-personally/french',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6161-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#27160F',
              title: 'Invitation à Connaître Jésus Personnellement'
            }
          ]}
        />

        <CollectionsVideoContent
          contentId="the-story-short-film/french"
          subtitle={"Le Court-Métrage L'Histoire"}
          title={
            "L'Histoire : Comment Tout a Commencé et Comment Ça Ne Finira Jamais"
          }
          description={
            "L'Histoire est un court-métrage sur comment tout a commencé et comment cela ne peut jamais finir. Ce film partage l'histoire globale de la Bible, une histoire qui rachète toutes les histoires et apporte une nouvelle vie à travers le salut en Jésus seul. Il répond aux plus grandes questions de la vie : D'où venons-nous ? Qu'est-ce qui a mal tourné ? Y a-t-il de l'espoir ? Et que nous réserve l'avenir ?"
          }
          mutePage={mutePage}
          setMutePage={setMutePage}
          questionsTitle="Questions connexes"
          askButtonText="Posez la vôtre"
          bibleQuotesTitle="Citations bibliques"
          quizButtonText="Quelle est votre prochaine étape de foi ?"
          shareButtonText="Partager"
          shareDataTitle={shareDataTitle}
          questions={[
            {
              id: 1,
              question: "D'où vient tout ? Y a-t-il un but à la vie ?",
              answer: (
                <>
                  <p>
                    {
                      "La Bible enseigne que tout a commencé avec Dieu, le Créateur de l'univers. Il a créé toutes choses par Sa parole avec un dessein et un plan. L'humanité a été créée à Son image pour vivre en harmonie avec Lui, les uns avec les autres, et avec la création."
                    }
                  </p>
                  <ul className="mt-2 list-disc space-y-2 pl-6">
                    <li>{'Dieu a créé le monde par amour et avec ordre'}</li>
                    <li>
                      {
                        "À l'origine, tout était parfait, sans douleur ni souffrance"
                      }
                    </li>
                    <li>
                      {
                        'Les humains ont été conçus pour avoir une relation personnelle avec Dieu'
                      }
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 2,
              question:
                'Si Dieu est bon, pourquoi y a-t-il tant de souffrance dans le monde ?',
              answer: (
                <>
                  <p>
                    {
                      "La souffrance existe parce que le péché est entré dans le monde lorsque l'humanité a choisi de se rebeller contre Dieu. Cette désobéissance a brisé la perfection originelle, introduisant la mort, la douleur et la séparation d'avec Dieu."
                    }
                  </p>
                  <ul className="mt-2 list-disc space-y-2 pl-6">
                    <li>
                      {
                        'Le péché a apporté la souffrance, la rupture et la mort'
                      }
                    </li>
                    <li>{'Nous contribuons tous au problème du péché'}</li>
                    <li>
                      {
                        "Malgré cela, Dieu n'a pas abandonné l'humanité—Il a fourni un moyen de restauration"
                      }
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 3,
              question:
                'Y a-t-il un espoir que le monde soit à nouveau en ordre ?',
              answer: (
                <>
                  <p>
                    {
                      'Oui ! Dieu a envoyé Jésus comme sauveur. Jésus a vécu une vie parfaite, est mort sur la croix pour payer pour le péché, et est ressuscité des morts pour vaincre la mort elle-même. À travers Lui, nous pouvons être restaurés à Dieu et expérimenter une nouvelle vie.'
                    }
                  </p>
                  <ul className="mt-2 list-disc space-y-2 pl-6">
                    <li>{'Le sacrifice de Jésus rend le pardon possible'}</li>
                    <li>{'Sa résurrection prouve Son pouvoir sur la mort'}</li>
                    <li>
                      {
                        'Ceux qui font confiance à Jésus reçoivent une nouvelle vie et une relation restaurée avec Dieu'
                      }
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 4,
              question:
                'Que se passera-t-il dans le futur ? Y a-t-il une vie après la mort ?',
              answer: (
                <>
                  <p>
                    {
                      "Selon la Bible, Dieu a promis un avenir où Il restaurera toutes choses. Ceux qui font confiance à Jésus vivront éternellement avec Lui dans un monde parfait et renouvelé. Le péché, la souffrance et la mort n'existeront plus."
                    }
                  </p>
                  <ul className="mt-2 list-disc space-y-2 pl-6">
                    <li>
                      {'Dieu créera de nouveaux cieux et une nouvelle terre'}
                    </li>
                    <li>
                      {"Il n'y aura plus de douleur, de souffrance ou de mort"}
                    </li>
                    <li>
                      {'Jésus reviendra pour juger les vivants et les morts'}
                    </li>
                    <li>
                      {'Chacun doit décider comment il répondra à cette vérité'}
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
              author: 'Genèse 1:1',
              text: 'Au commencement, Dieu créa les cieux et la terre.'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1513082325166-c105b20374bb?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG1pc3Rha2V8ZW58MHx8MHx8fDA%3D',
              bgColor: '#6C7B80',
              author: 'Romains 3:23-24',
              text: 'Car tous ont péché et sont privés de la gloire de Dieu, et ils sont gratuitement justifiés par sa grâce, par le moyen de la rédemption qui est en Jésus-Christ.'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1524088484081-4ca7e08e3e19?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dGVhcnN8ZW58MHx8MHx8fDA%3D',
              bgColor: '#87695B',
              author: 'Apocalypse 21:4',
              text: "Il essuiera toute larme de leurs yeux, et la mort ne sera plus, et il n'y aura plus ni deuil, ni cri, ni douleur, car les premières choses ont disparu."
            }
          ]}
          freeResource={{
            imageUrl:
              'https://images.unsplash.com/photo-1650658720644-e1588bd66de3?w=900&auto=format&fit=crop&q=60',
            bgColor: '#5F4C5E',
            subtitle: 'Ressources Gratuites',
            title:
              'Vous voulez explorer les plus grandes questions de la vie ?',
            buttonText: 'Rejoindre Notre Étude Biblique'
          }}
        />
        <CollectionsVideoContent
          contentId="chosen-witness/french"
          subtitle={'Témoin Choisi'}
          title={'Marie-Madeleine : Une Vie Transformée par Jésus'}
          description={
            "La vie de Marie-Madeleine a été radicalement transformée par Jésus, l'homme qui allait changer le monde à jamais. Autrefois marginalisée, elle est devenue l'une de Ses disciples les plus dévouées. Dans ce court métrage d'animation, découvrez la vie de Jésus à travers ses yeux—de sa rédemption jusqu'au moment où elle fut la première à témoigner de Sa résurrection."
          }
          mutePage={mutePage}
          setMutePage={setMutePage}
          questionsTitle="Questions connexes"
          askButtonText="Posez la vôtre"
          bibleQuotesTitle="Citations bibliques"
          quizButtonText="Quelle est votre prochaine étape de foi ?"
          shareButtonText="Partager"
          shareDataTitle={shareDataTitle}
          questions={[
            {
              id: 1,
              question:
                'De quelles façons vous identifiez-vous au personnage principal, Marie-Madeleine ?',
              answer: (
                <>
                  <p>
                    {
                      "L'histoire de Marie-Madeleine est celle d'une transformation et d'une rédemption. Comme beaucoup d'entre nous, elle portait un passé rempli de luttes, mais Jésus l'a libérée et lui a donné un nouveau but. Son histoire nous enseigne que :"
                    }
                  </p>
                  <ul className="mt-2 list-disc space-y-2 pl-6">
                    <li>
                      {'Jésus offre la rédemption quelle que soit notre passé'}
                    </li>
                    <li>{'La foi en Christ apporte guérison et sens'}</li>
                    <li>
                      {'Dieu appelle les moins attendus à être Ses témoins'}
                    </li>
                    <li>{'Rencontrer Jésus change tout'}</li>
                  </ul>
                </>
              )
            },
            {
              id: 2,
              question:
                "Pourquoi pensez-vous que les anciens n'approuvaient pas Jésus ?",
              answer: (
                <>
                  <p>
                    {
                      "Les chefs religieux s'opposaient à Jésus parce que Ses enseignements remettaient en question leur autorité et leurs traditions. Les raisons principales incluent :"
                    }
                  </p>
                  <ul className="mt-2 list-disc space-y-2 pl-6">
                    <li>
                      {
                        'Il accueillait les pécheurs et les exclus, perturbant les normes sociales'
                      }
                    </li>
                    <li>
                      {
                        "Sa prétention d'être le Fils de Dieu menaçait leur pouvoir"
                      }
                    </li>
                    <li>
                      {
                        "Il mettait l'accent sur la miséricorde plutôt que sur le légalisme, irritant ceux qui s'appuyaient sur la loi"
                      }
                    </li>
                    <li>
                      {
                        'Ses miracles et son influence croissante déstabilisaient leur contrôle sur le peuple'
                      }
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 3,
              question:
                "Après sa résurrection, pourquoi pensez-vous que Jésus a choisi de parler d'abord à Marie ?",
              answer: (
                <>
                  <p>
                    {
                      'La première apparition de Jésus à Marie-Madeleine était profondément significative. Elle a montré :'
                    }
                  </p>
                  <ul className="mt-2 list-disc space-y-2 pl-6">
                    <li>{'Son attention pour ceux que le monde négligeait'}</li>
                    <li>
                      {
                        "L'importance de la foi et du dévouement plutôt que du statut"
                      }
                    </li>
                    <li>
                      {
                        'Que les femmes jouaient un rôle vital dans Son ministère et Son message'
                      }
                    </li>
                    <li>
                      {
                        'Comment une vie transformée peut devenir un témoignage puissant'
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
              author: 'Luc 8:2',
              text: "ainsi que quelques femmes qui avaient été guéries d'esprits malins et de maladies : Marie, dite de Magdala, de laquelle étaient sortis sept démons."
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1522442676585-c751dab71864?w=900&auto=format&fit=crop&q=60',
              bgColor: '#A88E78',
              author: 'Jean 20:16',
              text: 'Jésus lui dit : "Marie !" Elle se retourna, et lui dit en hébreu : "Rabbouni !" (c\'est-à-dire, Maître).'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1678181896030-11cf0237d704?w=900&auto=format&fit=crop&q=60',
              bgColor: '#72593A',
              author: 'Marc 16:9',
              text: "Jésus, étant ressuscité le matin du premier jour de la semaine, apparut d'abord à Marie de Magdala, de laquelle il avait chassé sept démons."
            }
          ]}
          freeResource={{
            imageUrl:
              'https://images.unsplash.com/photo-1650658720644-e1588bd66de3?w=900&auto=format&fit=crop&q=60',
            bgColor: '#5F4C5E',
            subtitle: 'Ressources Gratuites',
            title:
              'Vous voulez approfondir votre compréhension de la vie de Jésus ?',
            buttonText: 'Rejoindre Notre Étude Biblique'
          }}
        />

        <CollectionVideoContentCarousel
          id="new-believer-course"
          subtitle={'Cours Vidéo'}
          title={'Cours pour Nouveaux Croyants'}
          description={
            "Si vous vous êtes déjà demandé ce qu'est le christianisme, ou quel mode de vie il vous permet de vivre, le Cours pour Nouveaux Croyants existe pour vous aider à comprendre l'Évangile et à vivre votre vie en réponse à celui-ci."
          }
          contentId="1-the-simple-gospel/french"
          videoTitle={"1. L'Évangile Simple"}
          mutePage={mutePage}
          setMutePage={setMutePage}
          seeAllText="Voir Tout"
          shortVideoText="Courte Vidéo"
          slides={[
            {
              contentId: '1-the-simple-gospel/french',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/8_NBC01.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#FF9A8E',
              title: "1. L'Évangile Simple"
            },
            {
              contentId: '2-the-blood-of-jesus/french',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/8_NBC02.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#D4BD20',
              title: '2. Le Sang de Jésus'
            },
            {
              contentId: '3-life-after-death/french',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/8_NBC03.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#FBAB2C',
              title: '3. La Vie Après la Mort'
            },
            {
              contentId: '4-god-forgiveness/french',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/8_NBC04.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#BD862D',
              title: '4. Le Pardon de Dieu'
            },
            {
              contentId: '5-savior-lord-and-friend/french',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/8_NBC05.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#3C7B86',
              title: '5. Sauveur, Seigneur et Ami'
            },
            {
              contentId: '6-being-made-new/french',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/8_NBC06.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#02B9B6',
              title: '6. Être Renouvelé'
            },
            {
              contentId: '7-living-for-god/french',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/8_NBC07.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#243856',
              title: '7. Vivre pour Dieu'
            },
            {
              contentId: '8-the-bible/french',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/8_NBC08.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#FCB02D',
              title: '8. La Bible'
            },
            {
              contentId: '9-prayer/french',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/8_NBC09.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#3C7B86',
              title: '9. La Prière'
            },
            {
              contentId: '10-church/french',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/8_NBC10.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#EB8311',
              title: "10. L'Église"
            }
          ]}
        />

        <CollectionsVideoContent
          contentId="invitation-to-know-jesus-personally/french"
          subtitle={'Êtes-vous prêt à faire le prochain pas de foi ?'}
          title={'Invitation à Connaître Jésus Personnellement'}
          description={
            "L'invitation est ouverte à tous. Cela signifie se tourner vers Dieu et faire confiance à Jésus avec nos vies et pour pardonner nos péchés. Nous pouvons Lui parler dans la prière lorsque nous sommes prêts à devenir disciples de Jésus."
          }
          mutePage={mutePage}
          setMutePage={setMutePage}
          questionsTitle="Questions connexes"
          askButtonText="Posez la vôtre"
          bibleQuotesTitle="Citations bibliques"
          quizButtonText="Quelle est votre prochaine étape de foi ?"
          shareButtonText="Partager"
          shareDataTitle={shareDataTitle}
          questions={[
            {
              id: 1,
              question:
                "Pourquoi ai-je besoin d'être sauvé si je suis une bonne personne ?",
              answer: (
                <>
                  <p>
                    La Bible dit : "Il n'y a point de juste, pas même un seul"
                    (Romains 3:10). La norme de Dieu est la perfection, et tous
                    ont péché et sont privés de la gloire de Dieu (Romains
                    3:23). Être bon selon les normes humaines ne suffit pas à
                    enlever la culpabilité du péché. Le salut ne s'obtient pas
                    par les bonnes œuvres mais se reçoit par la grâce par la foi
                    en Jésus (Éphésiens 2:8–9). Seul Son sacrifice peut nous
                    purifier et nous rendre justes devant Dieu.
                  </p>
                </>
              )
            },
            {
              id: 2,
              question:
                'Pourquoi Jésus devait-il mourir ? Dieu ne pouvait-il pas simplement nous pardonner ?',
              answer: (
                <>
                  <p>
                    Dieu est saint et juste, et la Bible dit : "Le salaire du
                    péché, c'est la mort" (Romains 6:23). Le péché nous sépare
                    de Dieu, et la justice exige une sanction. Jésus est mort à
                    notre place comme un sacrifice parfait pour satisfaire la
                    justice de Dieu et montrer Son amour. Hébreux 9:22 dit :
                    "Sans effusion de sang, il n'y a pas de pardon." Jésus a
                    payé la dette que nous ne pouvions pas payer, et par Lui, le
                    pardon est offert.
                  </p>
                </>
              )
            },
            {
              id: 3,
              question:
                'Si Jésus est ressuscité des morts, pourquoi tout le monde ne croit-il pas en Lui ?',
              answer: (
                <>
                  <p>
                    Beaucoup rejettent Jésus parce qu'ils aiment les ténèbres
                    plus que la lumière (Jean 3:19). Croire en Jésus nécessite
                    humilité, repentance et abandon. Certains sont aveuglés par
                    l'orgueil, le péché ou les distractions du monde (2
                    Corinthiens 4:4). D'autres n'ont pas vraiment entendu
                    l'Évangile ou ont endurci leur cœur. La foi est une réponse
                    à l'appel de Dieu, mais Il ne force personne à croire
                    (Apocalypse 3:20).
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
              author: 'Jean 1:29',
              text: "Voici l'Agneau de Dieu, qui ôte le péché du monde !"
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1522442676585-c751dab71864?w=900&auto=format&fit=crop&q=60',
              bgColor: '#A88E78',
              author: 'Romains 6:23',
              text: "Car le salaire du péché, c'est la mort ; mais le don gratuit de Dieu, c'est la vie éternelle en Jésus-Christ notre Seigneur."
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1678181896030-11cf0237d704?w=900&auto=format&fit=crop&q=60',
              bgColor: '#72593A',
              author: 'Apocalypse 3:20',
              text: "Voici, je me tiens à la porte, et je frappe. Si quelqu'un entend ma voix et ouvre la porte, j'entrerai chez lui, je souperai avec lui, et lui avec moi."
            }
          ]}
          freeResource={{
            imageUrl:
              'https://images.unsplash.com/photo-1650658720644-e1588bd66de3?w=900&auto=format&fit=crop&q=60',
            bgColor: '#5F4C5E',
            subtitle: 'Ressources Gratuites',
            title:
              'Vous voulez approfondir votre compréhension de la vie de Jésus ?',
            buttonText: 'Rejoindre Notre Étude Biblique'
          }}
        />

        <CollectionsVideoContent
          contentId="talk-with-nicodemus/french"
          subtitle={'De la Religion à la Relation'}
          title={"L'Évangile en Une Conversation"}
          description={
            "Lors d'une conversation privée de nuit, Nicodème, un respecté enseignant juif, est venu à Jésus en quête de vérité. Jésus lui a dit que personne ne peut voir le royaume de Dieu à moins de naître de nouveau. Cette conversation profonde révèle le cœur de la mission de Jésus—apporter une renaissance spirituelle à travers le Saint-Esprit. Découvrez ce que signifie naître de nouveau et pourquoi c'est essentiel pour la vie éternelle."
          }
          mutePage={mutePage}
          setMutePage={setMutePage}
          questionsTitle="Questions connexes"
          askButtonText="Posez la vôtre"
          bibleQuotesTitle="Citations bibliques"
          quizButtonText="Quelle est votre prochaine étape de foi ?"
          shareButtonText="Partager"
          shareDataTitle={shareDataTitle}
          questions={[
            {
              id: 1,
              question: 'Que signifie naître de nouveau ?',
              answer: (
                <>
                  <p>
                    {
                      "Être 'né de nouveau' signifie vivre une renaissance spirituelle. Jésus a expliqué à Nicodème que cette renaissance n'est pas physique mais spirituelle—né d'eau et d'Esprit."
                    }
                  </p>
                  <ul className="mt-2 list-disc space-y-2 pl-6">
                    <li>{"C'est une œuvre du Saint-Esprit"}</li>
                    <li>{'Cela implique de croire en Jésus comme Sauveur'}</li>
                    <li>
                      {
                        'Cela apporte une nouvelle vie et une nouvelle relation avec Dieu'
                      }
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 2,
              question:
                "Pourquoi Jésus a-t-il dit à Nicodème qu'il devait naître de nouveau ?",
              answer: (
                <>
                  <p>
                    {
                      'Jésus voulait que Nicodème comprenne que la connaissance religieuse et les bonnes œuvres ne suffisent pas. Pour entrer dans le royaume de Dieu, une transformation intérieure complète est nécessaire.'
                    }
                  </p>
                  <ul className="mt-2 list-disc space-y-2 pl-6">
                    <li>
                      {'Cela montre notre besoin de renouvellement spirituel'}
                    </li>
                    <li>
                      {'Cela souligne le salut par la foi, non par les œuvres'}
                    </li>
                    <li>{"Cela met l'accent sur le rôle du Saint-Esprit"}</li>
                  </ul>
                </>
              )
            },
            {
              id: 3,
              question: 'Comment peut-on naître de nouveau ?',
              answer: (
                <>
                  <p>
                    {
                      "Jésus a expliqué que naître de nouveau vient en croyant en Lui. C'est une démarche personnelle de foi qui aboutit à une nouvelle vie en Dieu."
                    }
                  </p>
                  <ul className="mt-2 list-disc space-y-2 pl-6">
                    <li>{'Croire en Jésus-Christ comme le Fils de Dieu'}</li>
                    <li>{'Accepter Son sacrifice pour vos péchés'}</li>
                    <li>
                      {
                        'Inviter le Saint-Esprit à renouveler votre cœur et votre esprit'
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
                'https://images.unsplash.com/photo-1497449493050-a3abbc4d4fe3?w=1400&auto=format&fit=crop&q=60',
              bgColor: '#0A0A0A',
              author: 'Jean 3:3',
              text: 'Jésus lui répondit : "En vérité, en vérité, je te le dis, si un homme ne naît de nouveau, il ne peut voir le royaume de Dieu."'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1574957973698-418ac4c877af?w=1400&auto=format&fit=crop&q=60',
              bgColor: '#1A1A1D',
              author: 'Jean 3:5',
              text: 'Jésus répondit : "En vérité, en vérité, je te le dis, si un homme ne naît d\'eau et d\'Esprit, il ne peut entrer dans le royaume de Dieu."'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=1400&auto=format&fit=crop&q=60',
              bgColor: '#3E3E42',
              author: 'Jean 3:16',
              text: "Car Dieu a tant aimé le monde qu'il a donné son Fils unique, afin que quiconque croit en lui ne périsse point, mais qu'il ait la vie éternelle."
            }
          ]}
          freeResource={{
            imageUrl:
              'https://images.unsplash.com/photo-1650658720644-e1588bd66de3?w=900&auto=format&fit=crop&q=60',
            bgColor: '#5F4C5E',
            subtitle: 'Ressources Gratuites',
            title: 'Vous voulez mieux comprendre la résurrection ?',
            buttonText: 'Rejoindre Notre Étude Biblique'
          }}
        />
      </CollectionsPageContent>
    </PageWrapper>
  )
}
