import { ReactElement, useState, forwardRef, Ref } from 'react'
import {
  IconButton,
  Dialog,
  Slide,
  Box,
  AppBar,
  Toolbar,
  Typography
} from '@mui/material'
import { Icon } from '@core/shared/ui/icons/Icon'
import { Swiper, SwiperSlide } from 'swiper/react'
import { VideoBlock } from '../VideoBlock/VideoBlock'
import { Question } from '../Question/Question'
import { BibleQuote } from '../BibleQuote/BibleQuote'
import { TransitionProps } from '@mui/material/transitions'
import CloseIcon from '@mui/icons-material/Close'
import { useVideoMute } from '../../libs/videoMuteContext'

// Define types for Bible quotes
interface BibleQuoteData {
  imageUrl: string
  bgColor: string
  author?: string
  text: string
}

// Define types for questions
interface QuestionData {
  id: number
  question: string
  answer: ReactElement | string
}

// Define types for the free resource (last slide in Bible quotes)
interface FreeResourceData {
  imageUrl: string
  bgColor: string
  title: string
  subtitle: string
  buttonText: string
}

// Define the main component props
interface VideoSectionProps {
  /**
   * Divider before the section
   */
  showDivider?: boolean
  /**
   * Video content ID
   */
  contentId: string
  /**
   * Video title (optional)
   */
  videoTitle?: string
  /**
   * Subtitle displayed above the title
   */
  subtitle: string
  /**
   * Main title of the section
   */
  title: string
  /**
   * Description text
   */
  description: string
  /**
   * Questions and answers
   */
  questions?: QuestionData[]
  /**
   * Title for the questions section
   */
  questionsTitle?: string
  /**
   * Button text for asking questions
   */
  askButtonText?: string
  /**
   * Bible quotes to display
   */
  bibleQuotes?: BibleQuoteData[]
  /**
   * Title for the Bible quotes section
   */
  bibleQuotesTitle?: string
  /**
   * Free resource data (last slide in Bible quotes)
   */
  freeResource?: FreeResourceData
  /**
   * Event handlers
   */
  onOpenDialog?: () => void
}

// Define the slide transition for the modal
const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: ReactElement
  },
  ref: Ref<unknown>
) {
  return <Slide direction="left" ref={ref} {...props} />
})

export const VideoSection = ({
  showDivider = true,
  contentId,
  videoTitle = ' ',
  subtitle,
  title,
  description,
  questions = [],
  questionsTitle = 'Related questions',
  askButtonText = 'Ask yours',
  bibleQuotes = [],
  bibleQuotesTitle = 'Bible quotes',
  freeResource,
  onOpenDialog
}: VideoSectionProps): ReactElement => {
  // State for tracking which question is open
  const [openQuestion, setOpenQuestion] = useState<number | null>(null)

  // Add state for the quiz modal
  const [quizModalOpen, setQuizModalOpen] = useState(false)

  // Handle opening the quiz modal
  const handleOpenQuizModal = (): void => {
    setQuizModalOpen(true)
  }

  // Handle closing the quiz modal
  const handleCloseQuizModal = (): void => {
    setQuizModalOpen(false)
  }

  // Handler for toggling questions
  const handleQuestionToggle = (id: number): void => {
    setOpenQuestion(openQuestion === id ? null : id)
  }

  // Add the modal component
  const QuizModal = (): ReactElement => (
    <Dialog
      fullScreen
      open={quizModalOpen}
      onClose={handleCloseQuizModal}
      TransitionComponent={Transition}
      aria-labelledby="quiz-modal-title"
      sx={{
        '& .MuiDialog-paper': {
          backgroundColor: 'transparent'
        }
      }}
    >
      <div className="w-full h-[100vh] flex justify-center items-center px-1 sm:px-2 overflow-hidden bg-black/80 backdrop-blur-lg">
        <div className="w-full h-full -mt-6 flex justify-center items-center shadow-3 rounded-md overflow-hidden">
          <iframe
            src="https://your.nextstep.is/embed/jf-videos-quizz?expand=false"
            className="border-0 w-full h-full"
            title="Next Step of Faith Quiz"
          />
        </div>
        <IconButton
          edge="start"
          color="inherit"
          onClick={handleCloseQuizModal}
          aria-label="close quiz"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleCloseQuizModal()
            }
          }}
          sx={{
            mr: 2,
            position: 'absolute',
            top: 30,
            left: 40,
            color: 'white'
          }}
        >
          <CloseIcon />
        </IconButton>
      </div>
    </Dialog>
  )

  return (
    <>
      {showDivider && (
        <hr className="mb-18 border-t-2 border-t-black/70 border-b-1 border-b-white/5 inset-shadow-sm" />
      )}

      <VideoBlock contentId={contentId} title={videoTitle} />

      <div className="block xl:flex w-full">
        <div className="info-block xl:w-3/5 padded 2xl:pr-2xl">
          <div className="title-block pt-2 2xl:pt-4">
            <p className="text-sm xl:text-base 2xl:text-lg font-semibold tracking-wider uppercase text-stone-200/70 xl:mb-1">
              {subtitle}
            </p>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-2xl xl:text-3xl 2xl:text-4xl font-bold mb-0">
                {title}
              </h2>
              <div className="flex items-center gap-2">
                <IconButton
                  aria-label="Download content"
                  sx={{
                    color: 'white',
                    opacity: 0.6,
                    '&:hover': { opacity: 1 }
                  }}
                >
                  <Icon name="Download2" />
                </IconButton>
                <IconButton
                  aria-label="More options"
                  sx={{
                    color: 'white',
                    opacity: 0.6,
                    '&:hover': { opacity: 1 }
                  }}
                >
                  <Icon name="More" />
                </IconButton>
              </div>
            </div>
          </div>

          <div className="description-block">
            <p className="text-lg xl:text-xl mt-2 leading-relaxed text-stone-200/80">
              <span style={{ fontWeight: 'bold', color: 'white' }}>
                {description.split(' ').slice(0, 3).join(' ')}
              </span>
              {description.slice(
                description.split(' ').slice(0, 3).join(' ').length
              )}
            </p>
          </div>
        </div>

        {questions.length > 0 && (
          <div className="xl:w-2/5">
            <div className="questions-block pt-16 xl:pt-4">
              <div className="flex items-center justify-between mb-6 padded">
                <div className="flex items-center gap-4">
                  <h4 className="text-sm xl:text-base 2xl:text-lg font-semibold tracking-wider uppercase text-stone-200/70">
                    {questionsTitle}
                  </h4>
                </div>
                <button
                  onClick={onOpenDialog}
                  aria-label="Ask a question"
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs text-black font-bold uppercase tracking-wider rounded-full bg-white hover:bg-red-500 hover:text-white transition-colors duration-200 cursor-pointer"
                >
                  <Icon
                    name="MessageCircle"
                    sx={{
                      width: 16,
                      height: 16
                    }}
                  />
                  <span>{askButtonText}</span>
                </button>
              </div>

              <div className="relative">
                {questions.map((q) => (
                  <Question
                    key={q.id}
                    question={q.question}
                    isOpen={openQuestion === q.id}
                    onToggle={() => handleQuestionToggle(q.id)}
                  >
                    {q.answer}
                  </Question>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {(bibleQuotes.length > 0 || freeResource) && (
        <div className="bible-quotes-block pt-14">
          <div className="padded">
            <div className="flex items-center justify-between pb-8">
              <div className="flex items-start gap-4">
                <h3 className="text-sm xl:text-base 2xl:text-lg font-semibold tracking-wider uppercase text-stone-200/70">
                  {bibleQuotesTitle}
                </h3>
              </div>
              <button
                onClick={onOpenDialog}
                aria-label="Share Bible quotes"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs text-black font-bold uppercase tracking-wider rounded-full bg-white hover:bg-red-500 hover:text-white transition-colors duration-200 cursor-pointer"
              >
                <Icon
                  name="LinkExternal"
                  sx={{
                    width: 16,
                    height: 16
                  }}
                />
                <span>Share</span>
              </button>
            </div>
          </div>
          <Swiper
            slidesPerView={'auto'}
            pagination={{ clickable: true }}
            spaceBetween={0}
          >
            {bibleQuotes.map((quote, index) => (
              <SwiperSlide
                key={index}
                className={`max-w-[400px] pl-6 ${index === 0 ? '2xl:pl-20' : ''} xl:pl-12`}
              >
                <BibleQuote imageUrl={quote.imageUrl} bgColor={quote.bgColor}>
                  {quote.author && (
                    <span className="text-xs font-medium tracking-wider uppercase text-amber-100/60">
                      {quote.author}:
                    </span>
                  )}
                  <h3 className="text-base text-white/90 text-balance text-lg">
                    {quote.text}
                  </h3>
                </BibleQuote>
              </SwiperSlide>
            ))}

            {freeResource && (
              <SwiperSlide className="max-w-[400px] pl-6 pr-10 xl:pl-12">
                <BibleQuote
                  imageUrl={freeResource.imageUrl}
                  bgColor={freeResource.bgColor}
                >
                  <span className="text-md tracking-wider uppercase text-white/80">
                    {freeResource.subtitle}
                  </span>
                  <h3 className="font-bold text-white/90 text-balance text-2xl mb-4 mt-2">
                    {freeResource.title}
                  </h3>
                  <button
                    onClick={onOpenDialog}
                    aria-label="Join Bible study"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm text-black font-bold uppercase tracking-wider rounded-full bg-white hover:bg-white/80 transition-colors duration-200 cursor-pointer"
                  >
                    <Icon
                      name="Bible"
                      sx={{
                        width: 16,
                        height: 16
                      }}
                    />
                    <span>{freeResource.buttonText}</span>
                  </button>
                </BibleQuote>
              </SwiperSlide>
            )}
          </Swiper>

          <div className="px-6 lg:px-8 pt-12 mx-auto lg:w-1/2 xl:w-1/3">
            <Box
              component="button"
              onClick={handleOpenQuizModal}
              className="relative w-full overflow-hidden bg-gradient-to-tr from-yellow-500 via-amber-500 to-red-700 bg-blend-multiply animate-mesh-gradient hover:animate-mesh-gradient-fast rounded-lg shadow-lg group"
              sx={{
                cursor: 'pointer',
                border: 'none',
                textAlign: 'left',
                p: 0,
                width: '100%',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  transition: 'transform 0.2s ease-in-out'
                }
              }}
              aria-label="Open faith quiz"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleOpenQuizModal()
                }
              }}
            >
              <Box className="flex justify-between items-center cursor-pointer p-4">
                <Box className="absolute inset-0 bg-[url(./assets/overlay.svg)] bg-repeat mix-blend-multiply opacity-50"></Box>
                <Box className="relative z-1 flex w-full items-center font-semibold leading-[1.2]">
                  <Box
                    component="span"
                    className="flex-none uppercase font-extrabold text-xs border-2 tracking-wider border-white rounded-lg px-2 py-1 mr-4"
                  >
                    Quiz
                  </Box>
                  <div className="text-center flex-auto">
                    What's your next step of faith?
                  </div>
                </Box>
                <Box component="span" className="transition">
                  <svg fill="none" height="24" width="24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 5l7 7m0 0l-7 7m7-7H6"
                    />
                  </svg>
                </Box>
              </Box>
            </Box>
          </div>

          {/* Render the quiz modal */}
          <QuizModal />
        </div>
      )}

      <div className="mb-18"></div>
    </>
  )
}
