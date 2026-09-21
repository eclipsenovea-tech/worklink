export const categories = [
  'Cleaning',
  'Gardening',
  'Delivery',
  'Childminding',
  'Tutoring',
  'Moving',
  'Repairs'
]

// Job photos: put the image files in /public/jobs/ using the filenames below
// (or point `image` at any URL). Jobs without a photo show a category placeholder.
export const jobs = [
  {
    id: '1',
    image: '/jobs/garden-cleanup.jpg',
    title: 'Weekend garden cleanup',
    category: 'Gardening',
    pay: 150,
    distance: 1.2,
    postedAt: '2 hours ago',
    location: 'Khayelitsha, Site C',
    description:
      'Need someone to clear an overgrown backyard, cut the grass, and bag the garden waste. Tools provided on site.',
    duration: 'Half day',
    poster: { name: 'Nomsa D.', rating: 4.8, jobsPosted: 12 }
  },
  {
    id: '2',
    image: '/jobs/move-couch.jpg',
    title: 'Move a couch and bed frame',
    category: 'Moving',
    pay: 200,
    distance: 3.4,
    postedAt: '5 hours ago',
    location: 'Mitchells Plain',
    description:
      'Moving from a first-floor flat to a ground-floor unit two streets away. Need two people for about two hours.',
    duration: '2 hours',
    poster: { name: 'Riedwaan K.', rating: 4.6, jobsPosted: 4 }
  },
  {
    id: '3',
    image: '/jobs/childminding.jpg',
    title: 'After-school childminding',
    category: 'Childminding',
    pay: 120,
    distance: 0.8,
    postedAt: 'Yesterday',
    location: 'Delft South',
    description: 'Looking after two kids (ages 6 and 9) from 2pm to 5pm on weekdays this week. Homework help a bonus.',
    duration: '3 hours',
    poster: { name: 'Buhle M.', rating: 5.0, jobsPosted: 21 }
  },
  {
    id: '4',
    image: '/jobs/parcel-delivery.jpg',
    title: 'Same-day parcel delivery',
    category: 'Delivery',
    pay: 90,
    distance: 2.1,
    postedAt: '30 minutes ago',
    location: 'Khayelitsha to Claremont',
    description: 'Small parcel needs to reach Claremont before 5pm today. Own transport preferred but not required.',
    duration: '1-2 hours',
    poster: { name: 'Local Traders Co-op', rating: 4.9, jobsPosted: 58 }
  },
  {
    id: '5',
    image: '/jobs/deep-clean.jpg',
    title: 'Deep clean before family visit',
    category: 'Cleaning',
    pay: 180,
    distance: 1.9,
    postedAt: '1 day ago',
    location: 'Mitchells Plain, Beacon Valley',
    description: 'Two bedroom home, needs a full clean including kitchen and bathroom before Saturday.',
    duration: 'Half day',
    poster: { name: 'Aunty Faye', rating: 4.7, jobsPosted: 9 }
  }
]

export const currentUser = {
  name: 'John Worker',
  memberSince: 2024,
  jobsCompleted: 47,
  rating: 4.9,
  earned: 3240,
  balance: 430,
  badges: [
    { category: 'Gardening', jobs: 33 },
    { category: 'Cleaning', jobs: 15 },
    { category: 'Delivery', jobs: 7 },
    { category: 'Repairs', jobs: 2 }
  ],
  reviews: [
    { author: 'Nomsa D.', rating: 5, comment: 'Arrived on time and did a great job with the garden.' },
    { author: 'Buhle M.', rating: 5, comment: 'Very patient with the kids, will book again.' }
  ]
}

export const transactions = [
  { id: 't1', label: 'Garden Cleanup', date: 'May 18, 2026', amount: 150 },
  { id: 't2', label: 'Platform Fee', date: 'May 18, 2026', amount: -15 },
  { id: 't3', label: 'Furniture Delivery', date: 'May 17, 2026', amount: 200 }
]
