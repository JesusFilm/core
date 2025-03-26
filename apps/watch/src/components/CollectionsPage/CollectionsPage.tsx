import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import { PageWrapper } from '../PageWrapper'

import { CollectionsPageContent } from './CollectionsPageContent'
import { CollectionsVideoContent } from './CollectionsVideoContent'
import { CollectionVideoContentCarousel } from './CollectionVideoContentCarousel'
import { ContainerHero } from './ContainerHero'

export function CollectionsPage(): ReactElement {
  const { t } = useTranslation('apps-watch')
  const [mutePage, setMutePage] = useState(true)

  return (
    <PageWrapper hero={<ContainerHero />} hideHeader hideFooter>
      <CollectionsPageContent>
        <CollectionsVideoContent
          contentId="easter-explained/english"
          subtitle={t("Jesus' Victory Over Sin and Death")}
          title={t('The True Meaning of Easter')}
          description={t(
            "Easter is about more than eggs and bunnies—it's about Jesus and His amazing love for us. He died on the cross for our sins and rose from the dead, showing His power over sin and death. Because of Him, we can have forgiveness and the promise of eternal life. Easter is a time to celebrate this great hope and God's incredible gift to us."
          )}
          mutePage={mutePage}
          setMutePage={setMutePage}
          questions={[
            {
              id: 1,
              question: t(
                "How can I trust in God's sovereignty when the world feels so chaotic?"
              ),
              answer: (
                <>
                  <p>
                    {t(
                      "Even in times of chaos and uncertainty, we can trust in God's sovereignty because:"
                    )}
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>
                      {t(
                        'God remains in control even when circumstances feel out of control'
                      )}
                    </li>
                    <li>
                      {t('His purposes are higher than our understanding')}
                    </li>
                    <li>
                      {t(
                        'He promises to work all things for good for those who love Him'
                      )}
                    </li>
                    <li>
                      {t(
                        'The Bible shows countless examples of God bringing order from chaos'
                      )}
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 2,
              question: t(
                'Why is Easter the most important Christian holiday?'
              ),
              answer: (
                <>
                  <p>{t('Easter is central to Christian faith because:')}</p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>
                      {t(
                        "It marks Jesus' resurrection, proving His victory over death"
                      )}
                    </li>
                    <li>
                      {t(
                        'It fulfills Old Testament prophecies about the Messiah'
                      )}
                    </li>
                    <li>{t("It demonstrates God's power to give new life")}</li>
                    <li>
                      {t(
                        'It provides hope for our own resurrection and eternal life'
                      )}
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 3,
              question: t(
                "What happened during the three days between Jesus' death and resurrection?"
              ),
              answer: (
                <>
                  <p>{t('The Bible tells us several key events occurred:')}</p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>
                      {t(
                        "Jesus' body was placed in a tomb and guarded by Roman soldiers"
                      )}
                    </li>
                    <li>
                      {t('His followers mourned and waited in uncertainty')}
                    </li>
                    <li>
                      {t(
                        'According to Scripture, He descended to the realm of the dead'
                      )}
                    </li>
                    <li>
                      {t('On the third day, He rose victorious over death')}
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
              author: t('Apostle Paul'),
              text: t(
                '"Where, O death, is your victory? Where, O death, is your sting?" The sting of death is sin, and the power of sin is the law. But thanks be to God! He gives us the victory through our Lord Jesus Christ.'
              )
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1522442676585-c751dab71864?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dG9yYWh8ZW58MHx8MHx8fDA%3D',
              bgColor: '#A88E78',
              author: t('Apostle Paul'),
              text: t(
                '"Where, O death, is your victory? Where, O death, is your sting?" The sting of death is sin, and the power of sin is the law. But thanks be to God! He gives us the victory through our Lord Jesus Christ.'
              )
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1678181896030-11cf0237d704?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGplc3VzJTIwcmlzZW58ZW58MHx8MHx8fDA%3D',
              bgColor: '#72593A',
              author: t('Apostle Paul'),
              text: t(
                '"Where, O death, is your victory? Where, O death, is your sting?" The sting of death is sin, and the power of sin is the law. But thanks be to God! He gives us the victory through our Lord Jesus Christ.'
              )
            }
          ]}
          freeResource={{
            imageUrl:
              'https://images.unsplash.com/photo-1650658720644-e1588bd66de3?w=900&auto=format&fit=crop&q=60',
            bgColor: '#5F4C5E',
            subtitle: t('Free Resources'),
            title: t('Want to grow deep in your understanding of the Bible?'),
            buttonText: t('Join Our Bible study')
          }}
          showDivider={false}
        />
        <CollectionsVideoContent
          contentId="my-last-day/english"
          subtitle={t('My Last Day')}
          title={t("Last hour of Jesus' life from criminal's point of view")}
          description={t(
            "A condemned thief watches in horror as Jesus is brutally flogged in Pilate's courtyard, memories of his own crimes flooding his mind. Why would they punish an innocent man? The roar of the crowd seals their fate—crucifixion. Forced to carry their crosses to Golgotha, he stumbles beside Jesus, the weight of his past and his sentence crushing him. As nails pierce flesh and the sky darkens, he makes a desperate plea—could this truly be the Messiah? In his final moments, Jesus gives him an unexpected promise: Today, you will be with me in paradise. Watch as this powerful moment unfolds."
          )}
          mutePage={mutePage}
          setMutePage={setMutePage}
          questions={[
            {
              id: 1,
              question: t('Why would Jesus forgive a criminal so easily?'),
              answer: (
                <>
                  <p>
                    {t(
                      "Jesus' forgiveness is a demonstration of God's grace and mercy. The thief on the cross recognized Jesus' innocence and divinity, humbly asking to be remembered in His kingdom. Jesus' response shows:"
                    )}
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>{t('Salvation is based on faith, not deeds')}</li>
                    <li>
                      {t("God's mercy extends to all, even the worst sinners")}
                    </li>
                    <li>
                      {t(
                        'Jesus came to save the lost, including criminals and outcasts'
                      )}
                    </li>
                    <li>
                      {t(
                        'Grace is freely given to those who sincerely seek it'
                      )}
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 2,
              question: t(
                "If Jesus was innocent, why didn't he save himself instead of accepting death?"
              ),
              answer: (
                <>
                  <p>
                    {t(
                      "Jesus willingly accepted death because it was part of God's plan for redemption. His sacrifice was necessary to fulfill prophecy and bring salvation. Key reasons include:"
                    )}
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>
                      {t(
                        'His death fulfilled Old Testament prophecies (Isaiah 53)'
                      )}
                    </li>
                    <li>
                      {t("He took on the punishment for humanity's sins")}
                    </li>
                    <li>
                      {t(
                        'By not saving Himself, He demonstrated His ultimate love and obedience to God'
                      )}
                    </li>
                    <li>
                      {t(
                        'His resurrection proved His victory over sin and death'
                      )}
                    </li>
                  </ul>
                </>
              )
            },
            {
              id: 3,
              question: t(
                "What does it really mean to be 'in paradise' with Jesus?"
              ),
              answer: (
                <>
                  <p>
                    {t(
                      'Being in paradise with Jesus means eternal life in the presence of God. The thief on the cross was assured of his place with Jesus in heaven because of his faith. Important aspects of this promise include:'
                    )}
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>
                      {t(
                        'It signifies immediate presence with Christ after death'
                      )}
                    </li>
                    <li>{t('It confirms salvation through faith alone')}</li>
                    <li>{t('It offers hope of eternal joy and peace')}</li>
                    <li>
                      {t(
                        "Jesus' words affirm the reality of life beyond this world"
                      )}
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
              author: t('Jesus (Luke 23:43)'),
              text: t(
                'Truly I tell you, today you will be with me in paradise.'
              )
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1709471875678-0b3627a3c099?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzJ8fGZvcmdpdmV8ZW58MHx8MHx8fDA%3D',
              bgColor: '#031829',
              author: t('Jesus (Luke 23:34)'),
              text: t(
                'Father, forgive them, for they do not know what they are doing.'
              )
            },
            {
              imageUrl:
                'https://images.unsplash.com/photo-1595119591974-a9bd1532c1b0?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGNocmlzdHxlbnwwfHwwfHx8MA%3D%3D',
              bgColor: '#0E0D0F',
              author: t('Isaiah 53:5'),
              text: t(
                'But he was pierced for our transgressions, he was crushed for our iniquities; the punishment that brought us peace was on him, and by his wounds we are healed.'
              )
            }
          ]}
          freeResource={{
            imageUrl:
              'https://images.unsplash.com/photo-1650658720644-e1588bd66de3?w=900&auto=format&fit=crop&q=60',
            bgColor: '#5F4C5E',
            subtitle: t('Free Resources'),
            title: t('Want to grow deep in your understanding of the Bible?'),
            buttonText: t('Join Our Bible study')
          }}
        />

        <CollectionVideoContentCarousel
          subtitle={t('Easter Documentary Series')}
          title={t('Did Jesus Defeat Death?')}
          description={t(
            "Go on this adventure to time travel to the 1st century and check out other theories for Jesus's empty tomb."
          )}
          contentId="31-how-did-jesus-die/english"
          videoTitle={t('How Did Jesus Die?')}
          mutePage={mutePage}
          setMutePage={setMutePage}
          slides={[
            {
              contentId: '31-how-did-jesus-die/english',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/7_0-nfs0301.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#161817',
              title: t('How Did Jesus Die?')
            },
            {
              contentId: '32-what-happened-next/english',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/7_0-nfs0302.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#000906',
              title: t('What Happened Next?')
            },
            {
              contentId: '33-do-the-facts-stack-up/english',
              imageUrl:
                'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/7_0-nfs0303.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
              backgroundColor: '#2B2018',
              title: t('Why is Easter celebrated with bunnies?')
            }
          ]}
        />
      </CollectionsPageContent>
    </PageWrapper>
  )
}
