import { ImageWithFallback } from "./components/figma/ImageWithFallback";
import { Button } from "./components/ui/button";
import { Header } from "./components/Header";
import { AudienceSegmentation } from "./components/AudienceSegmentation";
import {
  Play,
  ArrowRight,
  Globe,
  Heart,
  Users,
  Clapperboard,
  Search,
  BookOpen,
  Shield,
  Plus,
  HandHeart,
  Mountain,
  User,
  Compass,
  Sprout,
  Zap,
  RotateCcw,
  Scale,
  Send,
  Languages,
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "./components/ui/carousel";
import { useState, useEffect } from "react";

export default function App() {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!carouselApi) {
      return;
    }

    setCount(carouselApi.scrollSnapList().length);
    setCurrent(carouselApi.selectedScrollSnap() + 1);

    carouselApi.on("select", () => {
      setCurrent(carouselApi.selectedScrollSnap() + 1);
    });
  }, [carouselApi]);

  const handleAudienceSelection = (option: string, index: number) => {
    console.log(`Selected audience option: ${option} (index: ${index})`);
    // Add your logic here for handling audience selection
  };

  const films = [
    {
      title: "JESUS",
      subtitle: "THE LIFE OF CHRIST",
      duration: "117 MIN",
      languages: "2000+ LANGUAGES",
      image:
        "https://cdn-std.droplr.net/files/acc_760170/cfER11",
    },
    {
      title: "THE GOSPEL OF MATTHEW",
      subtitle: "Luma-word-by-word-video-gospel",
      duration: "62 MIN",
      languages: "900+ LANGUAGES",
      image:
        "https://cdn-std.droplr.net/files/acc_760170/9wGrB0",
    },
    {
      title: "MAGDALENA",
      subtitle: "RELEASED FROM SHAME",
      duration: "82 MIN",
      languages: "400+ LANGUAGES",
      image:
        "https://cdn-std.droplr.net/files/acc_760170/Ol9PXg",
    },
    {
      title: "THE STORY OF JESUS FOR CHILDREN",
      subtitle: "AGES 3-12",
      duration: "61 MIN",
      languages: "180+ LANGUAGES",
      image:
        "https://cdn-std.droplr.net/files/acc_760170/TxsUi3",
    },
    {
      title: "BOOK OF ACTS",
      subtitle: "THE EARLY CHURCH",
      duration: "193 MIN",
      languages: "40+ LANGUAGES",
      image:
        "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=320&h=480&fit=crop&crop=center&auto=format",
    },
    {
      title: "LUMO - LUKE",
      subtitle: "WORD FOR WORD",
      duration: "180 MIN",
      languages: "ENGLISH",
      image:
        "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=320&h=480&fit=crop&crop=center&auto=format",
    },
  ];

  const courseVideos = [
    {
      title: "The Simple Gospel",
      subtitle: "Understanding the Good News",
      duration: "3:19",
      languages: "MULTIPLE LANGUAGES",
      image:
        "https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2F8_NBC01.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75",
    },
    {
      title: "The Blood of Jesus",
      subtitle: "The Power of His Sacrifice",
      duration: "1:49",
      languages: "MULTIPLE LANGUAGES",
      image:
        "https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2F8_NBC02.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75",
    },
    {
      title: "Life After Death",
      subtitle: "Eternal Hope in Christ",
      duration: "1:34",
      languages: "MULTIPLE LANGUAGES",
      image:
        "https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2F8_NBC03.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75",
    },
    {
      title: "God's Forgiveness",
      subtitle: "Grace and Mercy",
      duration: "1:45",
      languages: "MULTIPLE LANGUAGES",
      image:
        "https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2F8_NBC04.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75",
    },
    {
      title: "Savior, Lord, and Friend",
      subtitle: "Jesus in Your Life",
      duration: "1:57",
      languages: "MULTIPLE LANGUAGES",
      image:
        "https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2F8_NBC05.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75",
    },
    {
      title: "Being Made New",
      subtitle: "Your New Life in Christ",
      duration: "1:19",
      languages: "MULTIPLE LANGUAGES",
      image:
        "https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2F8_NBC06.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75",
    },
    {
      title: "Living for God",
      subtitle: "Walking in His Ways",
      duration: "1:41",
      languages: "MULTIPLE LANGUAGES",
      image:
        "https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2F8_NBC07.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75",
    },
    {
      title: "The Bible",
      subtitle: "God's Word for You",
      duration: "1:30",
      languages: "MULTIPLE LANGUAGES",
      image:
        "https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2F8_NBC08.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75",
    },
    {
      title: "Prayer",
      subtitle: "Connecting with God",
      duration: "1:28",
      languages: "MULTIPLE LANGUAGES",
      image:
        "https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2F8_NBC09.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75",
    },
    {
      title: "Church",
      subtitle: "Finding Your Community",
      duration: "1:40",
      languages: "MULTIPLE LANGUAGES",
      image:
        "https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2F8_NBC10.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75",
    },
  ];

  // Grid background images data - Christian themed
  const gridImages = [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=center&auto=formathttps://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2luZW1hfGVufDB8fDB8fHww", // Church interior
    "https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2F8_NBC03.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75", // animated risen
    "https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2F2_Acts-0-0.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75", // book of acts
    "https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2F2_ChosenWitness.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75", // animated magdalena
    "https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2F4_Loss.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75", // sport man
    "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2luZW1hfGVufDB8fDB8fHww", // Church exterior
    "https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2F8_NBC10.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75", // animated church
    "https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2F4_Injury.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75", // sport woman
    "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTJ8fGNodXJjaHxlbnwwfHwwfHx8MA%3D%3D", // Cathedral architecture
    "https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2F8_NBC04.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75", // animated heart
    "https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2FNua.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75", // nua desert
    "https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2FWonder.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75", // animated
    "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjZ8fGNpbmVtYXxlbnwwfHwwfHx8MA%3D%3D", // Gothic cathedral
    "https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2FJFP-Interests-Discipleship.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75", // person sunset
    "https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2FGoodStory.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75", // native people
    "https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2FGOLukeCollection.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75", // Jesus Lume
    "https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2F6_GOMatt2510.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75", // Lumo fist
    "https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2F1_jf-0-0.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75", // Jesus classic
    "https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2FBibleProject.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75", // bible project
    "https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2F6_GOMatt2505.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75", // jesus desert person
    "https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2F2_FileZero-0-0.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75", // file zero
    "https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2F7_Origins.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75", // nua van
    "https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2F2_0-LivingWord.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75", // Via de la ros
    "https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2F6_GOMatt2508.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75", // Jesus look at the light
  ];

  // Generate rows for the grid
  const generateGridRows = () => {
    const rows = [];
    const numRows = 10; // Increased number of rows to ensure full coverage
    const imagesPerRow = 10; // More images per row for seamless animation

    for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
      const rowImages = [];
      for (
        let imgIndex = 0;
        imgIndex < imagesPerRow;
        imgIndex++
      ) {
        const imageIndex =
          (rowIndex * imagesPerRow + imgIndex) %
          gridImages.length;
        rowImages.push(gridImages[imageIndex]);
      }

      rows.push({
        id: rowIndex,
        images: rowImages,
        direction: rowIndex % 2 === 0 ? "left" : "right", // Alternate direction
        animationClass:
          rowIndex % 2 === 0
            ? "grid-row-left"
            : "grid-row-right",
      });
    }

    return rows;
  };

  const gridRows = generateGridRows();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section
        className="h-[70vh] text-white relative flex items-end overflow-hidden"
        style={{
          background:
            "linear-gradient(140deg, #0c0a09 0%, #292524 30%, #44403c 60%, #1c1917 100%)",
          backgroundColor: "#0c0a09",
          backgroundBlendMode: "normal",
        }}
      >
        {/* Animated Grid Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              transform: "rotate(-45deg)",
              transformOrigin: "center center",
              width: "200%",
              height: "200%",
              top: "-50%",
              left: "-50%",
              overflow: "hidden",
            }}
          >
            {gridRows.map((row) => (
              <div
                key={row.id}
                className={`absolute left-0 right-0 flex ${row.animationClass}`}
                style={{
                  top: `${row.id * 12}%`,
                  height: "10%",
                  animationDelay: `${row.id * -3}s`,
                }}
              >
                {/* Duplicate the images to create seamless loop */}
                {[...row.images, ...row.images, ...row.images].map(
                  (imageSrc, imageIndex) => (
                    <div
                      key={imageIndex}
                      className="mr-8 flex-shrink-0"
                    >
                      <ImageWithFallback
                        src={imageSrc}
                        alt=""
                        className="h-full w-72 object-cover rounded-2xl shadow-2xl opacity-20"
                        style={{
                          aspectRatio: "3/4",
                        }}
                      />
                    </div>
                  ),
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Background Texture */}
        <div
          className="absolute inset-0 opacity-50 z-10"
          style={{
            backgroundImage:
              'url("https://www.jesusfilm.org/_next/static/media/overlay.d86a559d.svg")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />

        {/* Text Readability Gradient Overlay */}
        <div
          className="absolute inset-0 z-15"
          style={{
            background: "linear-gradient(45deg, rgba(12, 10, 9, 0.9) 0%, rgba(12, 10, 9, 0.6) 30%, rgba(12, 10, 9, 0.2) 60%, transparent 100%)",
          }}
        />

        {/* Bottom Gradient Transition to Next Section */}
        <div
          className="absolute bottom-0 left-0 right-0 z-20 h-32"
          style={{
            background: "linear-gradient(to bottom, transparent 0%, rgba(12, 10, 9, 0.4) 50%, #0c0a09 100%)",
          }}
        />

        <div className="max-w-[1920px] mx-auto px-20 pt-2 pb-24 relative z-20">
          <div className="grid lg:grid-cols-2 gap-16 items-end">
            {/* Left Content */}
            <div className="max-w-5xl">
              <div className="mb-4">
                <div className="inline-flex items-center gap-2 mb-4">
                  <Languages className="w-4 h-4 text-orange-400/80" />
                  <span className="text-orange-400/80 text-lg tracking-wider">
                    ONE STORY. EVERY LANGUAGE.
                  </span>
                </div>
              </div>

              <h1 className="text-4xl md:text-6xl xl:text-7xl font-bold leading-[0.9] tracking-tight text-white mb-6">
                Watch the <span className="bg-gradient-to-r from-stone-200 to-stone-100 bg-clip-text text-transparent">Greatest Story</span> Ever Told
              </h1>

              <p className="text-stone-100/90 text-xl md:text-2xl leading-relaxed max-w-3xl mb-8">
                Watch the life of Jesus through authentic films,
                translated into thousands of languages and shared
                with billions of people worldwide.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <Button
                  size="lg"
                  className="bg-white text-slate-900 hover:bg-blue-50 px-12 py-6 rounded-full font-semibold tracking-wide transition-all duration-200 flex items-center gap-3 shadow-2xl hover:shadow-white/20 text-lg"
                >
                  <Clapperboard
                    style={{ width: "24px", height: "24px" }}
                  />
                  Free Bible Videos
                </Button>
              </div>
            </div>

            {/* Right Side - Audience Segmentation */}
            <AudienceSegmentation onOptionSelect={handleAudienceSelection} />
          </div>
        </div>
      </section>

      {/* Video Bible Collection Section */}
      <section className="min-h-screen bg-slate-950 bg-gradient-to-tr from-blue-950/10 via-purple-950/10 to-[#91214A]/90 py-16 scroll-snap-start-always text-white relative">
        {/* Texture Overlay */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'url("https://www.jesusfilm.org/_next/static/media/overlay.d86a559d.svg")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />

        {/* Header Section - Constrained */}
        <div className="max-w-[1920px] mx-auto px-20 py-12 relative z-10">
          <div className="flex justify-between items-start mb-12">
            <div className="max-w-5xl">
              <p className="text-stone-200/80 text-sm tracking-[0.3em] uppercase mb-8 font-medium text-[rgba(255,255,255,0.6)]">
                VIDEO BIBLE COLLECTION
              </p>
              <h2 className="text-3xl xl:text-4xl 2xl:text-5xl font-bold leading-[0.95] tracking-tight text-white mb-6">
                Video Gospel in every style and language
              </h2>
              <p className="text-stone-100/90 text-xl leading-relaxed max-w-3xl text-[rgba(255,255,255,0.9)]">
                Experience the life of Jesus through authentic,
                faithful films translated into thousands of
                languages worldwide.
              </p>
            </div>
            <Button
              size="lg"
              className="bg-white text-slate-900 hover:bg-blue-50 px-10 py-4 rounded-full font-semibold tracking-wide transition-all duration-200 flex items-center gap-3 mt-8 shadow-2xl hover:shadow-white/20"
            >
              <Play className="w-5 h-5 fill-slate-900" />
              WATCH NOW
            </Button>
          </div>
        </div>

        {/* Film Thumbnails Carousel - Full Width */}
        <div className="relative z-10 mb-12">
          <div 
            className="film-carousel"
            style={{
              paddingBottom: "80px",
            }}
          >
            <Carousel 
              opts={{
                align: "start",
                loop: false,
              }}
              setApi={setCarouselApi}
              className="w-full"
            >
              <CarouselContent className="-ml-6 pl-6">
                {films.map((film, index) => (
                  <CarouselItem key={index} className={`basis-auto ${index === 0 ? 'pl-24' : 'pl-6'}`}>
                    <div className="w-[280px]">
                      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden group cursor-pointer shadow-2xl hover:shadow-3xl transition-all duration-300 slide-with-bevel">
                        <ImageWithFallback
                          src={film.image}
                          alt={film.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent opacity-80" />

                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="bg-white/20 backdrop-blur-sm rounded-full p-6 border border-white/30">
                            <Play className="w-8 h-8 text-white fill-white" />
                          </div>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <div className="mb-3">
                            <div className="flex items-center gap-2 text-stone-200/80 text-xs uppercase tracking-wider mb-2">
                              <span>{film.duration}</span>
                              <span className="w-1 h-1 bg-stone-200/60 rounded-full"></span>
                              <span>{film.languages}</span>
                            </div>
                            <h3 className="text-white text-xl font-semibold mb-2 tracking-wide leading-tight">
                              {film.title}
                            </h3>
                            <p className="text-stone-100/90 text-sm leading-relaxed">
                              {film.subtitle}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2 w-14 h-14 bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 text-white shadow-2xl" />
              <CarouselNext className="right-2 w-14 h-14 bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 text-white shadow-2xl" />
            </Carousel>

            {/* Progress Indicator */}
            <div className="flex justify-center mt-8">
              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-full px-6 py-3 border border-white/10">
                <div className="flex items-center gap-2">
                  {Array.from({ length: count }, (_, index) => (
                    <button
                      key={index}
                      onClick={() => carouselApi?.scrollTo(index)}
                      className={`transition-all duration-300 rounded-full ${
                        index + 1 === current
                          ? "w-8 h-2 bg-white shadow-lg"
                          : "w-2 h-2 bg-white/30 hover:bg-white/50"
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
                <div className="w-px h-4 bg-white/20" />
                <span className="text-white/80 text-sm font-medium tracking-wide">
                  {current} / {count}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mission Text - Constrained */}
        <div className="max-w-[1920px] mx-auto px-20 relative z-10 mb-12">
          <p className="text-lg xl:text-xl mt-0 leading-relaxed text-stone-200/80 text-[20px]">
            <span className="text-white font-bold">
              Our mission
            </span>{" "}
            is to introduce people to the Bible through films
            and videos that faithfully bring the Gospels to
            life. By visually telling the story of Jesus and
            God's love for humanity, we make Scripture more
            accessible, engaging, and easy to understand.
          </p>
        </div>
      </section>

      {/* Video Course Section */}
      <section className="min-h-screen bg-stone-950 py-16 scroll-snap-start-always text-white relative">
        {/* Background Image - Bottom Layer */}
        <div
          className="absolute left-0 right-0 top-0 w-full aspect-[32/15] opacity-60"
          style={{
            backgroundImage:
              'url("https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2F8_NBC.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            mask: "linear-gradient(to bottom, white 0%, white 50%, transparent 100%)",
            WebkitMask:
              "linear-gradient(to bottom, white 0%, white 50%, transparent 100%)",
          }}
        />

        {/* Gradient Overlay - Middle Layer */}
        <div className="absolute inset-0 bg-gradient-to-tr from-red-950/40 via-orange-750/30 to-yellow-550/10" />

        {/* Texture Overlay - Top Layer */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'url("https://www.jesusfilm.org/_next/static/media/overlay.d86a559d.svg")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />

        {/* Header Section - Constrained */}
        <div className="max-w-[1920px] mx-auto px-20 py-12 relative z-10">
          <div className="flex justify-between items-start mb-12">
            <div className="max-w-6xl">
              <p className="text-stone-200/80 text-sm tracking-[0.3em] uppercase mb-8 font-medium text-[rgba(255,255,255,0.6)]">
                VIDEO COURSE
              </p>
              <h2 className="text-3xl xl:text-4xl 2xl:text-5xl font-bold leading-[0.95] tracking-tight text-white mb-6">
                New Believer Course
              </h2>
              <p className="text-stone-100/90 text-xl leading-relaxed max-w-3xl text-[rgba(255,255,255,0.9)]">
                If you've ever wondered what Christianity is
                about, or what sort of lifestyle it empowers you
                to live, the New Believer Course exists to help
                you understand the Gospel and live your life in
                response to it.
              </p>
            </div>
            <Button
              size="lg"
              className="bg-white text-slate-900 hover:bg-blue-50 px-10 py-4 rounded-full font-semibold tracking-wide transition-all duration-200 flex items-center gap-3 mt-8 shadow-2xl hover:shadow-white/20"
            >
              SEE ALL
            </Button>
          </div>
        </div>

        {/* Video Grid - YouTube Style */}
        <div className="max-w-[1920px] mx-auto px-20 relative z-10 mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {courseVideos.map((video, index) => (
              <div key={index} className="group cursor-pointer">
                {/* Video Thumbnail */}
                <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-slate-800 shadow-2xl hover:shadow-3xl transition-all duration-300 slide-with-bevel">
                  <ImageWithFallback
                    src={video.image}
                    alt={video.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Opacity Gradient Overlay for Episode Number */}
                  <div
                    className="absolute top-0 left-0 w-32 h-24 backdrop-blur-sm"
                    style={{
                      background:
                        "radial-gradient(ellipse at top left, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 40%, transparent 70%)",
                      mask: "radial-gradient(ellipse at top left, white 0%, rgba(255,255,255,0.8) 30%, rgba(255,255,255,0.4) 60%, transparent 100%)",
                      WebkitMask:
                        "radial-gradient(ellipse at top left, white 0%, rgba(255,255,255,0.8) 30%, rgba(255,255,255,0.4) 60%, transparent 100%)",
                    }}
                  />

                  {/* Episode Number Badge */}
                  <div
                    className="absolute top-2 left-2 text-[48px] font-bold leading-none text-white"
                    data-number={index + 1}
                    style={{
                      mixBlendMode: "overlay",

                      textShadow:
                        "0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(255,255,255,0.4)",
                      mask: "linear-gradient(to bottom, orange-200 50%, rgba(255,255,255,0.7) 70%, rgba(255,255,255,0.5) 100%)",
                      WebkitMask:
                        "linear-gradient(to bottom, orange-200 50%, rgba(255,255,255,0.7) 70%, rgba(255,255,255,0.5) 100%)",
                    }}
                  >
                    {index + 1}
                  </div>

                  {/* Duration Badge */}
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded font-medium flex items-center gap-1">
                    <Play className="w-2.5 h-2.5 fill-white" />
                    {video.duration}
                  </div>

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                      <Play className="w-6 h-6 text-slate-900 fill-slate-900" />
                    </div>
                  </div>
                </div>

                {/* Video Info */}
                <div className="space-y-1">
                  <h3 className="text-white font-semibold leading-tight line-clamp-2 group-hover:text-stone-200 transition-colors duration-200">
                    {video.title}
                  </h3>
                  <p className="text-stone-200/80 text-sm leading-relaxed line-clamp-2">
                    {video.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Course Info Text - Constrained */}
        <div className="max-w-[1920px] mx-auto px-20 relative z-10 mb-12">
          <p className="text-lg xl:text-xl mt-4 leading-relaxed text-stone-200/80 text-[20px]">
            <span className="text-white font-bold">
              This course
            </span>{" "}
            is designed to help new believers understand the
            basics of Christian faith. Each video covers
            essential topics that will strengthen your
            foundation and guide you as you begin your journey
            with Jesus Christ.
          </p>
        </div>
      </section>

      {/* Browse by Category Section */}
      <section className="min-h-screen bg-stone-950 py-16 scroll-snap-start-always text-white relative">
        {/* Background Image - Bottom Layer */}
        <div
          className="absolute left-0 right-0 top-0 w-full aspect-[32/15] opacity-20"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1583525957866-ea1cdcb4f46a?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            mask: "linear-gradient(to bottom, white 0%, white 50%, transparent 100%)",
            WebkitMask:
              "linear-gradient(to bottom, white 0%, white 50%, transparent 100%)",
          }}
        />

        {/* Gradient Overlay - Middle Layer */}
        <div className="absolute inset-0 bg-gradient-to-tr from-stone-950/80 via-stone-900/50 to-stone-800/20" />

        {/* Texture Overlay - Top Layer */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'url("https://www.jesusfilm.org/_next/static/media/overlay.d86a559d.svg")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />

        {/* Header Section - Constrained */}
        <div className="max-w-[1920px] mx-auto px-20 py-12 relative z-10">
          <div className="flex justify-between items-start mb-12">
            <div className="max-w-6xl">
              <p className="text-stone-200/80 text-sm tracking-[0.3em] uppercase mb-8 font-medium text-[rgba(255,255,255,0.6)]">
                BROWSE BY CATEGORY
              </p>
              <h2 className="text-3xl xl:text-4xl 2xl:text-5xl font-bold leading-[0.95] tracking-tight text-white mb-6">
                Discover Content by Topic
              </h2>
              <p className="text-stone-100/90 text-xl leading-relaxed max-w-3xl text-[rgba(255,255,255,0.9)]">
                Explore biblical themes and topics that matter to you. Find films and videos organized by spiritual categories to deepen your understanding and faith journey.
              </p>
            </div>
            <Button
              size="lg"
              className="bg-white text-slate-900 hover:bg-blue-50 px-10 py-4 rounded-full font-semibold tracking-wide transition-all duration-200 flex items-center gap-3 mt-8 shadow-2xl hover:shadow-white/20"
            >
              SEE ALL
            </Button>
          </div>
        </div>

        {/* Categories Carousel - Full Width */}
        <div className="relative z-10 mb-12">
          <div 
            className="categories-carousel"
            style={{
              paddingBottom: "80px",
            }}
          >
            <Carousel 
              opts={{
                align: "start",
                loop: false,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-6 pl-6">
                {[
                  { 
                    title: "Jesus' Life & Teachings",
                    gradient: "from-orange-600 via-amber-500 to-yellow-400",
                    icon: BookOpen,
                    iconColor: "text-amber-400"
                  },
                  { 
                    title: "Faith & Salvation",
                    gradient: "from-teal-600 via-emerald-500 to-green-400",
                    icon: Shield,
                    iconColor: "text-emerald-400"
                  },
                  { 
                    title: "Hope & Healing",
                    gradient: "from-orange-700 via-red-500 to-pink-400",
                    icon: Plus,
                    iconColor: "text-pink-400"
                  },
                  { 
                    title: "Forgiveness & Grace",
                    gradient: "from-green-700 via-green-600 to-emerald-500",
                    icon: HandHeart,
                    iconColor: "text-emerald-400"
                  },
                  { 
                    title: "Suffering & Struggle",
                    gradient: "from-purple-700 via-purple-600 to-purple-500",
                    icon: Mountain,
                    iconColor: "text-purple-400"
                  },
                  { 
                    title: "Identity & Purpose",
                    gradient: "from-blue-700 via-blue-600 to-blue-500",
                    icon: Compass,
                    iconColor: "text-blue-400"
                  },
                  { 
                    title: "Love & Relationships",
                    gradient: "from-pink-700 via-pink-600 to-rose-500",
                    icon: Heart,
                    iconColor: "text-rose-400"
                  },
                  { 
                    title: "Prayer & Spiritual Growth",
                    gradient: "from-indigo-700 via-indigo-600 to-purple-500",
                    icon: Sprout,
                    iconColor: "text-purple-400"
                  },
                  { 
                    title: "Miracles & Power of God",
                    gradient: "from-yellow-600 via-orange-500 to-red-500",
                    icon: Zap,
                    iconColor: "text-orange-400"
                  },
                  { 
                    title: "Death & Resurrection",
                    gradient: "from-slate-700 via-slate-600 to-gray-500",
                    icon: RotateCcw,
                    iconColor: "text-gray-300"
                  },
                  { 
                    title: "Justice & Compassion",
                    gradient: "from-emerald-700 via-teal-600 to-cyan-500",
                    icon: Scale,
                    iconColor: "text-cyan-400"
                  },
                  { 
                    title: "Discipleship & Mission",
                    gradient: "from-violet-700 via-purple-600 to-indigo-500",
                    icon: Send,
                    iconColor: "text-indigo-400"
                  }
                ].map((category, index) => {
                  const IconComponent = category.icon;
                  return (
                  <CarouselItem key={index} className={`basis-auto ${index === 0 ? 'pl-24' : 'pl-6'}`}>
                    <div className="w-[180px]">
                      <div 
                        className={`relative aspect-[4/5] rounded-2xl overflow-hidden group cursor-pointer shadow-2xl hover:shadow-3xl transition-all duration-300 bg-gradient-to-br ${category.gradient} hover:scale-105 slide-with-bevel`}
                      >
                        {/* Noise texture overlay */}
                        <div
                          className="absolute inset-0 opacity-30"
                          style={{
                            backgroundImage:
                              'url("https://www.jesusfilm.org/_next/static/media/overlay.d86a559d.svg")',
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat",
                          }}
                        />
                        
                        {/* Subtle gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10" />
                        
                        {/* Solid colored icon */}
                        <div className="absolute top-4 right-4">
                          <IconComponent className={`w-12 h-12 ${category.iconColor}`} />
                        </div>
                        
                        {/* Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="text-white text-lg xl:text-xl 2xl:text-2xl font-semibold tracking-wide leading-tight">
                            {category.title}
                          </h3>
                        </div>

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    </div>
                  </CarouselItem>
                  );
                })}
              </CarouselContent>
              <CarouselPrevious className="left-2 w-14 h-14 bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 text-white shadow-2xl" />
              <CarouselNext className="right-2 w-14 h-14 bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 text-white shadow-2xl" />
            </Carousel>
          </div>
        </div>

        {/* Description Text - Constrained */}
        <div className="max-w-[1920px] mx-auto px-20 relative z-10 mb-12">
          <p className="text-lg xl:text-xl mt-4 leading-relaxed text-stone-200/80 text-[20px]">
            <span className="text-white font-bold">
              Each category
            </span>{" "}
            contains carefully curated films and videos that explore specific biblical themes and life applications. Whether you're seeking guidance, inspiration, or deeper understanding, these collections will guide your spiritual journey.
          </p>
        </div>
      </section>






    </div>
  );
}