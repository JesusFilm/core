// Mock Video Data for WAT-135 Shaping

import type { Video, VideoCollection } from '../types/homepage.types';
import { COLLECTIONS } from './collections';

// Mock videos with realistic data
const MOCK_VIDEOS: Video[] = [
  // Featured Content (8 videos)
  {
    id: 'jesus-film-001',
    title: 'JESUS Film',
    description: 'The life of Jesus Christ according to the Gospel of Luke',
    thumbnailUrl: 'https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2F1_jf-0-0.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75',
    duration: 7200, // 2 hours
    category: 'Featured',
    language: 'en',
    publishedAt: '2024-01-15',
    watchUrl: '/watch/jesus-film-001'
  },
  {
    id: 'easter-story-002',
    title: 'The True Meaning of Easter',
    description: 'Discover the power behind the resurrection story',
    thumbnailUrl: 'https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2F1_jf-0-0.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75',
    duration: 1800, // 30 minutes
    category: 'Featured',
    language: 'en',
    publishedAt: '2024-03-20',
    watchUrl: '/watch/easter-story-002'
  },
  {
    id: 'gospel-john-003',
    title: 'Gospel of John',
    description: 'The complete story of Jesus through John\'s eyes',
    thumbnailUrl: '/images/john-gospel-thumb.jpg',
    duration: 9000, // 2.5 hours
    category: 'Featured',
    language: 'en',
    publishedAt: '2024-02-15',
    watchUrl: '/watch/gospel-john-003'
  },
  {
    id: 'acts-apostles-004',
    title: 'Acts of the Apostles',
    description: 'The birth and growth of the early church',
    thumbnailUrl: '/images/acts-thumb.jpg',
    duration: 6000, // 1.67 hours
    category: 'Featured',
    language: 'en',
    publishedAt: '2024-01-30',
    watchUrl: '/watch/acts-apostles-004'
  },
  {
    id: 'psalms-collection-005',
    title: 'Psalms Collection',
    description: 'Beautiful visual interpretations of the Psalms',
    thumbnailUrl: '/images/psalms-thumb.jpg',
    duration: 3600, // 1 hour
    category: 'Featured',
    language: 'en',
    publishedAt: '2024-03-10',
    watchUrl: '/watch/psalms-collection-005'
  },
  {
    id: 'proverbs-wisdom-006',
    title: 'Proverbs: Wisdom for Life',
    description: 'Timeless wisdom from the book of Proverbs',
    thumbnailUrl: '/images/proverbs-thumb.jpg',
    duration: 2700, // 45 minutes
    category: 'Featured',
    language: 'en',
    publishedAt: '2024-02-25',
    watchUrl: '/watch/proverbs-wisdom-006'
  },
  {
    id: 'revelation-vision-007',
    title: 'Revelation: The Final Vision',
    description: 'John\'s apocalyptic vision of the end times',
    thumbnailUrl: '/images/revelation-thumb.jpg',
    duration: 5400, // 1.5 hours
    category: 'Featured',
    language: 'en',
    publishedAt: '2024-01-20',
    watchUrl: '/watch/revelation-vision-007'
  },
  {
    id: 'genesis-beginning-008',
    title: 'Genesis: In the Beginning',
    description: 'The creation story and early biblical history',
    thumbnailUrl: '/images/genesis-thumb.jpg',
    duration: 7200, // 2 hours
    category: 'Featured',
    language: 'en',
    publishedAt: '2024-03-05',
    watchUrl: '/watch/genesis-beginning-008'
  },

  // New Releases (8 videos)
  {
    id: 'exodus-journey-009',
    title: 'Exodus: The Journey to Freedom',
    description: 'Moses leads the Israelites out of Egypt',
    thumbnailUrl: '/images/exodus-thumb.jpg',
    duration: 8100, // 2.25 hours
    category: 'New',
    language: 'en',
    publishedAt: '2024-04-01',
    watchUrl: '/watch/exodus-journey-009'
  },
  {
    id: 'daniel-lions-010',
    title: 'Daniel and the Lions\' Den',
    description: 'Faith and courage in the face of persecution',
    thumbnailUrl: '/images/daniel-thumb.jpg',
    duration: 1800, // 30 minutes
    category: 'New',
    language: 'en',
    publishedAt: '2024-03-28',
    watchUrl: '/watch/daniel-lions-010'
  },
  {
    id: 'esther-queen-011',
    title: 'Esther: Queen of Courage',
    description: 'A young woman\'s bravery saves her people',
    thumbnailUrl: '/images/esther-thumb.jpg',
    duration: 2400, // 40 minutes
    category: 'New',
    language: 'en',
    publishedAt: '2024-03-25',
    watchUrl: '/watch/esther-queen-011'
  },
  {
    id: 'ruth-loyalty-012',
    title: 'Ruth: A Story of Loyalty',
    description: 'Love and faithfulness in difficult times',
    thumbnailUrl: '/images/ruth-thumb.jpg',
    duration: 2100, // 35 minutes
    category: 'New',
    language: 'en',
    publishedAt: '2024-03-22',
    watchUrl: '/watch/ruth-loyalty-012'
  },
  {
    id: 'job-suffering-013',
    title: 'Job: Faith Through Suffering',
    description: 'Understanding pain and God\'s sovereignty',
    thumbnailUrl: '/images/job-thumb.jpg',
    duration: 3600, // 1 hour
    category: 'New',
    language: 'en',
    publishedAt: '2024-03-18',
    watchUrl: '/watch/job-suffering-013'
  },
  {
    id: 'song-solomon-014',
    title: 'Song of Solomon: Love\'s Poetry',
    description: 'The beauty of love and relationships',
    thumbnailUrl: '/images/song-solomon-thumb.jpg',
    duration: 1800, // 30 minutes
    category: 'New',
    language: 'en',
    publishedAt: '2024-03-15',
    watchUrl: '/watch/song-solomon-014'
  },
  {
    id: 'ecclesiastes-meaning-015',
    title: 'Ecclesiastes: Finding Meaning',
    description: 'The search for purpose in life',
    thumbnailUrl: '/images/ecclesiastes-thumb.jpg',
    duration: 2700, // 45 minutes
    category: 'New',
    language: 'en',
    publishedAt: '2024-03-12',
    watchUrl: '/watch/ecclesiastes-meaning-015'
  },
  {
    id: 'lamentations-hope-016',
    title: 'Lamentations: Hope in Despair',
    description: 'Finding light in the darkest times',
    thumbnailUrl: '/images/lamentations-thumb.jpg',
    duration: 1500, // 25 minutes
    category: 'New',
    language: 'en',
    publishedAt: '2024-03-08',
    watchUrl: '/watch/lamentations-hope-016'
  },

  // Video Gospel (8 videos)
  {
    id: 'gospel-luke-017',
    title: 'Gospel of Luke',
    description: 'Complete Gospel of Luke visual narrative',
    thumbnailUrl: '/images/luke-gospel-thumb.jpg',
    duration: 10800, // 3 hours
    category: 'Video Gospel',
    language: 'en',
    publishedAt: '2024-01-01',
    watchUrl: '/watch/gospel-luke-017'
  },
  {
    id: 'gospel-mark-018',
    title: 'Gospel of Mark',
    description: 'The action-packed story of Jesus',
    thumbnailUrl: '/images/mark-gospel-thumb.jpg',
    duration: 7200, // 2 hours
    category: 'Video Gospel',
    language: 'en',
    publishedAt: '2024-01-10',
    watchUrl: '/watch/gospel-mark-018'
  },
  {
    id: 'gospel-matthew-019',
    title: 'Gospel of Matthew',
    description: 'Jesus as the promised Messiah',
    thumbnailUrl: '/images/matthew-gospel-thumb.jpg',
    duration: 9000, // 2.5 hours
    category: 'Video Gospel',
    language: 'en',
    publishedAt: '2024-01-05',
    watchUrl: '/watch/gospel-matthew-019'
  },
  {
    id: 'gospel-john-complete-020',
    title: 'Gospel of John (Complete)',
    description: 'The spiritual Gospel in full visual form',
    thumbnailUrl: '/images/john-complete-thumb.jpg',
    duration: 12000, // 3.33 hours
    category: 'Video Gospel',
    language: 'en',
    publishedAt: '2024-02-01',
    watchUrl: '/watch/gospel-john-complete-020'
  },
  {
    id: 'gospel-luke-extended-021',
    title: 'Gospel of Luke (Extended)',
    description: 'Complete Luke with commentary and insights',
    thumbnailUrl: '/images/luke-extended-thumb.jpg',
    duration: 14400, // 4 hours
    category: 'Video Gospel',
    language: 'en',
    publishedAt: '2024-02-15',
    watchUrl: '/watch/gospel-luke-extended-021'
  },
  {
    id: 'gospel-mark-short-022',
    title: 'Gospel of Mark (Short Version)',
    description: 'Condensed version for busy schedules',
    thumbnailUrl: '/images/mark-short-thumb.jpg',
    duration: 5400, // 1.5 hours
    category: 'Video Gospel',
    language: 'en',
    publishedAt: '2024-02-20',
    watchUrl: '/watch/gospel-mark-short-022'
  },
  {
    id: 'gospel-matthew-study-023',
    title: 'Gospel of Matthew (Study Edition)',
    description: 'Matthew with study guides and discussion',
    thumbnailUrl: '/images/matthew-study-thumb.jpg',
    duration: 10800, // 3 hours
    category: 'Video Gospel',
    language: 'en',
    publishedAt: '2024-03-01',
    watchUrl: '/watch/gospel-matthew-study-023'
  },
  {
    id: 'gospel-john-youth-024',
    title: 'Gospel of John (Youth Edition)',
    description: 'John\'s Gospel adapted for young audiences',
    thumbnailUrl: '/images/john-youth-thumb.jpg',
    duration: 7200, // 2 hours
    category: 'Video Gospel',
    language: 'en',
    publishedAt: '2024-03-10',
    watchUrl: '/watch/gospel-john-youth-024'
  },

  // Short Videos (8 videos)
  {
    id: 'my-last-day-025',
    title: 'My Last Day',
    description: 'Last hour of Jesus\' life from criminal\'s point of view',
    thumbnailUrl: 'https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2F1_jf-0-0.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75',
    duration: 540, // 9 minutes
    category: 'Short Videos',
    language: 'en',
    publishedAt: '2024-02-10',
    watchUrl: '/watch/my-last-day-025'
  },
  {
    id: 'prodigal-son-026',
    title: 'The Prodigal Son',
    description: 'A father\'s unconditional love and forgiveness',
    thumbnailUrl: '/images/prodigal-son-thumb.jpg',
    duration: 600, // 10 minutes
    category: 'Short Videos',
    language: 'en',
    publishedAt: '2024-02-15',
    watchUrl: '/watch/prodigal-son-026'
  },
  {
    id: 'good-samaritan-027',
    title: 'The Good Samaritan',
    description: 'Who is my neighbor? A lesson in compassion',
    thumbnailUrl: '/images/good-samaritan-thumb.jpg',
    duration: 480, // 8 minutes
    category: 'Short Videos',
    language: 'en',
    publishedAt: '2024-02-20',
    watchUrl: '/watch/good-samaritan-027'
  },
  {
    id: 'lost-sheep-028',
    title: 'The Lost Sheep',
    description: 'God\'s relentless pursuit of the lost',
    thumbnailUrl: '/images/lost-sheep-thumb.jpg',
    duration: 360, // 6 minutes
    category: 'Short Videos',
    language: 'en',
    publishedAt: '2024-02-25',
    watchUrl: '/watch/lost-sheep-028'
  },
  {
    id: 'mustard-seed-029',
    title: 'The Mustard Seed',
    description: 'Small beginnings, great outcomes',
    thumbnailUrl: '/images/mustard-seed-thumb.jpg',
    duration: 420, // 7 minutes
    category: 'Short Videos',
    language: 'en',
    publishedAt: '2024-03-01',
    watchUrl: '/watch/mustard-seed-029'
  },
  {
    id: 'sower-parable-030',
    title: 'The Sower and the Seeds',
    description: 'How we receive God\'s word in our hearts',
    thumbnailUrl: '/images/sower-parable-thumb.jpg',
    duration: 540, // 9 minutes
    category: 'Short Videos',
    language: 'en',
    publishedAt: '2024-03-05',
    watchUrl: '/watch/sower-parable-030'
  },
  {
    id: 'talents-parable-031',
    title: 'The Parable of the Talents',
    description: 'Using our gifts for God\'s kingdom',
    thumbnailUrl: '/images/talents-parable-thumb.jpg',
    duration: 600, // 10 minutes
    category: 'Short Videos',
    language: 'en',
    publishedAt: '2024-03-10',
    watchUrl: '/watch/talents-parable-031'
  },
  {
    id: 'wedding-feast-032',
    title: 'The Wedding Feast',
    description: 'God\'s invitation to the great banquet',
    thumbnailUrl: '/images/wedding-feast-thumb.jpg',
    duration: 480, // 8 minutes
    category: 'Short Videos',
    language: 'en',
    publishedAt: '2024-03-15',
    watchUrl: '/watch/wedding-feast-032'
  },

  // Animated Series (8 videos)
  {
    id: 'book-hope-033',
    title: 'The Book of Hope',
    description: 'Animated journey through God\'s story of redemption',
    thumbnailUrl: '/images/book-hope-thumb.jpg',
    duration: 1980, // 33 minutes
    category: 'Animated Series',
    language: 'en',
    publishedAt: '2024-02-28',
    watchUrl: '/watch/book-hope-033'
  },
  {
    id: 'superbook-adam-034',
    title: 'Superbook: Adam and Eve',
    description: 'The first humans and the fall of mankind',
    thumbnailUrl: '/images/superbook-adam-thumb.jpg',
    duration: 1800, // 30 minutes
    category: 'Animated Series',
    language: 'en',
    publishedAt: '2024-02-15',
    watchUrl: '/watch/superbook-adam-034'
  },
  {
    id: 'superbook-noah-035',
    title: 'Superbook: Noah\'s Ark',
    description: 'Faith and obedience in the face of ridicule',
    thumbnailUrl: '/images/superbook-noah-thumb.jpg',
    duration: 2100, // 35 minutes
    category: 'Animated Series',
    language: 'en',
    publishedAt: '2024-02-20',
    watchUrl: '/watch/superbook-noah-035'
  },
  {
    id: 'superbook-moses-036',
    title: 'Superbook: Moses and the Exodus',
    description: 'God\'s deliverance of His people',
    thumbnailUrl: '/images/superbook-moses-thumb.jpg',
    duration: 2400, // 40 minutes
    category: 'Animated Series',
    language: 'en',
    publishedAt: '2024-02-25',
    watchUrl: '/watch/superbook-moses-036'
  },
  {
    id: 'superbook-david-037',
    title: 'Superbook: David and Goliath',
    description: 'Courage and faith against impossible odds',
    thumbnailUrl: '/images/superbook-david-thumb.jpg',
    duration: 1800, // 30 minutes
    category: 'Animated Series',
    language: 'en',
    publishedAt: '2024-03-01',
    watchUrl: '/watch/superbook-david-037'
  },
  {
    id: 'superbook-daniel-038',
    title: 'Superbook: Daniel in the Lions\' Den',
    description: 'Standing firm in faith under pressure',
    thumbnailUrl: '/images/superbook-daniel-thumb.jpg',
    duration: 2100, // 35 minutes
    category: 'Animated Series',
    language: 'en',
    publishedAt: '2024-03-05',
    watchUrl: '/watch/superbook-daniel-038'
  },
  {
    id: 'superbook-jonah-039',
    title: 'Superbook: Jonah and the Whale',
    description: 'Running from God and finding mercy',
    thumbnailUrl: '/images/superbook-jonah-thumb.jpg',
    duration: 1800, // 30 minutes
    category: 'Animated Series',
    language: 'en',
    publishedAt: '2024-03-10',
    watchUrl: '/watch/superbook-jonah-039'
  },
  {
    id: 'superbook-jesus-040',
    title: 'Superbook: The Life of Jesus',
    description: 'The complete story of Jesus in animation',
    thumbnailUrl: '/images/superbook-jesus-thumb.jpg',
    duration: 3600, // 1 hour
    category: 'Animated Series',
    language: 'en',
    publishedAt: '2024-03-15',
    watchUrl: '/watch/superbook-jesus-040'
  },

  // Upcoming Events (8 videos)
  {
    id: 'easter-2025-041',
    title: 'Easter 2025 Celebration',
    description: 'Join our global Easter celebration event',
    thumbnailUrl: '/images/easter-2025-thumb.jpg',
    duration: 3600, // 1 hour
    category: 'Upcoming Events',
    language: 'en',
    publishedAt: '2025-04-20',
    watchUrl: '/watch/easter-2025-041'
  },
  {
    id: 'christmas-2024-042',
    title: 'Christmas 2024 Special',
    description: 'Celebrating the birth of Jesus worldwide',
    thumbnailUrl: '/images/christmas-2024-thumb.jpg',
    duration: 5400, // 1.5 hours
    category: 'Upcoming Events',
    language: 'en',
    publishedAt: '2024-12-25',
    watchUrl: '/watch/christmas-2024-042'
  },
  {
    id: 'prayer-summit-043',
    title: 'Global Prayer Summit 2024',
    description: '24-hour prayer event for world transformation',
    thumbnailUrl: '/images/prayer-summit-thumb.jpg',
    duration: 86400, // 24 hours
    category: 'Upcoming Events',
    language: 'en',
    publishedAt: '2024-06-15',
    watchUrl: '/watch/prayer-summit-043'
  },
  {
    id: 'youth-conference-044',
    title: 'Youth Conference 2024',
    description: 'Empowering the next generation of believers',
    thumbnailUrl: '/images/youth-conference-thumb.jpg',
    duration: 7200, // 2 hours
    category: 'Upcoming Events',
    language: 'en',
    publishedAt: '2024-07-20',
    watchUrl: '/watch/youth-conference-044'
  },
  {
    id: 'missions-week-045',
    title: 'Missions Week 2024',
    description: 'Stories from the field and mission updates',
    thumbnailUrl: '/images/missions-week-thumb.jpg',
    duration: 5400, // 1.5 hours
    category: 'Upcoming Events',
    language: 'en',
    publishedAt: '2024-09-10',
    watchUrl: '/watch/missions-week-045'
  },
  {
    id: 'bible-study-live-046',
    title: 'Live Bible Study Series',
    description: 'Interactive Bible study with global participants',
    thumbnailUrl: '/images/bible-study-live-thumb.jpg',
    duration: 3600, // 1 hour
    category: 'Upcoming Events',
    language: 'en',
    publishedAt: '2024-05-15',
    watchUrl: '/watch/bible-study-live-046'
  },
  {
    id: 'worship-night-047',
    title: 'Global Worship Night',
    description: 'United in worship across continents',
    thumbnailUrl: '/images/worship-night-thumb.jpg',
    duration: 7200, // 2 hours
    category: 'Upcoming Events',
    language: 'en',
    publishedAt: '2024-08-30',
    watchUrl: '/watch/worship-night-047'
  },
  {
    id: 'family-conference-048',
    title: 'Family Conference 2024',
    description: 'Strengthening families through faith',
    thumbnailUrl: '/images/family-conference-thumb.jpg',
    duration: 10800, // 3 hours
    category: 'Upcoming Events',
    language: 'en',
    publishedAt: '2024-10-15',
    watchUrl: '/watch/family-conference-048'
  }
];

// LUMO - The Gospel of Mark (15 items)
const LUMO_MARK_COLLECTION_ID = 'col_lumo_mark_007';
const LUMO_MARK_VIDEOS: Video[] = [
  {
    id: 'lumo-mark-001',
    title: 'Mark 1: The Beginning of the Gospel',
    description: 'John the Baptist prepares the way and Jesus is baptized.',
    thumbnailUrl: 'https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2F6_GOMark1501.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75',
    duration: 900,
    category: 'LUMO - Mark',
    language: 'en',
    publishedAt: '2024-04-01',
    watchUrl: '/watch/lumo-mark-001'
  },
  {
    id: 'lumo-mark-002',
    title: 'Mark 2: Jesus Heals and Forgives',
    description: 'Jesus heals a paralyzed man and calls Levi.',
    thumbnailUrl: 'https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2F6_GOMark1502.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75',
    duration: 780,
    category: 'LUMO - Mark',
    language: 'en',
    publishedAt: '2024-04-02',
    watchUrl: '/watch/lumo-mark-002'
  },
  {
    id: 'lumo-mark-003',
    title: 'Mark 3: Lord of the Sabbath',
    description: 'Jesus heals on the Sabbath and appoints the twelve.',
    thumbnailUrl: 'https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2FGOMarkCollection.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75',
    duration: 820,
    category: 'LUMO - Mark',
    language: 'en',
    publishedAt: '2024-04-03',
    watchUrl: '/watch/lumo-mark-003'
  },
  {
    id: 'lumo-mark-004',
    title: 'Mark 4: Parables of the Kingdom',
    description: 'Jesus teaches with parables and calms the storm.',
    thumbnailUrl: 'https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2FGOMarkCollection.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75',
    duration: 950,
    category: 'LUMO - Mark',
    language: 'en',
    publishedAt: '2024-04-04',
    watchUrl: '/watch/lumo-mark-004'
  },
  {
    id: 'lumo-mark-005',
    title: 'Mark 5: Power Over Evil',
    description: 'Jesus heals a demon-possessed man, a sick woman, and a dead girl.',
    thumbnailUrl: 'https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2FGOMarkCollection.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75',
    duration: 1020,
    category: 'LUMO - Mark',
    language: 'en',
    publishedAt: '2024-04-05',
    watchUrl: '/watch/lumo-mark-005'
  },
  {
    id: 'lumo-mark-006',
    title: 'Mark 6: The Twelve Sent Out',
    description: 'Jesus sends out the twelve and feeds the five thousand.',
    thumbnailUrl: 'https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2FGOMarkCollection.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75',
    duration: 1100,
    category: 'LUMO - Mark',
    language: 'en',
    publishedAt: '2024-04-06',
    watchUrl: '/watch/lumo-mark-006'
  },
  {
    id: 'lumo-mark-007',
    title: 'Mark 7: Clean and Unclean',
    description: 'Jesus teaches about inner purity and heals a deaf man.',
    thumbnailUrl: 'https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2FGOMarkCollection.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75',
    duration: 870,
    category: 'LUMO - Mark',
    language: 'en',
    publishedAt: '2024-04-07',
    watchUrl: '/watch/lumo-mark-007'
  },
  {
    id: 'lumo-mark-008',
    title: 'Mark 8: Peter Declares Jesus as Messiah',
    description: 'Peter confesses Jesus as the Messiah; Jesus predicts his death.',
    thumbnailUrl: 'https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2FGOMarkCollection.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75',
    duration: 940,
    category: 'LUMO - Mark',
    language: 'en',
    publishedAt: '2024-04-08',
    watchUrl: '/watch/lumo-mark-008'
  },
  {
    id: 'lumo-mark-009',
    title: 'Mark 9: The Transfiguration',
    description: 'Jesus is transfigured and heals a boy possessed by an impure spirit.',
    thumbnailUrl: 'https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2FGOMarkCollection.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75',
    duration: 980,
    category: 'LUMO - Mark',
    language: 'en',
    publishedAt: '2024-04-09',
    watchUrl: '/watch/lumo-mark-009'
  },
  {
    id: 'lumo-mark-010',
    title: 'Mark 10: Teachings on Divorce and Wealth',
    description: 'Jesus teaches about divorce, children, and riches.',
    thumbnailUrl: 'https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2FGOMarkCollection.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75',
    duration: 1050,
    category: 'LUMO - Mark',
    language: 'en',
    publishedAt: '2024-04-10',
    watchUrl: '/watch/lumo-mark-010'
  },
  {
    id: 'lumo-mark-011',
    title: 'Mark 11: The Triumphal Entry',
    description: 'Jesus enters Jerusalem and clears the temple.',
    thumbnailUrl: 'https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2FGOMarkCollection.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75',
    duration: 900,
    category: 'LUMO - Mark',
    language: 'en',
    publishedAt: '2024-04-11',
    watchUrl: '/watch/lumo-mark-011'
  },
  {
    id: 'lumo-mark-012',
    title: 'Mark 12: The Greatest Commandment',
    description: 'Jesus teaches about the greatest commandment and warns against hypocrisy.',
    thumbnailUrl: 'https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2FGOMarkCollection.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75',
    duration: 970,
    category: 'LUMO - Mark',
    language: 'en',
    publishedAt: '2024-04-12',
    watchUrl: '/watch/lumo-mark-012'
  },
  {
    id: 'lumo-mark-013',
    title: 'Mark 13: Signs of the End Times',
    description: 'Jesus predicts the destruction of the temple and his return.',
    thumbnailUrl: 'https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2F1_jf-0-0.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75',
    duration: 890,
    category: 'LUMO - Mark',
    language: 'en',
    publishedAt: '2024-04-13',
    watchUrl: '/watch/lumo-mark-013'
  },
  {
    id: 'lumo-mark-014',
    title: 'Mark 14: The Last Supper',
    description: 'Jesus shares the Passover meal and is arrested.',
    thumbnailUrl: 'https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2FGOMarkCollection.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75',
    duration: 1200,
    category: 'LUMO - Mark',
    language: 'en',
    publishedAt: '2024-04-14',
    watchUrl: '/watch/lumo-mark-014'
  },
  {
    id: 'lumo-mark-015',
    title: 'Mark 15-16: The Crucifixion and Resurrection',
    description: 'Jesus is crucified, buried, and rises from the dead.',
    thumbnailUrl: 'https://www.jesusfilm.org/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FtMY86qEHFACTO8_0kAeRFA%2FGOMarkCollection.mobileCinematicHigh.jpg%2Ff%3Djpg%2Cw%3D1280%2Ch%3D600%2Cq%3D95&w=3840&q=75',
    duration: 1500,
    category: 'LUMO - Mark',
    language: 'en',
    publishedAt: '2024-04-15',
    watchUrl: '/watch/lumo-mark-015'
  }
];

// Group videos by collection
export const MOCK_COLLECTIONS: VideoCollection[] = [
  {
    id: COLLECTIONS.featured,
    title: 'Featured Content',
    description: 'Our most impactful and popular videos',
    category: 'featured',
    videos: MOCK_VIDEOS.filter(v => v.category === 'Featured')
  },
  {
    id: COLLECTIONS.new,
    title: 'New Releases',
    description: 'Latest videos and recently added content',
    category: 'new',
    videos: MOCK_VIDEOS.filter(v => v.category === 'New')
  },
  {
    id: COLLECTIONS.videoGospel,
    title: 'Video Gospel',
    description: 'Complete Gospel narratives in visual form',
    category: 'videoGospel',
    videos: MOCK_VIDEOS.filter(v => v.category === 'Video Gospel')
  },
  {
    id: COLLECTIONS.shortVideos,
    title: 'Short Videos',
    description: 'Powerful messages in bite-sized format',
    category: 'shortVideos',
    videos: MOCK_VIDEOS.filter(v => v.category === 'Short Videos')
  },
  {
    id: COLLECTIONS.animatedSeries,
    title: 'Animated Series',
    description: 'Engaging animated biblical content',
    category: 'animatedSeries',
    videos: MOCK_VIDEOS.filter(v => v.category === 'Animated Series')
  },
  {
    id: COLLECTIONS.upcomingEvents,
    title: 'Upcoming Events',
    description: 'Live events and special celebrations',
    category: 'upcomingEvents',
    videos: MOCK_VIDEOS.filter(v => v.category === 'Upcoming Events')
  },
  {
    id: LUMO_MARK_COLLECTION_ID,
    title: 'LUMO – The Gospel of Mark',
    description:
      'According to THE GOSPEL OF MARK, Jesus is a heroic man of action, healer, and miracle worker – the Son of God who keeps his identity secret. This critically acclaimed, epic production – five years in the making – is based on the latest theological, historical, and archaeological research, and offers an unforgettable, highly authentic telling of the Jesus story – ending with the empty tomb, a promise to meet again in Galilee, and Jesus\'s instructions to spread the good news of the resurrection.',
    category: 'lumoMark',
    videos: LUMO_MARK_VIDEOS
  }
];

export { MOCK_VIDEOS }; 