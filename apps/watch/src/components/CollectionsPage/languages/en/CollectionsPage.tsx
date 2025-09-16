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
      contentId: 'easter-explained/english',
      title: 'The True Meaning of Easter',
      category: 'Short Video',
      image:
        'https://images.unsplash.com/photo-1521106581851-da5b6457f674?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGVhc3RlcnxlbnwwfHwwfHx8MA%3D%3D',
      bgColor: '#1A1815'
    },
    {
      contentId: 'my-last-day/english',
      title: "Last hour of Jesus' life from criminal's point of view",
      category: 'Short Video',
      image:
        'https://images.unsplash.com/photo-1522442676585-c751dab71864?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dG9yYWh8ZW58MHx8MHx8fDA%3D',
      bgColor: '#A88E78'
    },
    {
      contentId: 'why-did-jesus-have-to-die/english',
      title: "The Purpose of Jesus' Sacrifice",
      category: 'Short Video',
      image:
        'https://images.unsplash.com/photo-1591561582301-7ce6588cc286?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8YnVubnl8ZW58MHx8MHx8fDA%3D',
      bgColor: '#62884C'
    },
    {
      contentId: 'did-jesus-come-back-from-the-dead/english',
      title: "The Truth About Jesus' Resurrection",
      category: 'Short Video',
      image:
        'https://images.unsplash.com/photo-1650658720644-e1588bd66de3?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cHJvcGhlY2llc3xlbnwwfHwwfHx8MA%3D%3D',
      bgColor: '#5F4C5E'
    },
    {
      contentId: 'the-story-short-film/english',
      title: 'The Story: How It All Began and How It Will Never End',
      category: 'Short Video',
      image:
        'https://images.unsplash.com/photo-1678181896030-11cf0237d704?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGplc3VzJTIwcmlzZW58ZW58MHx8MHx8fDA%3D',
      bgColor: '#72593A'
    },
    {
      contentId: 'chosen-witness/english',
      title: 'Mary Magdalene: A Life Transformed by Jesus',
      category: 'Short Video',
      image:
        'https://images.unsplash.com/photo-1606876538216-0c70a143dd77?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8amVzdXMlMjBjcm9zc3xlbnwwfHwwfHx8MA%3D%3D',
      bgColor: '#1C160B'
    }
  ]

  const shareDataTitle =
    '👋 Check out these videos about Easter origins. I thought you would like it.'

  return (
    <PageWrapper
      hero={
        <ContainerHero
          title="Easter"
          descriptionBeforeYear="Easter"
          descriptionAfterYear="videos & resources about Lent, Holy Week, Resurrection"
          feedbackButtonLabel="Give Feedback"
        />
      }
      hideHeader
      hideFooter
    >
      <CollectionsPageContent>
        <CollectionNavigationCarousel contentItems={navigationContentItems} />
        <CollectionIntroText
          title="The Real Easter story"
          subtitle="Questioning? Searching? Discover the true power of Easter."
          firstParagraph={{
            beforeHighlight: 'Beyond eggs and bunnies lies the story of ',
            highlightedText: "Jesus's life, death and resurrection.",
            afterHighlight:
              ' The true power of Easter goes beyond church services and rituals — and into the very reason why humans need a Savior.'
          }}
          secondParagraph="The Gospels are shockingly honest about the emotions Jesus experienced — His deep anguish over one of His closest friends denying he even knew Him, and the other disciples' disbelief in His resurrection — raw emotions that mirror our own struggles."
          easterDatesTitle="When is Easter celebrated in {year}?"
          thirdParagraph="Explore our collection of videos and interactive resources that invite you into the authentic story — one that changed history and continues to transform lives today.
Because the greatest celebration in human history is about far more than traditions — it's about resurrection power"
          westernEasterLabel="Western Easter (Catholic/Protestant)"
          orthodoxEasterLabel="Orthodox"
          passoverLabel="Jewish Passover"
          locale="en-US"
        />
        <CollectionsVideoContent
          contentId="easter-explained/english"
          subtitle={"Jesus' Victory Over Sin and Death"}
          title={'The True Meaning of Easter'}
          description={
            "Easter is about more than eggs and bunnies—it's about Jesus and His amazing love for us. He died on the cross for our sins and rose from the dead, showing His power over sin and death. Because of Him, we can have forgiveness and the promise of eternal life. Easter is a time to celebrate this great hope and God's incredible gift to us."
          }
          mutePage={mutePage}
          setMutePage={setMutePage}
          showDivider={false}
          questionsTitle="Related questions"
          askButtonText="Ask yours"
          bibleQuotesTitle="Bible quotes"
          quizButtonText="What's your next step of faith?"
          shareButtonText="Share"
          shareDataTitle={shareDataTitle}
          questions={[
            {
              id: 1,
              question:
                "How can I trust in God's sovereignty when the world feels so chaotic?",
              answer: (
                <>
                  <p>
                    {
                      "Even in times of chaos and uncertainty, we can trust in God's sovereignty because:"
                    }
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>
                      {
                        'God remains in control even when circumstances feel out of control'
                      }
                    </li>
                    <li>{'His purposes are higher than our understanding'}</li>
                    <li>
                      {
                        'He promises to work all things for good for those who love Him'
                      }
                    </li>
                    <li>
                      {
                        'The Bible shows countless examples of God bringing order from chaos'
                      }
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 2,
              question: 'Why is Easter the most important Christian holiday?',
              answer: (
                <>
                  <p>{'Easter is central to Christian faith because:'}</p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>
                      {
                        "It marks Jesus' resurrection, proving His victory over death"
                      }
                    </li>
                    <li>
                      {'It fulfills Old Testament prophecies about the Messiah'}
                    </li>
                    <li>{`It demonstrates God's power to give new life`}</li>
                    <li>
                      {
                        'It provides hope for our own resurrection and eternal life'
                      }
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 3,
              question:
                "What happened during the three days between Jesus' death and resurrection?",
              answer: (
                <>
                  <p>{'The Bible tells us several key events occurred:'}</p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>
                      {
                        "Jesus' body was placed in a tomb and guarded by Roman soldiers"
                      }
                    </li>
                    <li>{'His followers mourned and waited in uncertainty'}</li>
                    <li>
                      {
                        'According to Scripture, He descended to the realm of the dead'
                      }
                    </li>
                    <li>{'On the third day, He rose victorious over death'}</li>
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
              author: 'Apostle Paul',
              text: '"Where, O death, is your victory? Where, O death, is your sting?" The sting of death is sin, and the power of sin is the law. But thanks be to God! He gives us the victory through our Lord Jesus Christ.'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1522442676585-c751dab71864?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dG9yYWh8ZW58MHx8MHx8fDA%3D',
              bgColor: '#A88E78',
              author: 'Apostle Paul',
              text: '"Where, O death, is your victory? Where, O death, is your sting?" The sting of death is sin, and the power of sin is the law. But thanks be to God! He gives us the victory through our Lord Jesus Christ.'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1678181896030-11cf0237d704?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGplc3VzJTIwcmlzZW58ZW58MHx8MHx8fDA%3D',
              bgColor: '#72593A',
              author: 'Apostle Paul',
              text: '"Where, O death, is your victory? Where, O death, is your sting?" The sting of death is sin, and the power of sin is the law. But thanks be to God! He gives us the victory through our Lord Jesus Christ.'
            }
          ]}
          freeResource={{
            imageUrl:
              'https://images.unsplash.com/photo-1650658720644-e1588bd66de3?w=900&auto=format&fit=crop&q=60',
            bgColor: '#5F4C5E',
            subtitle: 'Free Resources',
            title: 'Want to grow deep in your understanding of the Bible?',
            buttonText: 'Join Our Bible study'
          }}
        />
        <CollectionShowcaseSection
          id="other-collections"
          sources={collectionShowcaseSources}
          primaryCollectionId="LUMOCollection"
          subtitleOverride="Video Bible Collection"
          titleOverride="The Easter story is a key part of a bigger picture"
          descriptionOverride="<strong>Our mission</strong> is to introduce people to the Bible through films and videos that faithfully bring the Gospels to life. By visually telling the story of Jesus and God's love for humanity, we make Scripture more accessible, engaging, and easy to understand."
        />
        <CollectionsVideoContent
          contentId="my-last-day/english"
          subtitle={'My Last Day'}
          title={"Last hour of Jesus' life from criminal's point of view"}
          description={
            "A condemned thief watches in horror as Jesus is brutally flogged in Pilate's courtyard, memories of his own crimes flooding his mind. Why would they punish an innocent man? The roar of the crowd seals their fate—crucifixion. Forced to carry their crosses to Golgotha, he stumbles beside Jesus, the weight of his past and his sentence crushing him. As nails pierce flesh and the sky darkens, he makes a desperate plea—could this truly be the Messiah? In his final moments, Jesus gives him an unexpected promise: Today, you will be with me in paradise. Watch as this powerful moment unfolds."
          }
          mutePage={mutePage}
          setMutePage={setMutePage}
          questionsTitle="Related questions"
          askButtonText="Ask yours"
          bibleQuotesTitle="Bible quotes"
          shareButtonText="Share"
          shareDataTitle={shareDataTitle}
          quizButtonText="What's your next step of faith?"
          startAt={3000}
          questions={[
            {
              id: 1,
              question: 'Why would Jesus forgive a criminal so easily?',
              answer: (
                <>
                  <p>
                    {
                      "Jesus' forgiveness is a demonstration of God's grace and mercy. The thief on the cross recognized Jesus' innocence and divinity, humbly asking to be remembered in His kingdom. Jesus' response shows:"
                    }
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>{'Salvation is based on faith, not deeds'}</li>
                    <li>
                      {"God's mercy extends to all, even the worst sinners"}
                    </li>
                    <li>
                      {
                        'Jesus came to save the lost, including criminals and outcasts'
                      }
                    </li>
                    <li>
                      {'Grace is freely given to those who sincerely seek it'}
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 2,
              question:
                "If Jesus was innocent, why didn't he save himself instead of accepting death?",
              answer: (
                <>
                  <p>
                    {
                      "Jesus willingly accepted death because it was part of God's plan for redemption. His sacrifice was necessary to fulfill prophecy and bring salvation. Key reasons include:"
                    }
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>
                      {
                        'His death fulfilled Old Testament prophecies (Isaiah 53)'
                      }
                    </li>
                    <li>{`He took on the punishment for humanity's sins`}</li>
                    <li>
                      {
                        'By not saving Himself, He demonstrated His ultimate love and obedience to God'
                      }
                    </li>
                    <li>
                      {'His resurrection proved His victory over sin and death'}
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 3,
              question:
                "What does it really mean to be 'in paradise' with Jesus?",
              answer: (
                <>
                  <p>
                    {
                      'Being in paradise with Jesus means eternal life in the presence of God. The thief on the cross was assured of his place with Jesus in heaven because of his faith. Important aspects of this promise include:'
                    }
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>
                      {
                        'It signifies immediate presence with Christ after death'
                      }
                    </li>
                    <li>{'It confirms salvation through faith alone'}</li>
                    <li>{'It offers hope of eternal joy and peace'}</li>
                    <li>
                      {
                        "Jesus' words affirm the reality of life beyond this world"
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
              author: 'Jesus (Luke 23:43)',
              text: 'Truly I tell you, today you will be with me in paradise.'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1709471875678-0b3627a3c099?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzJ8fGZvcmdpdmV8ZW58MHx8MHx8fDA%3D',
              bgColor: '#031829',
              author: 'Jesus (Luke 23:34)',
              text: 'Father, forgive them, for they do not know what they are doing.'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1595119591974-a9bd1532c1b0?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGNocmlzdHxlbnwwfHwwfHx8MA%3D%3D',
              bgColor: '#0E0D0F',
              author: 'Isaiah 53:5',
              text: 'But he was pierced for our transgressions, he was crushed for our iniquities; the punishment that brought us peace was on him, and by his wounds we are healed.'
            }
          ]}
          freeResource={{
            imageUrl:
              'https://images.unsplash.com/photo-1650658720644-e1588bd66de3?w=900&auto=format&fit=crop&q=60',
            bgColor: '#5F4C5E',
            subtitle: 'Free Resources',
            title: 'Want to grow deep in your understanding of the Bible?',
            buttonText: 'Join Our Bible study'
          }}
        />

        <CollectionVideoContentCarousel
          id="easter-documentary-series"
          subtitle={'Easter Documentary Series'}
          title={'Did Jesus Defeat Death?'}
          description={
            "Go on this adventure to time travel to the 1st century and check out other theories for Jesus's empty tomb."
          }
          contentId="31-how-did-jesus-die/english"
          videoTitle={'How Did Jesus Die?'}
          mutePage={mutePage}
          setMutePage={setMutePage}
          seeAllText="See All"
          shortVideoText="Short Video"
          slides={[
            {
              contentId: '31-how-did-jesus-die/english',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/7_0-nfs0301.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#161817',
              title: 'How Did Jesus Die?'
            },
            {
              contentId: '32-what-happened-next/english',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/7_0-nfs0302.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#000906',
              title: 'What Happened Next?'
            },
            {
              contentId: '33-do-the-facts-stack-up/english',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/7_0-nfs0303.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#2B2018',
              title: 'Why is Easter celebrated with bunnies?'
            }
          ]}
        />
        <CollectionsVideoContent
          contentId="why-did-jesus-have-to-die/english"
          subtitle={'Why Did Jesus Have to Die?'}
          title={"The Purpose of Jesus' Sacrifice"}
          description={
            "God created humans to be spiritually and relationally connected with Him, but how can we keep God's commands? How can we live without shame? We can't restore ourselves to honor. It would seem we're doomed, except God doesn't want His creation to die. He is merciful and loving, and wants us to be restored, living with Him in full life."
          }
          mutePage={mutePage}
          setMutePage={setMutePage}
          questionsTitle="Related questions"
          askButtonText="Ask yours"
          bibleQuotesTitle="Bible quotes"
          shareButtonText="Share"
          shareDataTitle={shareDataTitle}
          quizButtonText="What's your next step of faith?"
          questions={[
            {
              id: 1,
              question: "Why was Jesus' death necessary?",
              answer: (
                <>
                  <p>
                    {
                      "Jesus' death was necessary to fulfill God's plan of redemption. Because of sin, humanity was separated from God, but Jesus' sacrifice provided the way for reconciliation. Here's why His death was essential:"
                    }
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>{'Sin creates a barrier between us and God'}</li>
                    <li>{"God's justice requires a payment for sin"}</li>
                    <li>{'Jesus, as the perfect sacrifice, took our place'}</li>
                    <li>
                      {
                        'Through His death, we receive forgiveness and restoration'
                      }
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 2,
              question:
                "If God is loving, why didn't He just forgive sin without Jesus' sacrifice?",
              answer: (
                <>
                  <p>
                    {
                      "God's love and justice go hand in hand. While He desires to forgive, He also upholds justice. Jesus' sacrifice was the ultimate expression of both:"
                    }
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>
                      {'Forgiveness requires a cost, and Jesus paid that cost'}
                    </li>
                    <li>
                      {
                        "His death satisfied God's justice while showing His mercy"
                      }
                    </li>
                    <li>
                      {'Through Jesus, God demonstrated His love for humanity'}
                    </li>
                    <li>
                      {
                        'His sacrifice allows us to be restored without compromising divine justice'
                      }
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 3,
              question:
                "How does Jesus' death affect our relationship with God?",
              answer: (
                <>
                  <p>
                    {
                      "Jesus' death and resurrection opened the way for us to be reconciled with God. Through Him, we can:"
                    }
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>{'Experience forgiveness and freedom from sin'}</li>
                    <li>{'Have direct access to God through Christ'}</li>
                    <li>{'Receive the gift of eternal life'}</li>
                    <li>{'Live in restored relationship with our Creator'}</li>
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
              author: 'Romans 5:8',
              text: 'But God demonstrates his own love for us in this: While we were still sinners, Christ died for us.'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1658512341640-2db6ae31906b?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGpvaG4lMjAzJTNBMTZ8ZW58MHx8MHx8fDA%3D',
              bgColor: '#050507',
              author: 'John 3:16',
              text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1586490110711-7e174d0d043f?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8am9obiUyMDMlM0ExNnxlbnwwfHwwfHx8MA%3D%3D',
              bgColor: '#5B5A5C',
              author: '1 Peter 2:24',
              text: 'He himself bore our sins in his body on the cross, so that we might die to sins and live for righteousness; by his wounds you have been healed.'
            }
          ]}
          freeResource={{
            imageUrl:
              'https://images.unsplash.com/photo-1650658720644-e1588bd66de3?w=900&auto=format&fit=crop&q=60',
            bgColor: '#5F4C5E',
            subtitle: 'Free Resources',
            title: "Want to understand more about Jesus' sacrifice?",
            buttonText: 'Join Our Bible study'
          }}
        />

        <CollectionsVideoContent
          contentId="talk-with-nicodemus/english"
          subtitle={'From Religion to Relationship'}
          title={'The Gospel in One Conversation'}
          description={
            "In a private conversation at night, Nicodemus, a respected Jewish teacher, came to Jesus seeking truth. Jesus told him that no one can see the kingdom of God unless they are born again. This deep conversation reveals the heart of Jesus' mission—to bring spiritual rebirth through the Holy Spirit. Discover what it means to be born again and why it's essential for eternal life."
          }
          mutePage={mutePage}
          setMutePage={setMutePage}
          questionsTitle="Related questions"
          askButtonText="Ask yours"
          bibleQuotesTitle="Bible quotes"
          quizButtonText="What's your next step of faith?"
          shareButtonText="Share"
          shareDataTitle={shareDataTitle}
          questions={[
            {
              id: 1,
              question: 'What does it mean to be born again?',
              answer: (
                <>
                  <p>
                    {
                      "Being 'born again' means experiencing a spiritual rebirth. Jesus explained to Nicodemus that this rebirth is not physical but spiritual—born of water and the Spirit."
                    }
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>{'It is a work of the Holy Spirit'}</li>
                    <li>{'It involves believing in Jesus as Savior'}</li>
                    <li>
                      {'It brings new life and a new relationship with God'}
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 2,
              question: 'Why did Jesus tell Nicodemus he must be born again?',
              answer: (
                <>
                  <p>
                    {`Jesus wanted Nicodemus to understand that religious knowledge and good deeds are not enough. To enter God's kingdom, a complete inner transformation is needed.`}
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>{'It shows our need for spiritual renewal'}</li>
                    <li>{'It points to salvation through faith, not works'}</li>
                    <li>{'It emphasizes the role of the Holy Spirit'}</li>
                  </ul>
                </>
              )
            },
            {
              id: 3,
              question: 'How can someone be born again?',
              answer: (
                <>
                  <p>
                    {
                      'Jesus explained that being born again comes through believing in Him. It is a personal step of faith that results in a new life in God.'
                    }
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>{'Believe in Jesus Christ as the Son of God'}</li>
                    <li>{'Accept His sacrifice for your sins'}</li>
                    <li>
                      {'Invite the Holy Spirit to renew your heart and mind'}
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
              author: 'John 3:3',
              text: 'Jesus replied, "Very truly I tell you, no one can see the kingdom of God unless they are born again."'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1574957973698-418ac4c877af?w=1400&auto=format&fit=crop&q=60',
              bgColor: '#1A1A1D',
              author: 'John 3:5',
              text: 'Jesus answered, "Very truly I tell you, no one can enter the kingdom of God unless they are born of water and the Spirit."'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=1400&auto=format&fit=crop&q=60',
              bgColor: '#3E3E42',
              author: 'John 3:16',
              text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.'
            }
          ]}
          freeResource={{
            imageUrl:
              'https://images.unsplash.com/photo-1650658720644-e1588bd66de3?w=900&auto=format&fit=crop&q=60',
            bgColor: '#5F4C5E',
            subtitle: 'Free Resources',
            title: 'Want to understand more about the resurrection?',
            buttonText: 'Join Our Bible study'
          }}
        />

        <CollectionsVideoContent
          contentId="did-jesus-come-back-from-the-dead/english"
          subtitle={'Did Jesus Come Back From the Dead?'}
          title={"The Truth About Jesus' Resurrection"}
          description={
            "Jesus told people that he would die and then come back to life. This short film explains the details surrounding Jesus' death and resurrection. His closest followers struggled to believe, but eyewitnesses confirmed the truth: He rose again. The news of His resurrection spread across the world, changing lives forever. Because of these witnesses, we can have confidence in the reality of Jesus' resurrection."
          }
          mutePage={mutePage}
          setMutePage={setMutePage}
          questionsTitle="Related questions"
          askButtonText="Ask yours"
          bibleQuotesTitle="Bible quotes"
          quizButtonText="What's your next step of faith?"
          shareButtonText="Share"
          shareDataTitle={shareDataTitle}
          questions={[
            {
              id: 1,
              question: 'How do we know Jesus really died and rose again?',
              answer: (
                <>
                  <p>
                    {
                      "There is strong historical and biblical evidence for Jesus' death and resurrection:"
                    }
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>
                      {'Roman soldiers confirmed His death before burying Him'}
                    </li>
                    <li>{`Jesus' tomb was sealed and guarded`}</li>
                    <li>
                      {
                        'Hundreds of witnesses saw Jesus alive after His resurrection'
                      }
                    </li>
                    <li>
                      {
                        'His disciples, once afraid, boldly preached and died for this truth'
                      }
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 2,
              question: 'Why is the resurrection of Jesus important?',
              answer: (
                <>
                  <p>
                    {'The resurrection is central to Christian faith because:'}
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>{`It proves Jesus' victory over sin and death`}</li>
                    <li>
                      {'It fulfills Old Testament prophecies about the Messiah'}
                    </li>
                    <li>{`It demonstrates God's power to give new life`}</li>
                    <li>
                      {'It gives believers hope of eternal life with Him'}
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 3,
              question:
                "How should we respond to Jesus' death and resurrection?",
              answer: (
                <>
                  <p>
                    {
                      "Jesus' resurrection calls for a personal response. We can:"
                    }
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>{'Believe in Him as our Savior and Lord'}</li>
                    <li>{'Repent from sin and follow His teachings'}</li>
                    <li>
                      {'Share the good news of His resurrection with others'}
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
              author: 'Romans 5:8',
              text: 'But God demonstrates his own love for us in this: While we were still sinners, Christ died for us.'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1658512341640-2db6ae31906b?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGpvaG4lMjAzJTNBMTZ8ZW58MHx8MHx8fDA%3D',
              bgColor: '#050507',
              author: 'John 3:16',
              text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1586490110711-7e174d0d043f?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8am9obiUyMDMlM0ExNnxlbnwwfHwwfHx8MA%3D%3D',
              bgColor: '#5B5A5C',
              author: '1 Peter 2:24',
              text: 'He himself bore our sins in his body on the cross, so that we might die to sins and live for righteousness; by his wounds you have been healed.'
            }
          ]}
          freeResource={{
            imageUrl:
              'https://images.unsplash.com/photo-1650658720644-e1588bd66de3?w=900&auto=format&fit=crop&q=60',
            bgColor: '#5F4C5E',
            subtitle: 'Free Resources',
            title: 'Want to understand more about the resurrection?',
            buttonText: 'Join Our Bible study'
          }}
        />

        <CollectionVideoContentCarousel
          id="easter-events-day-by-day"
          subtitle={'Bible Videos'}
          title={'Easter Events Day By Day'}
          description={
            'Follow along with the events of Easter day by day as described in the Gospel of Luke.'
          }
          contentId="upper-room-teaching/english"
          videoTitle={'Upper Room Teaching'}
          mutePage={mutePage}
          setMutePage={setMutePage}
          seeAllText="See All"
          shortVideoText="Short Video"
          slides={[
            {
              contentId: 'upper-room-teaching/english',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6143-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#161817',
              title: 'Upper Room Teaching'
            },
            {
              contentId: 'jesus-is-betrayed-and-arrested/english',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6144-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#000906',
              title: 'Jesus is Betrayed and Arrested'
            },
            {
              contentId: 'peter-disowns-jesus/english',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6145-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#100704',
              title: 'Peter Disowns Jesus'
            },
            {
              contentId: 'jesus-is-mocked-and-questioned/english',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6146-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#0A0E0D',
              title: 'Jesus is Mocked and Questioned'
            },
            {
              contentId: 'jesus-is-brought-to-pilate/english',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6147-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#170E07',
              title: 'Jesus is Brought To Pilate'
            },
            {
              contentId: 'jesus-is-brought-to-herod/english',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6148-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#0F0D03',
              title: 'Jesus is Brought to Herod'
            },
            {
              contentId: 'jesus-is-sentenced/english',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6149-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#322314',
              title: 'Jesus is Sentenced'
            },
            {
              contentId: 'death-of-jesus/english',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6155-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#1D1B13',
              title: 'Death of Jesus'
            },
            {
              contentId: 'burial-of-jesus/english',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6156-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#231E1F',
              title: 'Burial of Jesus'
            },
            {
              contentId: 'angels-at-the-tomb/english',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6157-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#1A190E',
              title: 'Angels at the Tomb'
            },
            {
              contentId: 'the-tomb-is-empty/english',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6158-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#151D12',
              title: 'The Tomb is Empty'
            },
            {
              contentId: 'resurrected-jesus-appears/english',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6159-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#0B0501',
              title: 'Resurrected Jesus Appears'
            },
            {
              contentId: 'great-commission-and-ascension/english',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6160-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#2B2118',
              title: 'The Great Commission and Ascension'
            },
            {
              contentId: 'invitation-to-know-jesus-personally/english',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6161-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#27160F',
              title: 'Invitation to Know Jesus Personally'
            }
          ]}
        />

        <CollectionsVideoContent
          contentId="the-story-short-film/english"
          subtitle={'The Story Short Film'}
          title={'The Story: How It All Began and How It Will Never End'}
          description={
            "The Story is a short film of how everything began and how it can never end. This film shares the overarching story of the Bible, a story that redeems all stories and brings new life through salvation in Jesus alone. It answers life's biggest questions: Where did we come from? What went wrong? Is there any hope? And what does the future hold?"
          }
          mutePage={mutePage}
          setMutePage={setMutePage}
          questionsTitle="Related questions"
          askButtonText="Ask yours"
          bibleQuotesTitle="Bible quotes"
          quizButtonText="What's your next step of faith?"
          shareButtonText="Share"
          shareDataTitle={shareDataTitle}
          questions={[
            {
              id: 1,
              question:
                'Where did everything come from? Is there a purpose to life?',
              answer: (
                <>
                  <p>
                    {
                      'The Bible teaches that everything began with God, the Creator of the universe. He spoke everything into existence with purpose and design. Humanity was created in His image to live in harmony with Him, each other, and creation.'
                    }
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>{'God created the world out of love and order'}</li>
                    <li>
                      {
                        'Everything was originally perfect, without pain or suffering'
                      }
                    </li>
                    <li>
                      {
                        'Humans were designed to have a personal relationship with God'
                      }
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 2,
              question:
                'If God is good, why is there so much suffering in the world?',
              answer: (
                <>
                  <p>
                    {
                      'Suffering exists because sin entered the world when humanity chose to rebel against God. This disobedience broke the original perfection, introducing death, pain, and separation from God.'
                    }
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>{'Sin brought suffering, brokenness, and death'}</li>
                    <li>{'We all contribute to the problem of sin'}</li>
                    <li>
                      {
                        'Despite this, God did not abandon humanity—He provided a way for restoration'
                      }
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 3,
              question:
                'Is there any hope for the world to be made right again?',
              answer: (
                <>
                  <p>
                    {
                      'Yes! God sent Jesus as the rescuer. Jesus lived a perfect life, died on the cross to pay for sin, and rose from the dead to defeat death itself. Through Him, we can be restored to God and experience a new life.'
                    }
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>{"Jesus' sacrifice makes forgiveness possible"}</li>
                    <li>{'His resurrection proves His power over death'}</li>
                    <li>
                      {
                        'Those who trust in Jesus receive new life and a restored relationship with God'
                      }
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 4,
              question:
                'What will happen in the future? Is there life after death?',
              answer: (
                <>
                  <p>
                    {
                      'According to the Bible, God has promised a future where He will restore everything. Those who trust in Jesus will live forever with Him in a perfect, renewed world. Sin, suffering, and death will be no more.'
                    }
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>{'God will create a new heaven and a new earth'}</li>
                    <li>{'There will be no more pain, suffering, or death'}</li>
                    <li>
                      {'Jesus will return to judge the living and the dead'}
                    </li>
                    <li>
                      {
                        'Everyone must decide how they will respond to this truth'
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
                'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y3JlYXRpb258ZW58MHx8MHx8fDA%3D',
              bgColor: '#010101',
              author: 'Genesis 1:1',
              text: 'In the beginning, God created the heavens and the earth.'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1513082325166-c105b20374bb?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG1pc3Rha2V8ZW58MHx8MHx8fDA%3D',
              bgColor: '#6C7B80',
              author: 'Romans 3:23-24',
              text: 'For all have sinned and fall short of the glory of God, and all are justified freely by His grace through the redemption that came by Christ Jesus.'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1524088484081-4ca7e08e3e19?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dGVhcnN8ZW58MHx8MHx8fDA%3D',
              bgColor: '#87695B',
              author: 'Revelation 21:4',
              text: 'He will wipe every tear from their eyes. There will be no more death or mourning or crying or pain, for the old order of things has passed away.'
            }
          ]}
          freeResource={{
            imageUrl:
              'https://images.unsplash.com/photo-1650658720644-e1588bd66de3?w=900&auto=format&fit=crop&q=60',
            bgColor: '#5F4C5E',
            subtitle: 'Free Resources',
            title: "Want to explore life's biggest questions?",
            buttonText: 'Join Our Bible study'
          }}
        />
        <CollectionsVideoContent
          contentId="chosen-witness/english"
          subtitle={'Chosen Witness'}
          title={'Mary Magdalene: A Life Transformed by Jesus'}
          description={
            "Mary Magdalene's life was dramatically transformed by Jesus, the man who would change the world forever. Once an outcast, she became one of His most devoted followers. In this animated short film, witness the life of Jesus through her eyes—from her redemption to the moment she became the first to witness His resurrection."
          }
          mutePage={mutePage}
          setMutePage={setMutePage}
          questionsTitle="Related questions"
          askButtonText="Ask yours"
          bibleQuotesTitle="Bible quotes"
          quizButtonText="What's your next step of faith?"
          shareButtonText="Share"
          shareDataTitle={shareDataTitle}
          questions={[
            {
              id: 1,
              question:
                'In what ways do you identify with the main character, Mary Magdalene?',
              answer: (
                <>
                  <p>
                    {
                      "Mary Magdalene's story is one of transformation and redemption. Like many of us, she carried a past filled with struggles, but Jesus freed her and gave her a new purpose. Her story teaches us:"
                    }
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>{'Jesus offers redemption regardless of our past'}</li>
                    <li>{'Faith in Christ brings healing and purpose'}</li>
                    <li>
                      {'God calls the least expected to be His witnesses'}
                    </li>
                    <li>{'Encountering Jesus changes everything'}</li>
                  </ul>
                </>
              )
            },
            {
              id: 2,
              question: "Why do you think the elders didn't approve of Jesus?",
              answer: (
                <>
                  <p>
                    {
                      'The religious leaders opposed Jesus because His teachings challenged their authority and traditions. Key reasons include:'
                    }
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>
                      {
                        'He welcomed sinners and outcasts, disrupting social norms'
                      }
                    </li>
                    <li>
                      {'His claim to be the Son of God threatened their power'}
                    </li>
                    <li>
                      {
                        'He emphasized mercy over legalism, angering those who relied on the law'
                      }
                    </li>
                    <li>
                      {
                        'His miracles and growing influence unsettled their control over the people'
                      }
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 3,
              question:
                'After his resurrection, why do you think Jesus chose to speak first with Mary?',
              answer: (
                <>
                  <p>
                    {
                      "Jesus' first appearance to Mary Magdalene was deeply significant. It showed:"
                    }
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>{'His care for those the world overlooked'}</li>
                    <li>
                      {'The importance of faith and devotion over status'}
                    </li>
                    <li>
                      {
                        'That women played a vital role in His ministry and message'
                      }
                    </li>
                    <li>
                      {'How a transformed life can become a powerful testimony'}
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
              author: 'Luke 8:2',
              text: 'And also some women who had been cured of evil spirits and diseases: Mary (called Magdalene) from whom seven demons had come out.'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1522442676585-c751dab71864?w=900&auto=format&fit=crop&q=60',
              bgColor: '#A88E78',
              author: 'John 20:16',
              text: 'Jesus said to her, "Mary." She turned toward him and cried out in Aramaic, "Rabboni!" (which means "Teacher").'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1678181896030-11cf0237d704?w=900&auto=format&fit=crop&q=60',
              bgColor: '#72593A',
              author: 'Mark 16:9',
              text: 'Now when Jesus was risen early the first day of the week, he appeared first to Mary Magdalene, out of whom he had cast seven devils.'
            }
          ]}
          freeResource={{
            imageUrl:
              'https://images.unsplash.com/photo-1650658720644-e1588bd66de3?w=900&auto=format&fit=crop&q=60',
            bgColor: '#5F4C5E',
            subtitle: 'Free Resources',
            title: "Want to deepen your understanding of Jesus' life?",
            buttonText: 'Join Our Bible study'
          }}
        />

        <CollectionVideoContentCarousel
          id="new-believer-course"
          subtitle={'Video Course'}
          title={'New Believer Course'}
          description={
            "If you've ever wondered what Christianity is about, or what sort of lifestyle it empowers you to live, the New Believer Course exists to help you understand the Gospel and live your life in response to it."
          }
          contentId="1-the-simple-gospel/english"
          videoTitle={'1. The Simple Gospel'}
          mutePage={mutePage}
          setMutePage={setMutePage}
          seeAllText="See All"
          shortVideoText="Short Video"
          slides={[
            {
              contentId: '1-the-simple-gospel/english',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/8_NBC01.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#FF9A8E',
              title: '1. The Simple Gospel'
            },
            {
              contentId: '2-the-blood-of-jesus/english',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/8_NBC02.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#D4BD20',
              title: '2. The Blood of Jesus'
            },
            {
              contentId: '3-life-after-death/english',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/8_NBC03.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#FBAB2C',
              title: '3. Life After Death'
            },
            {
              contentId: '4-god-forgiveness/english',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/8_NBC04.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#BD862D',
              title: "4. God's Forgiveness"
            },
            {
              contentId: '5-savior-lord-and-friend/english',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/8_NBC05.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#3C7B86',
              title: '5. Savior, Lord, and Friend'
            },
            {
              contentId: '6-being-made-new/english',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/8_NBC06.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#02B9B6',
              title: '6. Being Made New'
            },
            {
              contentId: '7-living-for-god/english',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/8_NBC07.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#243856',
              title: '7. Living for God'
            },
            {
              contentId: '8-the-bible/english',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/8_NBC08.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#FCB02D',
              title: '8. The Bible'
            },
            {
              contentId: '9-prayer/english',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/8_NBC09.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#3C7B86',
              title: '9. Prayer'
            },
            {
              contentId: '10-church/english',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/8_NBC10.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#EB8311',
              title: '10. Church'
            }
          ]}
        />

        <CollectionsVideoContent
          contentId="invitation-to-know-jesus-personally/english"
          subtitle={'Are you ready to make the next step of faith?'}
          title={'Invitation to Know Jesus Personally'}
          description={
            "The invitation is open to everyone. It means turning to God and trusting Jesus with our lives and to forgive our sins. We can speak to Him in prayer when we're ready to become followers of Jesus."
          }
          mutePage={mutePage}
          setMutePage={setMutePage}
          questionsTitle="Related questions"
          askButtonText="Ask yours"
          bibleQuotesTitle="Bible quotes"
          quizButtonText="What's your next step of faith?"
          shareButtonText="Share"
          shareDataTitle={shareDataTitle}
          questions={[
            {
              id: 1,
              question: "Why do I need saving if I'm a good person?",
              answer: (
                <>
                  <p>
                    {
                      'The Bible says, "There is no one righteous, not even one" (Romans 3:10). God\'s standard is perfection, and all have sinned and fall short of His glory (Romans 3:23). Being good by human standards isn\'t enough to remove the guilt of sin. Salvation is not earned by good deeds but received by grace through faith in Jesus (Ephesians 2:8–9). Only His sacrifice can cleanse us and make us right with God.'
                    }
                  </p>
                </>
              )
            },
            {
              id: 2,
              question:
                "Why did Jesus have to die? Couldn't God just forgive us?",
              answer: (
                <>
                  <p>
                    {
                      'God is holy and just, and the Bible says, "The wages of sin is death" (Romans 6:23). Sin separates us from God, and justice demands a penalty. Jesus died in our place as a perfect sacrifice to satisfy God\'s justice and show His love. Hebrews 9:22 says, "Without the shedding of blood there is no forgiveness." Jesus paid the debt we couldn\'t pay, and through Him, forgiveness is offered.'
                    }
                  </p>
                </>
              )
            },
            {
              id: 3,
              question:
                "If Jesus rose from the dead, why doesn't everyone believe in Him?",
              answer: (
                <>
                  <p>
                    {
                      "Many reject Jesus because they love darkness more than light (John 3:19). Believing in Jesus requires humility, repentance, and surrender. Some are blinded by pride, sin, or the world's distractions (2 Corinthians 4:4). Others have not truly heard the Gospel or have hardened their hearts. Faith is a response to God's call, but He does not force anyone to believe (Revelation 3:20)."
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
              author: 'John 1:29',
              text: 'Look, the Lamb of God, who takes away the sin of the world!'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1522442676585-c751dab71864?w=900&auto=format&fit=crop&q=60',
              bgColor: '#A88E78',
              author: 'Romans 6:23',
              text: 'For the wages of sin is death, but the gift of God is eternal life in Christ Jesus our Lord.'
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1678181896030-11cf0237d704?w=900&auto=format&fit=crop&q=60',
              bgColor: '#72593A',
              author: 'Revelation 3:20',
              text: 'Here I am! I stand at the door and knock. If anyone hears my voice and opens the door, I will come in and eat with that person, and they with me.'
            }
          ]}
          freeResource={{
            imageUrl:
              'https://images.unsplash.com/photo-1650658720644-e1588bd66de3?w=900&auto=format&fit=crop&q=60',
            bgColor: '#5F4C5E',
            subtitle: 'Free Resources',
            title: "Want to deepen your understanding of Jesus' life?",
            buttonText: 'Join Our Bible study'
          }}
        />
      </CollectionsPageContent>
    </PageWrapper>
  )
}
