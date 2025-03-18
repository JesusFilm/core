import { ReactElement } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'

import { Icon } from '@core/shared/ui/icons/Icon'
import 'swiper/css'
import { ThemeMode } from '@core/shared/ui/themes'

import { VideoMuteProvider } from '../../libs/videoMuteContext'
import { EasterDates } from '../EasterDates'
import { PageWrapper } from '../PageWrapper'
import { VideoBlock } from '../VideoBlock'
import { VideoSection } from '../VideoSection'

import { ContainerHero } from './ContainerHero'

export function CollectionPage(): ReactElement {
  return (
    <VideoMuteProvider initialMuted={true}>
      <div className="bg-stone-900 text-white min-h-screen font-sans">
        <PageWrapper
          hero={<ContainerHero />}
          headerThemeMode={ThemeMode.dark}
          hideHeaderSpacer
        >
          <div
            className="max-w-[1920px] mx-auto z-1 border-t border-stone-500/30"
            data-testid="CollectionPage"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              backdropFilter: 'brightness(.6) blur(40px)'
            }}
          >
            <div className="pt-7">
              <Swiper
                slidesPerView={'auto'}
                pagination={{ clickable: true }}
                spaceBetween={20}
              >
                <SwiperSlide className="max-w-[200px] pl-6">
                  <div className="relative beveled h-[240px] flex flex-col justify-end w-full bg-[#1A1815] rounded-lg overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1521106581851-da5b6457f674?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGVhc3RlcnxlbnwwfHwwfHx8MA%3D%3D"
                      alt="Finding Light: A Journey Through Depression"
                      className="absolute top-0 w-full h-[150px] object-cover overflow-hidden [mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_50%,transparent_100%)] [mask-size:cover]"
                    />
                    <div className="p-4">
                      <span className="text-xs font-medium tracking-wider uppercase text-amber-100/60">
                        Short Video
                      </span>
                      <h3 className="text-base font-bold text-white/90 leading-tight line-clamp-3">
                        The real story of Easter
                      </h3>
                    </div>
                  </div>
                </SwiperSlide>

                <SwiperSlide className="max-w-[200px]">
                  <div className="relative beveled h-[240px] flex flex-col justify-end w-full bg-[#A88E78] rounded-lg overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1522442676585-c751dab71864?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dG9yYWh8ZW58MHx8MHx8fDA%3D"
                      alt="Finding Light: A Journey Through Depression"
                      className="absolute top-0 w-full h-[150px] object-cover overflow-hidden [mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_50%,transparent_100%)] [mask-size:cover]"
                    />
                    <div className="p-4">
                      <span className="text-xs font-medium tracking-wider uppercase text-amber-100/60">
                        Short Video
                      </span>
                      <h3 className="text-base font-bold text-white/90 leading-tight line-clamp-3">
                        The True Meaning of Easter in Scripture
                      </h3>
                    </div>
                  </div>
                </SwiperSlide>

                <SwiperSlide className="max-w-[200px]">
                  <div className="relative beveled h-[240px] flex flex-col justify-end w-full bg-[#62884C] rounded-lg overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1591561582301-7ce6588cc286?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8YnVubnl8ZW58MHx8MHx8fDA%3D"
                      alt="Finding Light: A Journey Through Depression"
                      className="absolute top-0 w-full h-[150px] object-cover overflow-hidden [mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_50%,transparent_100%)] [mask-size:cover]"
                    />
                    <div className="p-4">
                      <span className="text-xs font-medium tracking-wider uppercase text-amber-100/60">
                        Short Video
                      </span>
                      <h3 className="text-base font-bold text-white/90 leading-tight line-clamp-3">
                        Why is Easter celebrated with bunnies?
                      </h3>
                    </div>
                  </div>
                </SwiperSlide>

                <SwiperSlide className="max-w-[200px]">
                  <div className="relative beveled h-[240px] flex flex-col justify-end w-full bg-[#5F4C5E] rounded-lg overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1650658720644-e1588bd66de3?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cHJvcGhlY2llc3xlbnwwfHwwfHx8MA%3D%3D"
                      alt="Finding Light: A Journey Through Depression"
                      className="absolute top-0 w-full h-[150px] object-cover overflow-hidden [mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_50%,transparent_100%)] [mask-size:cover]"
                    />
                    <div className="p-4">
                      <span className="text-xs font-medium tracking-wider uppercase text-amber-100/60">
                        Short Video
                      </span>
                      <h3 className="text-base font-bold text-white/90 leading-tight line-clamp-3">
                        Old Testament prophecies about Easter
                      </h3>
                    </div>
                  </div>
                </SwiperSlide>

                <SwiperSlide className="max-w-[200px]">
                  <div className="relative beveled h-[240px] flex flex-col justify-end w-full bg-[#72593A] rounded-lg overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1678181896030-11cf0237d704?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGplc3VzJTIwcmlzZW58ZW58MHx8MHx8fDA%3D"
                      alt="Finding Light: A Journey Through Depression"
                      className="absolute top-0 w-full h-[150px] object-cover overflow-hidden [mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_50%,transparent_100%)] [mask-size:cover]"
                    />
                    <div className="p-4">
                      <span className="text-xs font-medium tracking-wider uppercase text-amber-100/60">
                        Short Video
                      </span>
                      <h3 className="text-base font-bold text-white/90 leading-tight line-clamp-3">
                        What did Jesus do on Easter?
                      </h3>
                    </div>
                  </div>
                </SwiperSlide>

                <SwiperSlide className="max-w-[200px]">
                  <div className="relative beveled h-[240px] flex flex-col justify-end w-full bg-[#1C160B] rounded-lg overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1606876538216-0c70a143dd77?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8amVzdXMlMjBjcm9zc3xlbnwwfHwwfHx8MA%3D%3D"
                      alt="Finding Light: A Journey Through Depression"
                      className="absolute top-0 w-full h-[150px] object-cover overflow-hidden [mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_50%,transparent_100%)] [mask-size:cover]"
                    />
                    <div className="p-4">
                      <span className="text-xs font-medium tracking-wider uppercase text-amber-100/60">
                        Short Video
                      </span>
                      <h3 className="text-base font-bold text-white/90 leading-tight line-clamp-3">
                        Why Jesus had to die?
                      </h3>
                    </div>
                  </div>
                </SwiperSlide>
                <SwiperSlide className="max-w-[200px]">
                  <div className="relative beveled h-[240px] flex flex-col justify-end w-full bg-[#191F32] rounded-lg overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1484173936665-9ae90b911638?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Zml2ZXxlbnwwfHwwfHx8MA%3D%3D"
                      alt="Finding Light: A Journey Through Depression"
                      className="absolute top-0 w-full h-[150px] object-cover overflow-hidden [mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_50%,transparent_100%)] [mask-size:cover]"
                    />
                    <div className="p-4">
                      <span className="text-xs font-medium tracking-wider uppercase text-amber-100/60">
                        Short Video
                      </span>
                      <h3 className="text-base font-bold text-white/90 leading-tight line-clamp-3">
                        What are 5 facts about Easter?
                      </h3>
                    </div>
                  </div>
                </SwiperSlide>
                <SwiperSlide className="max-w-[200px] pr-6">
                  <div className="relative beveled h-[240px] flex flex-col justify-end w-full bg-[#370D11] rounded-lg overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1617142714053-54451f8a2097?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGVhc3RlciUyMHRvbWJ8ZW58MHx8MHx8fDA%3D"
                      alt="Finding Light: A Journey Through Depression"
                      className="absolute top-0 w-full h-[150px] object-cover overflow-hidden [mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_50%,transparent_100%)] [mask-size:cover]"
                    />
                    <div className="p-4">
                      <span className="text-xs font-medium tracking-wider uppercase text-amber-100/60">
                        Short Video
                      </span>
                      <h3 className="text-base font-bold text-white/90 leading-tight line-clamp-3">
                        Where did body of Jesus go?
                      </h3>
                    </div>
                  </div>
                </SwiperSlide>
              </Swiper>
            </div>

            <div className="w-full px-6 lg:px-8 py-8">
              <EasterDates />
            </div>

            <div className="flex flex-col py-7 md:py-17">
              <div className="px-6 lg:px-8 space-y-6 pb-12">
                <h2 className="text-4xl font-bold mb-0">
                  The real Easter story
                </h2>
                <p className="text-xl opacity-50">
                  Easter isn't just a celebration
                </p>
                <p className="text-xl">
                  The Gospels are{' '}
                  <span className="bg-rose-300/20 px-2">shockingly honest</span>{' '}
                  about the emotions Jesus experienced&mdash;His deep anguish,
                  one of His closest friends denying even to know Him, and other
                  disciples&mdash;disbelief in His resurrection.
                </p>
                <p className="text-lg">
                  If you have doubts or want to rediscover the meaning of Easter
                  explore this collection of videos and interactive resources.
                </p>
              </div>

              <VideoSection
                contentId="easter-explained/english"
                subtitle="Jesus' Victory Over Sin and Death"
                title="The True Meaning of Easter"
                description="Easter is about more than eggs and bunnies—it's about Jesus and
                His amazing love for us. He died on the cross for our sins and
                rose from the dead, showing His power over sin and death.
                Because of Him, we can have forgiveness and the promise of
                eternal life. Easter is a time to celebrate this great hope and
                God's incredible gift to us."
                questions={[
                  {
                    id: 1,
                    question:
                      "How can I trust in God's sovereignty when the world feels so chaotic?",
                    answer: (
                      <>
                        <p>
                          Even in times of chaos and uncertainty, we can trust
                          in God's sovereignty because:
                        </p>
                        <ul className="list-disc pl-6 mt-2 space-y-2">
                          <li>
                            God remains in control even when circumstances feel
                            out of control
                          </li>
                          <li>
                            His purposes are higher than our understanding
                          </li>
                          <li>
                            He promises to work all things for good for those
                            who love Him
                          </li>
                          <li>
                            The Bible shows countless examples of God bringing
                            order from chaos
                          </li>
                        </ul>
                      </>
                    )
                  },
                  {
                    id: 2,
                    question:
                      'Why is Easter the most important Christian holiday?',
                    answer: (
                      <>
                        <p>Easter is central to Christian faith because:</p>
                        <ul className="list-disc pl-6 mt-2 space-y-2">
                          <li>
                            It marks Jesus' resurrection, proving His victory
                            over death
                          </li>
                          <li>
                            It fulfills Old Testament prophecies about the
                            Messiah
                          </li>
                          <li>It demonstrates God's power to give new life</li>
                          <li>
                            It provides hope for our own resurrection and
                            eternal life
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
                        <p>The Bible tells us several key events occurred:</p>
                        <ul className="list-disc pl-6 mt-2 space-y-2">
                          <li>
                            Jesus' body was placed in a tomb and guarded by
                            Roman soldiers
                          </li>
                          <li>
                            His followers mourned and waited in uncertainty
                          </li>
                          <li>
                            According to Scripture, He descended to the realm of
                            the dead
                          </li>
                          <li>
                            On the third day, He rose victorious over death
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
                  title:
                    'Want to grow deep in your understanding of the Bible?',
                  buttonText: 'Join Our Bible study'
                }}
                onOpenDialog={handleOpenDialog}
                showDivider={false}
              />

              <div className="relative bg-linear-to-tr from-blue-950/10  via-purple-950/10 to-[#91214A]/90 py-16">
                <div className="absolute inset-0 bg-[url(./assets/overlay.svg)] bg-repeat mix-blend-multiply"></div>
                <div className="px-6 lg:px-8 z-2 relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col gap-1">
                        <h4 className="text-sm tracking-wider uppercase text-pink-200/70">
                          Video Bible Collection
                        </h4>
                        <h3 className="text-xl font-bold text-balance">
                          The Easter story is a key part of a bigger picture
                        </h3>
                      </div>
                    </div>
                    <button
                      onClick={handleOpenDialog}
                      aria-label="Share Bible quotes"
                      className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-xs text-black font-bold uppercase tracking-wider rounded-full bg-white hover:bg-red-500 hover:text-white transition-colors duration-200 cursor-pointer"
                    >
                      <Icon
                        name="Play3"
                        sx={{
                          width: 16,
                          height: 16
                        }}
                      />
                      <span>Watch</span>
                    </button>
                  </div>
                </div>

                <div className="">
                  <Swiper
                    slidesPerView="auto"
                    spaceBetween={0}
                    pagination={{ clickable: true }}
                    className="w-full"
                  >
                    <SwiperSlide className="!w-[296px] pl-6 py-8">
                      <div className="relative group shadow-xl shadow-stone-950/70 beveled">
                        <img
                          src="https://cdn-std.droplr.net/files/acc_760170/TxsUi3"
                          alt="Movie poster 1"
                          className="w-full aspect-[2/3] object-cover rounded-lg"
                        />
                        <button
                          className="absolute bottom-6 text-left left-1/2 transform -translate-x-1/2 flex items-center gap-2 px-4 py-2 text-xs text-black font-bold uppercase tracking-wider rounded-full bg-white hover:bg-red-500 hover:text-white transition-colors duration-200 shadow-lg cursor-pointer"
                          aria-label="Play movie"
                        >
                          <Icon name="Play3" />
                          <span>Watch&nbsp;Full&nbsp;Movie</span>
                        </button>
                      </div>
                    </SwiperSlide>

                    <SwiperSlide className="!w-[296px] pl-6 py-8">
                      <div className="relative group shadow-xl shadow-stone-950/70 beveled">
                        <img
                          src="https://cdn-std.droplr.net/files/acc_760170/cfER11"
                          alt="Movie poster 2"
                          className="w-full aspect-[2/3] object-cover rounded-lg"
                        />
                        <button
                          className="absolute bottom-6 text-left left-1/2 transform -translate-x-1/2 flex items-center gap-2 px-4 py-2 text-xs text-black font-bold uppercase tracking-wider rounded-full bg-white hover:bg-red-500 hover:text-white transition-colors duration-200 shadow-lg cursor-pointer"
                          aria-label="Play movie"
                        >
                          <Icon name="Play3" />
                          <span>Watch&nbsp;Full&nbsp;Movie</span>
                        </button>
                      </div>
                    </SwiperSlide>

                    <SwiperSlide className="!w-[296px] pl-6 pr-6  py-8">
                      <div className="relative group shadow-xl shadow-stone-950/70 beveled">
                        <img
                          src="https://cdn-std.droplr.net/files/acc_760170/9wGrB0"
                          alt="Movie poster 3"
                          className="w-full aspect-[2/3] object-cover rounded-lg"
                        />
                        <button
                          className="absolute bottom-6 text-left left-1/2 transform -translate-x-1/2 flex items-center gap-2 px-4 py-2 text-xs text-black font-bold uppercase tracking-wider rounded-full bg-white hover:bg-red-500 hover:text-white transition-colors duration-200 shadow-lg cursor-pointer"
                          aria-label="Play movie"
                        >
                          <Icon name="Play3" />
                          <span>Watch&nbsp;Full&nbsp;Movie</span>
                        </button>
                      </div>
                    </SwiperSlide>
                  </Swiper>
                </div>

                <div className="px-6 lg:px-8 space-y-6">
                  <p className="text-lg mt-4 leading-relaxed text-stone-200/80">
                    <span className="text-white font-bold">Our mission</span> is
                    to introduce introduce people to the Bible through films and
                    videos that faithfully bring the Gospels to life. By
                    visually telling the story of Jesus and God's love for
                    humanity, we make Scripture more accessible, engaging, and
                    easy to understand.
                  </p>
                </div>
              </div>

              <VideoSection
                contentId="my-last-day/english"
                subtitle="My Last Day"
                title="Last hour of Jesus' life from criminal's point of view"
                description="A condemned thief watches in horror as Jesus is brutally flogged in Pilate's courtyard, memories of his own crimes flooding his mind. Why would they punish an innocent man? The roar of the crowd seals their fate—crucifixion. Forced to carry their crosses to Golgotha, he stumbles beside Jesus, the weight of his past and his sentence crushing him. As nails pierce flesh and the sky darkens, he makes a desperate plea—could this truly be the Messiah? In his final moments, Jesus gives him an unexpected promise: Today, you will be with me in paradise. Watch as this powerful moment unfolds."
                questions={[
                  {
                    id: 1,
                    question: 'Why would Jesus forgive a criminal so easily?',
                    answer: (
                      <>
                        <p>
                          Jesus' forgiveness is a demonstration of God's grace
                          and mercy. The thief on the cross recognized Jesus'
                          innocence and divinity, humbly asking to be remembered
                          in His kingdom. Jesus' response shows:
                        </p>
                        <ul className="list-disc pl-6 mt-2 space-y-2">
                          <li>Salvation is based on faith, not deeds</li>
                          <li>
                            God's mercy extends to all, even the worst sinners
                          </li>
                          <li>
                            Jesus came to save the lost, including criminals and
                            outcasts
                          </li>
                          <li>
                            Grace is freely given to those who sincerely seek it
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
                          Jesus willingly accepted death because it was part of
                          God's plan for redemption. His sacrifice was necessary
                          to fulfill prophecy and bring salvation. Key reasons
                          include:
                        </p>
                        <ul className="list-disc pl-6 mt-2 space-y-2">
                          <li>
                            His death fulfilled Old Testament prophecies (Isaiah
                            53)
                          </li>
                          <li>He took on the punishment for humanity's sins</li>
                          <li>
                            By not saving Himself, He demonstrated His ultimate
                            love and obedience to God
                          </li>
                          <li>
                            His resurrection proved His victory over sin and
                            death
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
                          Being in paradise with Jesus means eternal life in the
                          presence of God. The thief on the cross was assured of
                          his place with Jesus in heaven because of his faith.
                          Important aspects of this promise include:
                        </p>
                        <ul className="list-disc pl-6 mt-2 space-y-2">
                          <li>
                            It signifies immediate presence with Christ after
                            death
                          </li>
                          <li>It confirms salvation through faith alone</li>
                          <li>It offers hope of eternal joy and peace</li>
                          <li>
                            Jesus' words affirm the reality of life beyond this
                            world
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
                  title:
                    'Want to grow deep in your understanding of the Bible?',
                  buttonText: 'Join Our Bible study'
                }}
                onOpenDialog={handleOpenDialog}
              />

              <VideoSection
                contentId="chosen-witness/english"
                subtitle="Chosen Witness"
                title="Mary Magdalene: A Life Transformed by Jesus"
                description="Mary Magdalene's life was dramatically transformed by Jesus, the man who would change the world forever. Once an outcast, she became one of His most devoted followers. In this animated short film, witness the life of Jesus through her eyes—from her redemption to the moment she became the first to witness His resurrection."
                questions={[
                  {
                    id: 1,
                    question:
                      'In what ways do you identify with the main character, Mary Magdalene?',
                    answer: (
                      <>
                        <p>
                          Mary Magdalene's story is one of transformation and
                          redemption. Like many of us, she carried a past filled
                          with struggles, but Jesus freed her and gave her a new
                          purpose. Her story teaches us:
                        </p>
                        <ul className="list-disc pl-6 mt-2 space-y-2">
                          <li>
                            Jesus offers redemption regardless of our past
                          </li>
                          <li>Faith in Christ brings healing and purpose</li>
                          <li>
                            God calls the least expected to be His witnesses
                          </li>
                          <li>Encountering Jesus changes everything</li>
                        </ul>
                      </>
                    )
                  },
                  {
                    id: 2,
                    question:
                      "Why do you think the elders didn't approve of Jesus?",
                    answer: (
                      <>
                        <p>
                          The religious leaders opposed Jesus because His
                          teachings challenged their authority and traditions.
                          Key reasons include:
                        </p>
                        <ul className="list-disc pl-6 mt-2 space-y-2">
                          <li>
                            He welcomed sinners and outcasts, disrupting social
                            norms
                          </li>
                          <li>
                            His claim to be the Son of God threatened their
                            power
                          </li>
                          <li>
                            He emphasized mercy over legalism, angering those
                            who relied on the law
                          </li>
                          <li>
                            His miracles and growing influence unsettled their
                            control over the people
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
                          Jesus' first appearance to Mary Magdalene was deeply
                          significant. It showed:
                        </p>
                        <ul className="list-disc pl-6 mt-2 space-y-2">
                          <li>His care for those the world overlooked</li>
                          <li>
                            The importance of faith and devotion over status
                          </li>
                          <li>
                            That women played a vital role in His ministry and
                            message
                          </li>
                          <li>
                            How a transformed life can become a powerful
                            testimony
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
                onOpenDialog={handleOpenDialog}
              />

              <div className="relative bg-linear-to-tr from-violet-950/10  via-indigo-500/10 to-cyan-300/50 py-16">
                <div className="absolute inset-0 bg-[url(./assets/overlay.svg)] bg-repeat mix-blend-multiply"></div>
                <div className="px-6 lg:px-8 z-2 relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col gap-1">
                        <h4 className="text-sm tracking-wider uppercase text-white/50">
                          Easter Documentary Series
                        </h4>
                        <h3 className="text-2xl font-bold text-balance">
                          Did Jesus Defeat Death?
                        </h3>
                      </div>
                    </div>
                    <button
                      onClick={handleOpenDialog}
                      aria-label="Share Bible quotes"
                      className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-xs text-black font-bold uppercase tracking-wider rounded-full bg-white hover:bg-red-500 hover:text-white transition-colors duration-200 cursor-pointer"
                    >
                      <Icon
                        name="Play3"
                        sx={{
                          width: 16,
                          height: 16
                        }}
                      />
                      <span>See All</span>
                    </button>
                  </div>
                </div>

                <div className="px-6 lg:px-8 space-y-6 pt-6 pb-10">
                  <p className="leading-relaxed text-stone-200/80">
                    <span className="text-white font-bold">
                      Go on this adventure
                    </span>{' '}
                    to time travel to the 1st century and check out other
                    theories for Jesus's empty tomb.
                  </p>
                </div>

                <VideoBlock
                  contentId="31-how-did-jesus-die/english"
                  title="How Did Jesus Die?"
                />

                <div className="pt-8">
                  <Swiper
                    slidesPerView={'auto'}
                    pagination={{ clickable: true }}
                    spaceBetween={20}
                  >
                    <SwiperSlide className="max-w-[200px] pl-6">
                      <div className="relative beveled h-[240px] flex flex-col justify-end w-full bg-[#161817] rounded-lg overflow-hidden">
                        <img
                          src="https://cdn-std.droplr.net/files/acc_760170/adPZV7"
                          alt="Finding Light: A Journey Through Depression"
                          className="absolute top-0 w-full h-[150px] object-cover overflow-hidden [mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_50%,transparent_100%)] [mask-size:cover]"
                        />
                        <div className="p-4">
                          <span className="text-xs font-medium tracking-wider uppercase text-white/60">
                            Short Video
                          </span>
                          <h3 className="text-base font-bold text-white/90 leading-tight line-clamp-3">
                            How Did Jesus Die?
                          </h3>
                        </div>
                      </div>
                    </SwiperSlide>

                    <SwiperSlide className="max-w-[200px]">
                      <div className="relative beveled h-[240px] flex flex-col justify-end w-full bg-[#000906] rounded-lg overflow-hidden">
                        <img
                          src="https://cdn-std.droplr.net/files/acc_760170/DfhTBf"
                          alt="Finding Light: A Journey Through Depression"
                          className="absolute top-0 w-full h-[150px] object-cover overflow-hidden [mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_50%,transparent_100%)] [mask-size:cover]"
                        />
                        <div className="p-4">
                          <span className="text-xs font-medium tracking-wider uppercase text-white/60">
                            Short Video
                          </span>
                          <h3 className="text-base font-bold text-white/90 leading-tight line-clamp-3">
                            What Happened Next?
                          </h3>
                        </div>
                      </div>
                    </SwiperSlide>

                    <SwiperSlide className="max-w-[200px] pr-6">
                      <div className="relative beveled h-[240px] flex flex-col justify-end w-full bg-[#2B2018] rounded-lg overflow-hidden">
                        <img
                          src="https://cdn-std.droplr.net/files/acc_760170/6xZccU"
                          alt="Finding Light: A Journey Through Depression"
                          className="absolute top-0 w-full h-[150px] object-cover overflow-hidden [mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_50%,transparent_100%)] [mask-size:cover]"
                        />
                        <div className="p-4">
                          <span className="text-xs font-medium tracking-wider uppercase text-amber-100/60">
                            Short Video
                          </span>
                          <h3 className="text-base font-bold text-white/90 leading-tight line-clamp-3">
                            Why is Easter celebrated with bunnies?
                          </h3>
                        </div>
                      </div>
                    </SwiperSlide>
                  </Swiper>
                </div>
              </div>

              <VideoSection
                contentId="why-did-jesus-have-to-die/english"
                subtitle="Why Did Jesus Have to Die?"
                title="The Purpose of Jesus' Sacrifice"
                description="God created humans to be spiritually and relationally connected with Him, but how can we keep God's commands? How can we live without shame? We can't restore ourselves to honor. It would seem we're doomed, except God doesn't want His creation to die. He is merciful and loving, and wants us to be restored, living with Him in full life."
                questions={[
                  {
                    id: 1,
                    question: "Why was Jesus' death necessary?",
                    answer: (
                      <>
                        <p>
                          Jesus' death was necessary to fulfill God's plan of
                          redemption. Because of sin, humanity was separated
                          from God, but Jesus' sacrifice provided the way for
                          reconciliation. Here's why His death was essential:
                        </p>
                        <ul className="list-disc pl-6 mt-2 space-y-2">
                          <li>Sin creates a barrier between us and God</li>
                          <li>God's justice requires a payment for sin</li>
                          <li>
                            Jesus, as the perfect sacrifice, took our place
                          </li>
                          <li>
                            Through His death, we receive forgiveness and
                            restoration
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
                          God's love and justice go hand in hand. While He
                          desires to forgive, He also upholds justice. Jesus'
                          sacrifice was the ultimate expression of both:
                        </p>
                        <ul className="list-disc pl-6 mt-2 space-y-2">
                          <li>
                            Forgiveness requires a cost, and Jesus paid that
                            cost
                          </li>
                          <li>
                            His death satisfied God's justice while showing His
                            mercy
                          </li>
                          <li>
                            Through Jesus, God demonstrated His love for
                            humanity
                          </li>
                          <li>
                            His sacrifice allows us to be restored without
                            compromising divine justice
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
                          Jesus' death and resurrection opened the way for us to
                          be reconciled with God. Through Him, we can:
                        </p>
                        <ul className="list-disc pl-6 mt-2 space-y-2">
                          <li>Experience forgiveness and freedom from sin</li>
                          <li>Have direct access to God through Christ</li>
                          <li>Receive the gift of eternal life</li>
                          <li>
                            Live in restored relationship with our Creator
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
                  title: "Want to understand more about Jesus' sacrifice?",
                  buttonText: 'Join Our Bible study'
                }}
                onOpenDialog={handleOpenDialog}
              />

              <VideoSection
                contentId="did-jesus-come-back-from-the-dead/english"
                subtitle="Did Jesus Come Back From the Dead?"
                title="The Truth About Jesus' Resurrection"
                description="Jesus told people that he would die and then come back to life. This short film explains the details surrounding Jesus' death and resurrection. His closest followers struggled to believe, but eyewitnesses confirmed the truth: He rose again. The news of His resurrection spread across the world, changing lives forever. Because of these witnesses, we can have confidence in the reality of Jesus' resurrection."
                questions={[
                  {
                    id: 1,
                    question:
                      'How do we know Jesus really died and rose again?',
                    answer: (
                      <>
                        <p>
                          There is strong historical and biblical evidence for
                          Jesus' death and resurrection:
                        </p>
                        <ul className="list-disc pl-6 mt-2 space-y-2">
                          <li>
                            Roman soldiers confirmed His death before burying
                            Him
                          </li>
                          <li>Jesus' tomb was sealed and guarded</li>
                          <li>
                            Hundreds of witnesses saw Jesus alive after His
                            resurrection
                          </li>
                          <li>
                            His disciples, once afraid, boldly preached and died
                            for this truth
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
                          The resurrection is central to Christian faith
                          because:
                        </p>
                        <ul className="list-disc pl-6 mt-2 space-y-2">
                          <li>It proves Jesus' victory over sin and death</li>
                          <li>It fulfills prophecies about the Messiah</li>
                          <li>It confirms that Jesus is the Son of God</li>
                          <li>
                            It gives believers hope of eternal life with Him
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
                          Jesus' resurrection calls for a personal response. We
                          can:
                        </p>
                        <ul className="list-disc pl-6 mt-2 space-y-2">
                          <li>Believe in Him as our Savior and Lord</li>
                          <li>Repent from sin and follow His teachings</li>
                          <li>
                            Share the good news of His resurrection with others
                          </li>
                          <li>
                            Live with hope, knowing that He will return one day
                          </li>
                        </ul>
                      </>
                    )
                  }
                ]}
                bibleQuotes={[
                  {
                    imageUrl:
                      'https://images.unsplash.com/photo-1616548321600-aaab929899b5?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjd8fGNocmlzdHxlbnwwfHwwfHx8MA%3D%3D',
                    bgColor: '#80766A',
                    author: 'Luke 24:6-7',
                    text: 'He is not here; He has risen! Remember how He told you, while He was still with you in Galilee: The Son of Man must be delivered over to the hands of sinners, be crucified and on the third day be raised again.'
                  },
                  {
                    imageUrl:
                      'https://images.unsplash.com/photo-1505009923639-b21de6ff4f78?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTJ8fGNocmlzdHxlbnwwfHwwfHx8MA%3D%3D',
                    bgColor: '#2E539A',
                    author: '1 Corinthians 15:3-4',
                    text: 'For what I received I passed on to you as of first importance: that Christ died for our sins according to the Scriptures, that he was buried, that he was raised on the third day according to the Scriptures.'
                  },
                  {
                    imageUrl:
                      'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTM2fHxuZXclMjBsaWZlfGVufDB8fDB8fHww',
                    bgColor: '#0B1B1E',
                    author: 'John 11:25',
                    text: 'Jesus said to her, "I am the resurrection and the life. The one who believes in me will live, even though they die."'
                  }
                ]}
                freeResource={{
                  imageUrl:
                    'https://images.unsplash.com/photo-1650658720644-e1588bd66de3?w=900&auto=format&fit=crop&q=60',
                  bgColor: '#5F4C5E',
                  subtitle: 'Free Resources',
                  title: "Want to learn more about Jesus' resurrection?",
                  buttonText: 'Join Our Bible study'
                }}
                onOpenDialog={handleOpenDialog}
              />

              <VideoSection
                contentId="the-story-short-film/english"
                subtitle="The Story Short Film"
                title="The Story: How It All Began and How It Will Never End"
                description="The Story is a short film of how everything began and how it can never end. This film shares the overarching story of the Bible, a story that redeems all stories and brings new life through salvation in Jesus alone. It answers life's biggest questions: Where did we come from? What went wrong? Is there any hope? And what does the future hold?"
                questions={[
                  {
                    id: 1,
                    question:
                      'Where did everything come from? Is there a purpose to life?',
                    answer: (
                      <>
                        <p>
                          The Bible teaches that everything began with God, the
                          Creator of the universe. He spoke everything into
                          existence with purpose and design. Humanity was
                          created in His image to live in harmony with Him, each
                          other, and creation.
                        </p>
                        <ul className="list-disc pl-6 mt-2 space-y-2">
                          <li>God created the world out of love and order</li>
                          <li>
                            Everything was originally perfect, without pain or
                            suffering
                          </li>
                          <li>
                            Humans were designed to have a personal relationship
                            with God
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
                          Suffering exists because sin entered the world when
                          humanity chose to rebel against God. This disobedience
                          broke the original perfection, introducing death,
                          pain, and separation from God.
                        </p>
                        <ul className="list-disc pl-6 mt-2 space-y-2">
                          <li>Sin brought suffering, brokenness, and death</li>
                          <li>We all contribute to the problem of sin</li>
                          <li>
                            Despite this, God did not abandon humanity—He
                            provided a way for restoration
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
                          Yes! God sent Jesus as the rescuer. Jesus lived a
                          perfect life, died on the cross to pay for sin, and
                          rose from the dead to defeat death itself. Through
                          Him, we can be restored to God and experience a new
                          life.
                        </p>
                        <ul className="list-disc pl-6 mt-2 space-y-2">
                          <li>Jesus' sacrifice makes forgiveness possible</li>
                          <li>His resurrection proves His power over death</li>
                          <li>
                            Those who trust in Jesus receive new life and a
                            restored relationship with God
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
                          According to the Bible, God has promised a future
                          where He will restore everything. Those who trust in
                          Jesus will live forever with Him in a perfect, renewed
                          world. Sin, suffering, and death will be no more.
                        </p>
                        <ul className="list-disc pl-6 mt-2 space-y-2">
                          <li>God will create a new heaven and a new earth</li>
                          <li>
                            There will be no more pain, suffering, or death
                          </li>
                          <li>
                            Jesus will return to judge the living and the dead
                          </li>
                          <li>
                            Everyone must decide how they will respond to this
                            truth
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
                onOpenDialog={handleOpenDialog}
              />
            </div>
          </div>
        </PageWrapper>
      </div>
    </VideoMuteProvider>
  )
}
