require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Destination = require('../models/Destination');
const Trip = require('../models/Trip');
const Itinerary = require('../models/Itinerary');
const Booking = require('../models/Booking');
const Expense = require('../models/Expense');
const Review = require('../models/Review');
const Favorite = require('../models/Favorite');
const ContactMessage = require('../models/ContactMessage');

const destinationsData = [
  {
    name: 'Varanasi',
    country: 'India',
    state: 'Uttar Pradesh',
    city: 'Varanasi',
    coordinates: { lat: 25.3176, lng: 82.9739 },
    category: ['spiritual', 'heritage'],
    shortDescription: 'One of the world\'s oldest living cities, situated on the sacred banks of the Ganges River.',
    description: 'Varanasi, also known as Kashi and Benares, is a city on the banks of the river Ganges in Uttar Pradesh, India. Regarded as the spiritual capital of India, it draws Hindu pilgrims who bathe in the sacred waters of the Ganges River and perform spiritual rites. Along the city\'s winding streets are some 2,000 temples, including Kashi Vishwanath, the "Golden Temple," dedicated to the Hindu god Shiva.',
    climate: 'Subtropical with hot summers and pleasantly cool winters.',
    language: 'Hindi, Bhojpuri, English',
    currency: 'INR',
    bestSeason: {
      from: 'October',
      to: 'March',
      description: 'Pleasant winter months ideal for ghat walks, boat rides, and attending evening Ganga Aarti.',
    },
    estimatedDailyCost: { budget: 1500, standard: 3500, luxury: 8500 },
    images: [
      { url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80', caption: 'Evening Ganga Aarti at Dashashwamedh Ghat', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=1200&q=80', caption: 'Sunrise Boat Ride on the Holy Ganges' }
    ],
    attractions: [
      { name: 'Dashashwamedh Ghat', type: 'spiritual', duration: '2 hours', estimatedCost: 100, coordinates: { lat: 25.3076, lng: 83.0104 }, description: 'The main and most vibrant ghat where the world-renowned evening Ganga Aarti takes place daily.' },
      { name: 'Kashi Vishwanath Temple', type: 'temple', duration: '2.5 hours', estimatedCost: 300, coordinates: { lat: 25.3109, lng: 83.0107 }, description: 'One of the twelve sacred Jyotirlingas, known for its golden spires and deep devotional energy.' },
      { name: 'Sarnath Deer Park', type: 'monument', duration: '3 hours', estimatedCost: 200, coordinates: { lat: 25.3811, lng: 83.0214 }, description: 'The historic Buddhist deer park where Gautama Buddha taught his first sermon.' }
    ],
    averageRating: 4.8,
    reviewCount: 42,
    isFeatured: true,
    tags: ['Ghats', 'Spiritual', 'Temple', 'Heritage', 'Ganges']
  },
  {
    name: 'Jaipur',
    country: 'India',
    state: 'Rajasthan',
    city: 'Jaipur',
    coordinates: { lat: 26.9124, lng: 75.7873 },
    category: ['heritage', 'city'],
    shortDescription: 'The royal Pink City of palaces, majestic hilltop forts, and vibrant gemstone bazaars.',
    description: 'Jaipur, the capital of Rajasthan, is known as the Pink City due to the trademark terracotta pink color of its historic buildings. Founded in 1727 by Maharaja Jai Singh II, the city presents a masterclass in ancient Indian architectural planning, royal Rajput palaces, formidable hilltop fortresses, and bustling historic bazaars full of block-print textiles and artisanal jewelry.',
    climate: 'Semi-arid with warm days and cool winter nights.',
    language: 'Hindi, Rajasthani, English',
    currency: 'INR',
    bestSeason: {
      from: 'October',
      to: 'March',
      description: 'Pleasant temperatures perfect for touring hill forts and enjoying open-air royal palace courtyards.',
    },
    estimatedDailyCost: { budget: 1800, standard: 4500, luxury: 11000 },
    images: [
      { url: 'https://images.unsplash.com/photo-1603288967926-2a7f51e06c74?auto=format&fit=crop&w=1200&q=80', caption: 'Hawa Mahal - Palace of Winds', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80', caption: 'Amer Fort courtyards and ramparts' }
    ],
    attractions: [
      { name: 'Amber Palace & Fort', type: 'monument', duration: '3.5 hours', estimatedCost: 500, coordinates: { lat: 26.9855, lng: 75.8513 }, description: 'Marvelous sandstone and marble fort overlooking Maota Lake, famous for the Sheesh Mahal (Mirror Palace).' },
      { name: 'Hawa Mahal', type: 'monument', duration: '1.5 hours', estimatedCost: 200, coordinates: { lat: 26.9239, lng: 75.8267 }, description: 'Iconic five-story facade with 953 honeycomb windows designed for royal court ladies.' },
      { name: 'City Palace', type: 'museum', duration: '2.5 hours', estimatedCost: 700, coordinates: { lat: 26.9258, lng: 75.8237 }, description: 'Stunning royal residence showcasing Rajput and Mughal courtyards, textiles, and armor.' }
    ],
    averageRating: 4.7,
    reviewCount: 56,
    isFeatured: true,
    tags: ['Palaces', 'Forts', 'Rajputana', 'Culture', 'Shopping']
  },
  {
    name: 'Agra',
    country: 'India',
    state: 'Uttar Pradesh',
    city: 'Agra',
    coordinates: { lat: 27.1767, lng: 78.0081 },
    category: ['heritage', 'monument'],
    shortDescription: 'Home to the immortal Taj Mahal, Agra Fort, and masterpieces of Mughal art and architecture.',
    description: 'Agra sits on the banks of the Yamuna River and represents the architectural zenith of the Mughal Empire. Famous globally for the Taj Mahal, an ivory-white marble mausoleum commissioned by Shah Jahan in 1632 in memory of his favorite wife Mumtaz Mahal, Agra is also home to the UNESCO World Heritage monuments of Agra Fort and the abandoned royal citadel of Fatehpur Sikri.',
    climate: 'Warm continental with humid monsoon season.',
    language: 'Hindi, Urdu, English',
    currency: 'INR',
    bestSeason: {
      from: 'October',
      to: 'March',
      description: 'Crisp morning air and mild sunshine provide the best lighting and comfort for monument visits.',
    },
    estimatedDailyCost: { budget: 1600, standard: 4000, luxury: 9500 },
    images: [
      { url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80', caption: 'The Taj Mahal at sunrise over the reflecting pool', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80', caption: 'Red sandstone towers of Agra Fort' }
    ],
    attractions: [
      { name: 'Taj Mahal', type: 'monument', duration: '3 hours', estimatedCost: 1100, coordinates: { lat: 27.1751, lng: 78.0421 }, description: 'One of the Seven Wonders of the World, constructed entirely of pure Makrana white marble.' },
      { name: 'Agra Fort', type: 'monument', duration: '2.5 hours', estimatedCost: 650, coordinates: { lat: 27.1795, lng: 78.0211 }, description: 'Massive red sandstone fortification that served as the primary residence of Mughal emperors until 1638.' },
      { name: 'Mehtab Bagh', type: 'park', duration: '1.5 hours', estimatedCost: 300, coordinates: { lat: 27.1800, lng: 78.0450 }, description: 'Charbagh garden complex across the river offering breathtaking sunset vistas of the Taj Mahal.' }
    ],
    averageRating: 4.9,
    reviewCount: 88,
    isFeatured: true,
    tags: ['Taj Mahal', 'Mughal', 'Wonder', 'Architecture', 'History']
  },
  {
    name: 'Goa',
    country: 'India',
    state: 'Goa',
    city: 'Panaji',
    coordinates: { lat: 15.2993, lng: 74.1240 },
    category: ['beach', 'relaxation', 'food'],
    shortDescription: 'Golden sand coastlines, Portuguese colonial architecture, seafood shacks, and tropical sunsets.',
    description: 'Goa is India\'s coastal paradise along the Arabian Sea. Renowned for its relaxed susegad lifestyle, sun-kissed beaches from Arambol down to Palolem, whitewashed 16th-century Portuguese churches in Old Goa, spice plantations, and vibrant beach shack culture serving fresh seafood curries and feni.',
    climate: 'Tropical with warm sea breezes year-round.',
    language: 'Konkani, Marathi, English, Hindi',
    currency: 'INR',
    bestSeason: {
      from: 'November',
      to: 'February',
      description: 'Dry, breezy beach weather with lively night markets and water sports active across both North and South Goa.',
    },
    estimatedDailyCost: { budget: 2000, standard: 5000, luxury: 12500 },
    images: [
      { url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80', caption: 'Sunlight filtering through palm trees on Palolem Beach', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1587922546307-776227941871?auto=format&fit=crop&w=1200&q=80', caption: 'Basilica of Bom Jesus in Old Goa' }
    ],
    attractions: [
      { name: 'Palolem Beach', type: 'beach', duration: '4 hours', estimatedCost: 200, coordinates: { lat: 15.0100, lng: 74.0232 }, description: 'Crescent-shaped white sand cove bordered by coconut palms, renowned for calm swimming waters.' },
      { name: 'Basilica of Bom Jesus', type: 'temple', duration: '1.5 hours', estimatedCost: 50, coordinates: { lat: 15.5009, lng: 73.9116 }, description: 'UNESCO World Heritage Catholic basilica containing the mortal remains of Saint Francis Xavier.' },
      { name: 'Dudhsagar Waterfalls', type: 'adventure', duration: '5 hours', estimatedCost: 1500, coordinates: { lat: 15.3144, lng: 74.3143 }, description: 'Four-tiered sea of milk waterfall crashing down 310 meters on the Mandovi River.' }
    ],
    averageRating: 4.8,
    reviewCount: 94,
    isFeatured: true,
    tags: ['Beaches', 'Portuguese', 'Seafood', 'Nightlife', 'Relaxation']
  },
  {
    name: 'Manali',
    country: 'India',
    state: 'Himachal Pradesh',
    city: 'Manali',
    coordinates: { lat: 32.2432, lng: 77.1892 },
    category: ['mountain', 'adventure'],
    shortDescription: 'High-altitude Himalayan valley of pine forests, snow-clad mountain passes, and adventure trails.',
    description: 'Manali is a high-altitude Himalayan resort town in Himachal Pradesh set on the Beas River. It\'s a gateway for skiing in Solang Valley, trekking in Parvati Valley, and mountaineering over the 3,978 m Rohtang Pass. Surrounded by towering deodar cedar forests and snow peaks, Manali blends alpine beauty with Himalayan spirituality.',
    climate: 'Alpine climate with heavy winter snowfall and crisp summers.',
    language: 'Hindi, Pahari, English',
    currency: 'INR',
    bestSeason: {
      from: 'March',
      to: 'June',
      description: 'Pleasant daytime trekking climate with blooming apple orchards, or December-February for winter snow sports.',
    },
    estimatedDailyCost: { budget: 1700, standard: 4200, luxury: 10000 },
    images: [
      { url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80', caption: 'Snow-capped peaks towering over Solang Valley', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=1200&q=80', caption: 'Pine forests and rushing mountain waters of the Beas River' }
    ],
    attractions: [
      { name: 'Solang Valley', type: 'adventure', duration: '4 hours', estimatedCost: 1200, coordinates: { lat: 32.3166, lng: 77.1575 }, description: 'High-energy valley renowned for paragliding, zorbing, quad biking, and winter skiing.' },
      { name: 'Hadimba Devi Temple', type: 'temple', duration: '1.5 hours', estimatedCost: 50, coordinates: { lat: 32.2483, lng: 77.1706 }, description: 'Four-tiered wooden pagoda temple built in 1553 set amidst a dense deodar forest sanctuary.' },
      { name: 'Rohtang Pass Viewpoint', type: 'adventure', duration: '6 hours', estimatedCost: 1500, coordinates: { lat: 32.3720, lng: 77.2466 }, description: 'Spectacular mountain pass connecting Kullu with the arid mountain deserts of Lahaul and Spiti.' }
    ],
    averageRating: 4.7,
    reviewCount: 65,
    isFeatured: true,
    tags: ['Snow', 'Himalayas', 'Paragliding', 'Valleys', 'Trekking']
  },
  {
    name: 'Shimla',
    country: 'India',
    state: 'Himachal Pradesh',
    city: 'Shimla',
    coordinates: { lat: 31.1048, lng: 77.1734 },
    category: ['mountain', 'heritage'],
    shortDescription: 'The Queen of Hills and historic summer capital of British India with neo-Gothic architecture.',
    description: 'Shimla is the capital of Himachal Pradesh. In 1864, it was declared the summer capital of British India. The town retained this heritage with its pedestrianized Mall Road, Viceregal Lodge, Christ Church, and the UNESCO heritage Kalka-Shimla Toy Train climbing through 102 mountain tunnels.',
    climate: 'Cool temperate climate with snowy winters.',
    language: 'Hindi, Pahari, English',
    currency: 'INR',
    bestSeason: {
      from: 'March',
      to: 'June',
      description: 'Comfortable mountain weather escaping the plains heat, or December for winter snowfall.',
    },
    estimatedDailyCost: { budget: 1600, standard: 3800, luxury: 9000 },
    images: [
      { url: 'https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&w=1200&q=80', caption: 'The Ridge and historic Christ Church in Shimla', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1200&q=80', caption: 'Colonial rooftops perched on mountain hillsides' }
    ],
    attractions: [
      { name: 'The Ridge & Mall Road', type: 'park', duration: '2.5 hours', estimatedCost: 0, coordinates: { lat: 31.1048, lng: 77.1734 }, description: 'Open public square with panoramic Himalayan vistas, cultural activities, and heritage shopping.' },
      { name: 'Jakhoo Temple', type: 'temple', duration: '2 hours', estimatedCost: 250, coordinates: { lat: 31.1009, lng: 77.1856 }, description: 'Highest point in Shimla dedicated to Lord Hanuman, featuring a towering 108-foot statue.' },
      { name: 'Viceregal Lodge', type: 'museum', duration: '2 hours', estimatedCost: 200, coordinates: { lat: 31.1030, lng: 77.1425 }, description: 'Magnificent Scottish baronial building where historical treaties shaping modern India were negotiated.' }
    ],
    averageRating: 4.6,
    reviewCount: 38,
    isFeatured: true,
    tags: ['Colonial', 'Toy Train', 'Mall Road', 'Snow', 'Hills']
  },
  {
    name: 'Rishikesh',
    country: 'India',
    state: 'Uttarakhand',
    city: 'Rishikesh',
    coordinates: { lat: 30.0869, lng: 78.2676 },
    category: ['adventure', 'spiritual'],
    shortDescription: 'The Yoga Capital of the World and premier whitewater rafting hub at the Himalayan foothills.',
    description: 'Rishikesh sits at the foothills of the Garhwal Himalayas where the sacred river Ganges descends into the northern plains. Famed internationally since the Beatles stayed at Maharishi Mahesh Yogi\'s ashram in 1968, Rishikesh is revered as the global epicenter for yoga, meditation, Ayurvedic wellness, and whitewater rafting down turbulent Himalayan river rapids.',
    climate: 'Subtropical highland with refreshing mountain breezes.',
    language: 'Hindi, Garhwali, English',
    currency: 'INR',
    bestSeason: {
      from: 'September',
      to: 'April',
      description: 'Ideal water flow for rafting and pleasant temperatures for outdoor yoga and ashram stays.',
    },
    estimatedDailyCost: { budget: 1400, standard: 3200, luxury: 8000 },
    images: [
      { url: 'https://images.unsplash.com/photo-1598977123418-454555aa1626?auto=format&fit=crop&w=1200&q=80', caption: 'Suspension bridge over the turquoise waters of the Ganges', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80', caption: 'Morning yoga and meditation by the river banks' }
    ],
    attractions: [
      { name: 'Ganges River Rafting', type: 'adventure', duration: '3.5 hours', estimatedCost: 900, coordinates: { lat: 30.1200, lng: 78.3200 }, description: 'Thrilling grade III and IV whitewater rapids from Shivpuri down to Lakshman Jhula.' },
      { name: 'Triveni Ghat Evening Aarti', type: 'spiritual', duration: '2 hours', estimatedCost: 50, coordinates: { lat: 30.0950, lng: 78.2930 }, description: 'Devotional congregation of floating butter lamps, conch shells, and Vedic chants.' },
      { name: 'Beatles Ashram (Chaurasi Kutia)', type: 'monument', duration: '2 hours', estimatedCost: 150, coordinates: { lat: 30.1150, lng: 78.3140 }, description: 'Historic meditation center nestled inside Rajaji Tiger Reserve with striking murals.' }
    ],
    averageRating: 4.8,
    reviewCount: 47,
    isFeatured: false,
    tags: ['Yoga', 'Rafting', 'Ashrams', 'Ganges', 'Wellness']
  },
  {
    name: 'Udaipur',
    country: 'India',
    state: 'Rajasthan',
    city: 'Udaipur',
    coordinates: { lat: 24.5854, lng: 73.7125 },
    category: ['heritage', 'city'],
    shortDescription: 'The romantic City of Lakes crowned by shimmering palaces and royal Mewar heritage.',
    description: 'Often called the Venice of the East, Udaipur is set around a series of artificial lakes in southern Rajasthan. Lake Pichola reflects the towering marble facade of the City Palace, alongside the floating Lake Palace (Taj Lake Palace). The capital of the historic Kingdom of Mewar, Udaipur is celebrated for its miniature paintings, royal architecture, and sunset boat cruises.',
    climate: 'Hot semi-arid climate with pleasant winter evenings.',
    language: 'Hindi, Mewari, English',
    currency: 'INR',
    bestSeason: {
      from: 'October',
      to: 'March',
      description: 'Lakes are full and weather is mild for romantic boat cruises and rooftop dining.',
    },
    estimatedDailyCost: { budget: 1900, standard: 4800, luxury: 14000 },
    images: [
      { url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80', caption: 'City Palace overlooking the waters of Lake Pichola', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=1200&q=80', caption: 'Sunset boat cruise past Jag Mandir Island' }
    ],
    attractions: [
      { name: 'Udaipur City Palace', type: 'museum', duration: '3.5 hours', estimatedCost: 400, coordinates: { lat: 24.5764, lng: 73.6835 }, description: 'Rajasthan\'s largest palace complex featuring exquisite mirror-work, courtyards, and gardens.' },
      { name: 'Lake Pichola Boat Cruise', type: 'adventure', duration: '1.5 hours', estimatedCost: 550, coordinates: { lat: 24.5750, lng: 73.6790 }, description: 'Peaceful boat ride giving panoramic views of royal ghats and Jag Mandir island palace.' },
      { name: 'Saheliyon-ki-Bari', type: 'park', duration: '1 hour', estimatedCost: 100, coordinates: { lat: 24.6040, lng: 73.6860 }, description: 'Royal courtyard with lush marble fountains, lotus pools, and sculpted pavilion kiosks.' }
    ],
    averageRating: 4.9,
    reviewCount: 62,
    isFeatured: true,
    tags: ['Lakes', 'Romance', 'Palaces', 'Mewar', 'Sunsets']
  },
  {
    name: 'Kerala Backwaters',
    country: 'India',
    state: 'Kerala',
    city: 'Alappuzha (Alleppey)',
    coordinates: { lat: 9.4981, lng: 76.3388 },
    category: ['nature', 'relaxation'],
    shortDescription: 'Serene network of interconnected canals, lagoons, and traditional thatched kettuvallam houseboats.',
    description: 'The Kerala Backwaters are a labyrinthine chain of brackish lagoons, lakes, and canals running parallel to the Arabian Sea coast. Alappuzha, the Venice of the East, is the hub for traditional kettuvallam (thatched roof wooden houseboats) drifting through emerald palm-fringed channels, passing paddy fields below sea level, and serving freshly prepared spicy Karimeen fish.',
    climate: 'Tropical wet with lush coastal foliage.',
    language: 'Malayalam, English, Hindi',
    currency: 'INR',
    bestSeason: {
      from: 'October',
      to: 'February',
      description: 'Pleasant humidity, calm waters, and migrating birds across Vembanad Lake.',
    },
    estimatedDailyCost: { budget: 2200, standard: 5500, luxury: 15000 },
    images: [
      { url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80', caption: 'Traditional kettuvallam houseboat cruising emerald backwaters', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80', caption: 'Sunset over coconut groves and serene canal banks' }
    ],
    attractions: [
      { name: 'Overnight Houseboat Cruise', type: 'adventure', duration: '18 hours', estimatedCost: 6500, coordinates: { lat: 9.5010, lng: 76.3450 }, description: 'Private traditional houseboat voyage with onboard chef cooking authentic Malabar meals.' },
      { name: 'Marari Beach', type: 'beach', duration: '3 hours', estimatedCost: 0, coordinates: { lat: 9.5960, lng: 76.2990 }, description: 'Quiet, underdeveloped palm-fringed shoreline ideal for peaceful strolls and Ayurvedic spas.' },
      { name: 'Vembanad Lake Kayaking', type: 'adventure', duration: '2.5 hours', estimatedCost: 1200, coordinates: { lat: 9.5800, lng: 76.3900 }, description: 'Narrow-canal canoe and kayak exploration into village life and bird sanctuaries.' }
    ],
    averageRating: 4.8,
    reviewCount: 51,
    isFeatured: true,
    tags: ['Houseboat', 'Backwaters', 'Ayurveda', 'Nature', 'Lagoons']
  },
  {
    name: 'Darjeeling',
    country: 'India',
    state: 'West Bengal',
    city: 'Darjeeling',
    coordinates: { lat: 27.0410, lng: 88.2663 },
    category: ['mountain', 'nature'],
    shortDescription: 'Rolling emerald tea plantations overlooked by the mighty Kangchenjunga snow peaks.',
    description: 'Darjeeling is a hill station in West Bengal in the Lesser Himalayas at an elevation of 2,042 m. Noted for its world-celebrated orthodox black tea industry, panoramic views of Kangchenjunga (the world\'s third-highest peak), Buddhist monasteries, and the UNESCO World Heritage Darjeeling Himalayan Railway (the "Toy Train").',
    climate: 'Temperate alpine with mist-shrouded green hillsides.',
    language: 'Nepali, Bengali, Hindi, English',
    currency: 'INR',
    bestSeason: {
      from: 'March',
      to: 'May',
      description: 'Clear skies revealing the Himalayan snow crests alongside lush fresh tea flushes.',
    },
    estimatedDailyCost: { budget: 1600, standard: 3900, luxury: 9200 },
    images: [
      { url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80', caption: 'Tea gardens sprawling down the Himalayan slopes of Darjeeling', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=1200&q=80', caption: 'Sunrise illuminating Mount Kangchenjunga from Tiger Hill' }
    ],
    attractions: [
      { name: 'Tiger Hill Sunrise Point', type: 'adventure', duration: '2.5 hours', estimatedCost: 150, coordinates: { lat: 27.0000, lng: 88.2800 }, description: 'Watch the first rays of morning light turn the twin summits of Kangchenjunga pink and gold.' },
      { name: 'Happy Valley Tea Estate', type: 'park', duration: '2 hours', estimatedCost: 200, coordinates: { lat: 27.0500, lng: 88.2600 }, description: 'Historic 1854 tea plantation offering guided factory tasting tours and pluckers in action.' },
      { name: 'Ghoom Monastery', type: 'temple', duration: '1.5 hours', estimatedCost: 50, coordinates: { lat: 27.0120, lng: 88.2580 }, description: 'One of the oldest Tibetan Buddhist monasteries housing a 15-foot statue of Maitreya Buddha.' }
    ],
    averageRating: 4.7,
    reviewCount: 39,
    isFeatured: false,
    tags: ['Tea', 'Kangchenjunga', 'Toy Train', 'Monastery', 'Himalayas']
  },
  {
    name: 'Hampi',
    country: 'India',
    state: 'Karnataka',
    city: 'Hampi',
    coordinates: { lat: 15.3350, lng: 76.4600 },
    category: ['heritage', 'adventure'],
    shortDescription: 'Surreal boulder-strewn landscape sheltering the monumental ruins of the Vijayanagara Empire.',
    description: 'Hampi is a UNESCO World Heritage Site in east-central Karnataka. It was the capital of the wealthy Vijayanagara Empire in the 14th century. Surrounded by surreal granite boulders and the Tungabhadra River, Hampi contains over 1,600 surviving monuments, including Dravidian temples, royal pavilions, pillared stone halls, and the legendary stone chariot.',
    climate: 'Tropical semi-arid with warm sunshine.',
    language: 'Kannada, Telugu, Hindi, English',
    currency: 'INR',
    bestSeason: {
      from: 'November',
      to: 'February',
      description: 'Pleasant winter breeze allowing full days of bicycle and foot exploration among the boulder ruins.',
    },
    estimatedDailyCost: { budget: 1300, standard: 3000, luxury: 7500 },
    images: [
      { url: 'https://images.unsplash.com/photo-1600100397608-f010f443b740?auto=format&fit=crop&w=1200&q=80', caption: 'The monolithic Stone Chariot at Vittala Temple', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80', caption: 'Sunset over granite boulders and Virupaksha Temple gopuram' }
    ],
    attractions: [
      { name: 'Virupaksha Temple', type: 'temple', duration: '2 hours', estimatedCost: 100, coordinates: { lat: 15.3353, lng: 76.4600 }, description: 'Seventh-century Shiva temple that has remained actively worshipped since the Vijayanagara era.' },
      { name: 'Vittala Temple & Stone Chariot', type: 'monument', duration: '3 hours', estimatedCost: 500, coordinates: { lat: 15.3420, lng: 76.4750 }, description: 'Famous for its sculpted musical pillars and the iconic stone shrine carved like a processional chariot.' },
      { name: 'Matanga Hill Sunset Trek', type: 'adventure', duration: '2 hours', estimatedCost: 0, coordinates: { lat: 15.3320, lng: 76.4660 }, description: 'The highest vantage point offering a 360-degree panorama of Hampi\'s ancient boulder horizon.' }
    ],
    averageRating: 4.8,
    reviewCount: 33,
    isFeatured: false,
    tags: ['Ruins', 'UNESCO', 'Vijayanagara', 'Boulders', 'Heritage']
  },
  {
    name: 'Leh-Ladakh',
    country: 'India',
    state: 'Ladakh',
    city: 'Leh',
    coordinates: { lat: 34.1526, lng: 77.5771 },
    category: ['adventure', 'mountain'],
    shortDescription: 'High-altitude cold desert of turquoise alpine lakes, dramatic mountain passes, and ancient gompas.',
    description: 'Leh-Ladakh is a high-altitude desert region in northernmost India. Famous for dramatic landscapes surrounded by the Karakoram and Great Himalayan ranges, Ladakh offers high motorable passes like Khardung La, tranquil monasteries perched on cliffs like Thiksey and Hemis, and the shimmering blue waters of Pangong Tso extending into Tibet.',
    climate: 'Cold arid desert with extreme solar radiation by day and sub-zero nights.',
    language: 'Ladakhi, Tibetan, Hindi, English',
    currency: 'INR',
    bestSeason: {
      from: 'June',
      to: 'September',
      description: 'Mountain passes are open for road trips and weather allows camping near Pangong Lake.',
    },
    estimatedDailyCost: { budget: 2500, standard: 6000, luxury: 14000 },
    images: [
      { url: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80', caption: 'The deep blue waters of Pangong Tso bordered by barren mountains', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=1200&q=80', caption: 'Thiksey Monastery perched majestically on a hill' }
    ],
    attractions: [
      { name: 'Pangong Tso Lake', type: 'adventure', duration: '6 hours', estimatedCost: 2000, coordinates: { lat: 33.7595, lng: 78.6674 }, description: 'Endorheic lake at 4,225 meters known for shifting colors from azure to emerald.' },
      { name: 'Thiksey Gompa', type: 'temple', duration: '2.5 hours', estimatedCost: 100, coordinates: { lat: 34.0580, lng: 77.6660 }, description: 'Twelve-story monastery complex resembling the Potala Palace in Lhasa, Tibet.' },
      { name: 'Nubra Valley & Hunder Sand Dunes', type: 'adventure', duration: '8 hours', estimatedCost: 2500, coordinates: { lat: 34.6860, lng: 77.5670 }, description: 'High-altitude desert valley famous for double-humped Bactrian camel safaris.' }
    ],
    averageRating: 4.9,
    reviewCount: 74,
    isFeatured: true,
    tags: ['Ladakh', 'Lakes', 'Passes', 'Biking', 'Adventure']
  },
  {
    name: 'Khajuraho',
    country: 'India',
    state: 'Madhya Pradesh',
    city: 'Khajuraho',
    coordinates: { lat: 24.8318, lng: 79.9199 },
    category: ['heritage', 'spiritual'],
    shortDescription: 'Masterful medieval sandstone temple architecture renowned for exquisite erotic and celestial sculptures.',
    description: 'The Khajuraho Group of Monuments are UNESCO-listed Hindu and Jain temples built between 950 and 1050 CE by the Chandela dynasty. Known for nagara-style architectural symbolism and intricate stone carvings depicting celestial musicians, warriors, daily medieval Indian life, and romantic motifs.',
    climate: 'Humid subtropical with warm sunny winters.',
    language: 'Hindi, Bundeli, English',
    currency: 'INR',
    bestSeason: {
      from: 'October',
      to: 'March',
      description: 'Pleasant daytime weather for viewing the intricate carvings in detail, plus the annual Dance Festival in February.',
    },
    estimatedDailyCost: { budget: 1400, standard: 3400, luxury: 8000 },
    images: [
      { url: 'https://images.unsplash.com/photo-1606298855672-3efb63017be8?auto=format&fit=crop&w=1200&q=80', caption: 'Kandariya Mahadeva Temple spires glowing in golden sunlight', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80', caption: 'Intricate sandstone reliefs of the Western Group of Temples' }
    ],
    attractions: [
      { name: 'Kandariya Mahadeva Temple', type: 'temple', duration: '2 hours', estimatedCost: 500, coordinates: { lat: 24.8530, lng: 79.9190 }, description: 'The largest and most ornate Hindu temple at Khajuraho, decorated with over 800 detailed stone statues.' },
      { name: 'Western Group Sound & Light Show', type: 'monument', duration: '1 hour', estimatedCost: 350, coordinates: { lat: 24.8510, lng: 79.9200 }, description: 'Evening narrative in the voice of Amitabh Bachchan narrating the history of the Chandela dynasty.' },
      { name: 'Raneh Falls & Canyon', type: 'adventure', duration: '3 hours', estimatedCost: 400, coordinates: { lat: 24.8900, lng: 79.8300 }, description: 'Spectacular natural canyon of multi-colored crystalline granite on the Ken River.' }
    ],
    averageRating: 4.6,
    reviewCount: 26,
    isFeatured: false,
    tags: ['Sculpture', 'UNESCO', 'Temples', 'Chandela', 'History']
  },
  {
    name: 'Coorg',
    country: 'India',
    state: 'Karnataka',
    city: 'Madikeri',
    coordinates: { lat: 12.3375, lng: 75.8069 },
    category: ['nature', 'relaxation'],
    shortDescription: 'The Scotland of India covered in lush coffee plantations, spice gardens, and cascading waterfalls.',
    description: 'Coorg, officially Kodagu, is a rural district in southwest Karnataka nestled in the Western Ghats. Known for its misty hills, sprawling robusta and arabica coffee plantations, cardamom groves, Tibetan settlement at Bylakuppe, and rich warrior culture of the Kodava community.',
    climate: 'Highland tropical with cool mists and heavy monsoon rains.',
    language: 'Kodava, Kannada, English, Hindi',
    currency: 'INR',
    bestSeason: {
      from: 'October',
      to: 'March',
      description: 'Clear cool weather with aroma of blooming white coffee blossoms across the estates.',
    },
    estimatedDailyCost: { budget: 1700, standard: 4200, luxury: 10500 },
    images: [
      { url: 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=1200&q=80', caption: 'Lush coffee plantation enveloped in morning mountain mist', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80', caption: 'Abbey Falls cascading through deep rainforest canopy' }
    ],
    attractions: [
      { name: 'Abbey Falls', type: 'park', duration: '2 hours', estimatedCost: 100, coordinates: { lat: 12.4550, lng: 75.7190 }, description: 'Roaring waterfall framed by private coffee bushes and fragrant spice trees.' },
      { name: 'Namdroling Golden Temple (Bylakuppe)', type: 'temple', duration: '2 hours', estimatedCost: 50, coordinates: { lat: 12.4280, lng: 75.9660 }, description: 'Largest Tibetan Buddhist teaching center in southern India with three 40-foot golden Buddha statues.' },
      { name: 'Raja\'s Seat Sunset Garden', type: 'park', duration: '1.5 hours', estimatedCost: 50, coordinates: { lat: 12.4200, lng: 75.7360 }, description: 'Historic seasonal garden where the Kings of Kodagu watched crimson valley sunsets.' }
    ],
    averageRating: 4.7,
    reviewCount: 36,
    isFeatured: false,
    tags: ['Coffee', 'Mist', 'Waterfalls', 'Plantations', 'Rainforest']
  },
  {
    name: 'Ranthambore',
    country: 'India',
    state: 'Rajasthan',
    city: 'Sawai Madhopur',
    coordinates: { lat: 26.0173, lng: 76.5026 },
    category: ['wildlife', 'adventure'],
    shortDescription: 'Premier national tiger reserve crowned by a 10th-century clifftop fortress.',
    description: 'Ranthambore National Park is one of the biggest and most renowned national parks in northern India. Located in the Sawai Madhopur district of southeastern Rajasthan, it is known worldwide as the best sanctuary to spot majestic Bengal tigers roaming among the ruins of ancient hunting palaces, chhatris, and lake shores.',
    climate: 'Dry deciduous forest with hot summers and crisp winters.',
    language: 'Hindi, Rajasthani, English',
    currency: 'INR',
    bestSeason: {
      from: 'October',
      to: 'April',
      description: 'Park is open and tigers are frequently sighted around lakes and waterholes.',
    },
    estimatedDailyCost: { budget: 2400, standard: 6500, luxury: 18000 },
    images: [
      { url: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=1200&q=80', caption: 'Royal Bengal Tiger resting near the jungle ruins', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80', caption: 'Ranthambore Fort walls rising high above the jungle canopy' }
    ],
    attractions: [
      { name: 'Jungle Tiger Safari (Zone 1-5)', type: 'wildlife', duration: '3.5 hours', estimatedCost: 1800, coordinates: { lat: 26.0200, lng: 76.5100 }, description: 'Guided open-top Gypsy or Canter safari tracking tiger pugmarks, leopards, and sambar deer.' },
      { name: 'Ranthambore Fort', type: 'monument', duration: '3 hours', estimatedCost: 100, coordinates: { lat: 26.0210, lng: 76.4530 }, description: 'UNESCO World Heritage hill fort built in 944 CE with panoramic park views and ancient stepwells.' },
      { name: 'Padam Talao Lake', type: 'wildlife', duration: '2 hours', estimatedCost: 0, coordinates: { lat: 26.0150, lng: 76.5200 }, description: 'Largest lake inside the park where tigers hunt along the water edge near the historic Jogi Mahal.' }
    ],
    averageRating: 4.8,
    reviewCount: 44,
    isFeatured: false,
    tags: ['Tigers', 'Safari', 'Fort', 'Wildlife', 'Jungle']
  }
];

async function seedDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tourist_itinerary';

  try {
    console.log('Connecting to MongoDB for seeding...');
    await mongoose.connect(uri);
    console.log('Connected to MongoDB successfully.');

    // 1. Clear existing collections
    console.log('Clearing old data collections...');
    await Promise.all([
      User.deleteMany({}),
      Destination.deleteMany({}),
      Trip.deleteMany({}),
      Itinerary.deleteMany({}),
      Booking.deleteMany({}),
      Expense.deleteMany({}),
      Review.deleteMany({}),
      Favorite.deleteMany({}),
      ContactMessage.deleteMany({})
    ]);

    // 2. Create Users
    console.log('Creating Admin and Demo Users...');
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const userPassword = await bcrypt.hash('User@123', 10);

    const adminUser = await User.create({
      name: 'Admin TravelCraft',
      email: 'admin@travelcraft.com',
      password: adminPassword,
      role: 'admin',
      bio: 'Lead System Administrator & Travel Curator',
      country: 'India',
      phone: '+919876543210'
    });

    const demoUser = await User.create({
      name: 'Aarav Sharma',
      email: 'user@travelcraft.com',
      password: userPassword,
      role: 'tourist',
      bio: 'Avid traveler and photography enthusiast exploring cultural India.',
      country: 'India',
      phone: '+919123456789'
    });

    console.log(`Users created: ${adminUser.email} (Admin), ${demoUser.email} (User)`);

    // 3. Create Destinations
    console.log(`Inserting ${destinationsData.length} Indian destinations...`);
    const createdDestinations = await Destination.insertMany(
      destinationsData.map((dest) => ({
        ...dest,
        createdBy: adminUser._id
      }))
    );
    console.log(`Successfully seeded ${createdDestinations.length} destinations.`);

    // 4. Create Sample Trips for Demo User
    const varanasi = createdDestinations.find((d) => d.name === 'Varanasi');
    const jaipur = createdDestinations.find((d) => d.name === 'Jaipur');
    const agra = createdDestinations.find((d) => d.name === 'Agra');
    const goa = createdDestinations.find((d) => d.name === 'Goa');

    const startDate1 = new Date();
    startDate1.setDate(startDate1.getDate() + 10);
    const endDate1 = new Date(startDate1);
    endDate1.setDate(startDate1.getDate() + 4);

    const trip1 = await Trip.create({
      title: 'Golden Triangle & Spiritual Heritage',
      description: 'A 5-day cultural expedition through the iconic monuments of Agra and the sacred ghats of Varanasi.',
      user: demoUser._id,
      destinations: [agra._id, varanasi._id],
      startDate: startDate1,
      endDate: endDate1,
      numberOfDays: 5,
      numberOfTravelers: 2,
      totalBudget: 45000,
      transportMode: 'train',
      travelStyle: 'couple',
      interests: ['history', 'spiritual', 'photography'],
      status: 'planned'
    });

    // 5. Create Daily Itineraries for Trip 1
    for (let day = 1; day <= 5; day++) {
      const dayDate = new Date(startDate1);
      dayDate.setDate(startDate1.getDate() + (day - 1));

      const isAgra = day <= 2;
      const currentDest = isAgra ? agra : varanasi;

      await Itinerary.create({
        trip: trip1._id,
        user: demoUser._id,
        day,
        date: dayDate,
        title: isAgra ? `Day ${day}: Marvels of Agra` : `Day ${day}: Spiritual Life in Varanasi`,
        notes: isAgra ? 'Early morning photography at monuments' : 'Evening Ganga Aarti boat ride reserved',
        activities: [
          {
            order: 1,
            title: isAgra ? 'Taj Mahal Sunrise Visit' : 'Morning Boat Ride on the Ganges',
            type: 'sightseeing',
            startTime: '06:00',
            endTime: '09:00',
            estimatedCost: 1100,
            attraction: { name: isAgra ? 'Taj Mahal' : 'Dashashwamedh Ghat' }
          },
          {
            order: 2,
            title: 'Authentic Local Breakfast & Refreshments',
            type: 'food',
            startTime: '09:30',
            endTime: '11:00',
            estimatedCost: 400
          },
          {
            order: 3,
            title: isAgra ? 'Agra Fort Guided Exploration' : 'Kashi Vishwanath Corridor Visit',
            type: 'sightseeing',
            startTime: '14:00',
            endTime: '17:00',
            estimatedCost: 650,
            attraction: { name: isAgra ? 'Agra Fort' : 'Kashi Vishwanath Temple' }
          }
        ]
      });
    }

    // 6. Create Sample Expenses for Trip 1
    await Expense.create([
      { trip: trip1._id, user: demoUser._id, category: 'transport', title: 'Express Train Tickets (Delhi - Agra)', amount: 2800, currency: 'INR', date: startDate1 },
      { trip: trip1._id, user: demoUser._id, category: 'accommodation', title: 'Heritage Haveli Hotel (2 nights)', amount: 7500, currency: 'INR', date: startDate1 },
      { trip: trip1._id, user: demoUser._id, category: 'sightseeing', title: 'Taj Mahal & Agra Fort entry passes', amount: 3500, currency: 'INR', date: startDate1 }
    ]);

    // 7. Create Sample Bookings for Trip 1
    await Booking.create([
      {
        trip: trip1._id,
        user: demoUser._id,
        type: 'accommodation',
        title: 'Radisson Blu Hotel Agra',
        provider: 'Booking.com',
        confirmationNumber: 'RB-AGRA-98421',
        startDate: startDate1,
        endDate: new Date(startDate1.getTime() + 2 * 24 * 60 * 60 * 1000),
        amount: 8200,
        currency: 'INR',
        status: 'confirmed'
      },
      {
        trip: trip1._id,
        user: demoUser._id,
        type: 'transport',
        title: 'Vande Bharat Express (Agra to Varanasi)',
        provider: 'IRCTC',
        confirmationNumber: 'PNR-2490184',
        startDate: new Date(startDate1.getTime() + 2 * 24 * 60 * 60 * 1000),
        amount: 3400,
        currency: 'INR',
        status: 'confirmed'
      }
    ]);

    // 8. Create Sample Reviews
    await Review.create([
      {
        user: demoUser._id,
        destination: jaipur._id,
        rating: 5,
        title: 'Unforgettable royal experience in the Pink City!',
        content: 'The architecture of Amer Fort and the sunset views from Nahargarh were the highlights of our trip. The local Rajasthani thali is a must-try.',
        travelType: 'couple',
        isApproved: true
      },
      {
        user: demoUser._id,
        destination: goa._id,
        rating: 5,
        title: 'Peaceful South Goa paradise',
        content: 'Palolem Beach was calm and scenic. Renting a scooter and driving through the Portuguese quarters was pure joy.',
        travelType: 'solo',
        isApproved: true
      }
    ]);

    // 9. Create Sample Favorite
    await Favorite.create({
      user: demoUser._id,
      destination: jaipur._id
    });

    console.log('Seeding completed successfully!');
    console.log('====================================================');
    console.log('  Admin credentials : admin@travelcraft.com / Admin@123');
    console.log('  Demo credentials  : user@travelcraft.com  / User@123');
    console.log('====================================================');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();
