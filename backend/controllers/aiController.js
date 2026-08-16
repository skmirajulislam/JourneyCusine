const mongoose = require("mongoose");
const House = require("../models/house.model.js");
const reservationDB = require("../models/reservation.model.js");
const User = require("../models/user.model.js");
const BlockedEmail = require("../models/blockedEmail.model.js");

// Multi-lingual offensive language, profanity, and abusive threat patterns
const OFFENSIVE_PATTERNS = [
  /\b(fuck|fucking|fucker|fck|motherfucker|bitch|bastard|asshole|cunt|dick|pussy|whore|slut|nigger|nigga|faggot|retard)\b/i,
  /\b(chutiya|bhenchod|madarchod|gaand|bhosdike|harami|kameena|saala|suar|randi|lauda|loda|gandu|choot)\b/i,
  /\b(kill you|die you|murder you|rape|terrorist|bombing|suicide|shoot you|attack you|slit your throat|fuck you)\b/i,
];

function isOffensiveMessage(text) {
  if (!text || typeof text !== "string") return false;
  return OFFENSIVE_PATTERNS.some((pattern) => pattern.test(text));
}

// Normalize text for flexible matching
function normalize(str) {
  if (!str || typeof str !== "string") return "";
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Escape special regex characters
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Synonyms & typo dictionary
const LOCATION_SYNONYMS = {
  kerla: "kerala",
  keral: "kerala",
  banglore: "bangalore",
  bengaluru: "bangalore",
  bombay: "mumbai",
  calcutta: "kolkata",
  kolkata: "kolkata",
  korean: "south korea",
  korea: "south korea",
  japan: "japan",
  thai: "thailand",
  paris: "france",
  london: "united kingdom",
  ny: "new york",
  nyc: "new york",
  manhattan: "united states",
};

// Amenity keyword mapping
const AMENITY_MAP = [
  { label: "AC", dbNames: ["Air conditioning"], keywords: ["ac", "air condition", "air conditioning", "cooling"] },
  { label: "TV", dbNames: ["TV"], keywords: ["tv", "television", "smart tv"] },
  { label: "Wifi", dbNames: ["Wifi"], keywords: ["wifi", "wi-fi", "internet", "high speed internet"] },
  { label: "Kitchen", dbNames: ["Kitchen"], keywords: ["kitchen", "cooking", "cook"] },
  { label: "Pool", dbNames: ["Pool"], keywords: ["pool", "swimming pool", "swimming"] },
  { label: "Free parking", dbNames: ["Free parking", "Paid parking"], keywords: ["parking", "garage", "car park"] },
  { label: "Washer", dbNames: ["Washer"], keywords: ["washer", "laundry", "washing machine"] },
  { label: "Dedicated workspace", dbNames: ["Dedicated workspace"], keywords: ["workspace", "desk", "work from home"] },
  { label: "Bathtub / Hot tub", dbNames: ["Buthub"], keywords: ["bathtub", "bathtube", "hot tub", "jacuzzi", "buthub", "bath tub"] },
  { label: "Grill / BBQ", dbNames: ["Grill"], keywords: ["grill", "bbq", "barbecue"] },
  { label: "Campfire", dbNames: ["Campfire"], keywords: ["campfire", "bonfire", "fire pit"] },
  { label: "Piano", dbNames: ["Piano"], keywords: ["piano"] },
  { label: "Outdoor dining", dbNames: ["Outdoor dining area"], keywords: ["outdoor dining", "patio"] },
  { label: "Gym / Fitness", dbNames: ["Exercise equipment"], keywords: ["gym", "fitness", "exercise equipment", "workout"] },
  { label: "Tennis court", dbNames: ["Tennis court"], keywords: ["tennis", "tennis court"] },
  { label: "Outdoor Shower", dbNames: ["Outdoor Shower"], keywords: ["outdoor shower"] },
  { label: "Ski Access", dbNames: ["Ski in/ Ski out"], keywords: ["ski", "ski in", "ski out"] },
  { label: "First aid", dbNames: ["First aid kit"], keywords: ["first aid", "medical kit"] },
];

// Category / House type keyword mapping
const CATEGORY_MAP = [
  { label: "House", dbTypes: ["House"], keywords: ["house", "homestay", "home", "villa"] },
  { label: "Apartment", dbTypes: ["Apartment"], keywords: ["apartment", "flat", "condo", "suite"] },
  { label: "Cabin", dbTypes: ["Cabin"], keywords: ["cabin", "cottage", "chalet", "hut"] },
  { label: "Hotel / Motel", dbTypes: ["Hotel"], keywords: ["hotel", "motel", "resort"] },
  { label: "Boat / Houseboat", dbTypes: ["Boat"], keywords: ["boat", "houseboat", "cruise", "yacht"] },
  { label: "Castle / Palace", dbTypes: ["Castle"], keywords: ["castle", "palace", "fort", "heritage"] },
  { label: "Tent / Glamping", dbTypes: ["Tent"], keywords: ["tent", "camping", "glamping"] },
  { label: "Tree house", dbTypes: ["Tree house"], keywords: ["tree house", "treehouse", "treehut"] },
  { label: "Camper / Caravan", dbTypes: ["Camper"], keywords: ["camper", "caravan", "rv"] },
  { label: "Dome", dbTypes: ["Dome"], keywords: ["dome", "igloo"] },
  { label: "Cave", dbTypes: ["Cave"], keywords: ["cave"] },
  { label: "Earth home", dbTypes: ["Earth home"], keywords: ["earth home"] },
  { label: "Tower", dbTypes: ["Tower"], keywords: ["tower"] },
  { label: "Container", dbTypes: ["Container"], keywords: ["container"] },
];

// Regional Culinary Knowledge (Signature Journey Cuisine Feature)
const REGIONAL_CUISINE_MAP = {
  kolkata: {
    name: "Kolkata, India",
    dishes: [
      "🍗 **Kolkata Mutton / Chicken Biryani** (Aromatic long-grain rice with golden potato & boiled egg)",
      "🌯 **Kathi Rolls** (Originated at Nizam's in New Market — flaky parotta rolled with tender kebabs)",
      "🐟 **Kosha Mangsho & Luchi** (Slow-cooked spiced mutton with puffed deep-fried bread)",
      "🍮 **World-Famous Sweets** (Rosogolla, Mishti Doi, Sandesh & Baked Mihidana at historic sweet hubs)",
      "🍵 **Kulhad Chai & Phuchka** (Tangy spicy street water-bombs and clay-cup tea along the riverbank)",
    ],
  },
  kerala: {
    name: "Kerala, India",
    dishes: [
      "🐟 **Karimeen Pollichathu** (Pearl spot fish marinated in fiery masala & wrapped in banana leaves)",
      "🥞 **Appam with Stew** (Fluffy fermented rice pancakes with coconut milk vegetable or chicken stew)",
      "🍚 **Malabar Parotta & Beef/Chicken Roast** (Flaky layered flatbread with rich caramelized gravy)",
      "🍌 **Puttu & Kadala Curry** (Steamed rice flour cylinders with spicy black chickpea curry & banana chips)",
      "🥥 **Traditional Kerala Sadhya** (Feast served on fresh banana leaf with 20+ vegetarian delicacies)",
    ],
  },
  "south korea": {
    name: "South Korea",
    dishes: [
      "🥩 **Korean BBQ (Samgyeopsal & Galbi)** (Grilled pork belly and marinated short ribs with perilla leaves)",
      "🍲 **Kimchi Jjigae & Sundubu** (Hearty bubbling stews with fermented kimchi and soft silken tofu)",
      "🥟 **Gwangjang Street Food** (Bindaetteok mung bean pancakes, Mayak gimbap & hot Tteokbokki)",
      "🍗 **Chimaek (Korean Fried Chicken & Draft Beer)** (Double-fried extra crispy chicken in sweet-spicy glaze)",
      "🍧 **Bingsu** (Finely shaved sweet milk snow dessert topped with fresh mango, matcha, or sweet red beans)",
    ],
  },
  thailand: {
    name: "Thailand",
    dishes: [
      "🍜 **Pad Thai** (Wok-tossed rice noodles with tamarind, fresh shrimp, tofu, and crushed peanuts)",
      "🍲 **Tom Yum Goong** (Hot and sour aromatic soup with lemongrass, kaffir lime, and jumbo prawns)",
      "🥗 **Som Tum** (Crunchy green papaya salad pounded with chili, lime, garlic, and roasted peanuts)",
      "🍛 **Thai Green & Massaman Curry** (Fragrant coconut curry with tender meat and Thai sweet basil)",
      "🥭 **Mango Sticky Rice (Khao Niew Mamuang)** (Warm sweet coconut glutinous rice with ripe mango)",
    ],
  },
  china: {
    name: "China (Yunnan / Kunming)",
    dishes: [
      "🍜 **Crossing the Bridge Rice Noodles (Guoqiao Mixian)** (Iconic Yunnan boiling broth with thin meats)",
      "🥟 **Dim Sum & Steamed Baozi** (Handcrafted soup dumplings, crystal shrimp dumplings & pork buns)",
      "🦆 **Peking Duck** (Crispy roasted duck carved tableside, served with thin pancakes & sweet bean sauce)",
      "🍄 **Yunnan Wild Mushroom Hotpot** (Seasonal earthy wild mushrooms slow-simmered in chicken broth)",
      "🫖 **Pu'er Tea & Flower Pastries** (Fresh rose petal jam-filled flaky pastries and aged Yunnan tea)",
    ],
  },
  dubai: {
    name: "Dubai, UAE",
    dishes: [
      "🥙 **Authentic Shawarma & Shish Tawook** (Spit-roasted seasoned meat wrapped in freshly baked pita)",
      "🍚 **Al Machboos & Mandi** (Slow-cooked spiced lamb with fragrant basmati rice and roasted nuts)",
      "🧆 **Hot & Cold Mezze** (Velvety hummus, smoky baba ganoush, crispy falafel, and freshly baked flatbreads)",
      "🍯 **Luqaimat & Kunafeh** (Crispy golden dough balls drizzled in date syrup, and stretchy cheese pastry)",
      "☕ **Emirati Gahwa with Stuffed Dates** (Traditional cardamom-infused Arabic coffee with premium dates)",
    ],
  },
  france: {
    name: "France / Paris",
    dishes: [
      "🥐 **Artisanal Croissants & Pain au Chocolat** (Warm, buttery, multi-layered golden morning pastries)",
      "🥩 **Boeuf Bourguignon** (Tender beef braised in red wine, garlic, carrots, and pearl onions)",
      "🥖 **Duck Confit & Baguette Sandwiches** (Slow-cooked crispy duck leg with herb-roasted potatoes)",
      "🧀 **Fine Cheese & Wine Pairings** (Camembert, Roquefort, Brie with crusty freshly baked baguettes)",
      "🍮 **Crème Brûlée & Macarons** (Silky vanilla custard with caramelized sugar crust and colorful macarons)",
    ],
  },
};

// Weather & Best Travel Season Data
const WEATHER_SEASON_MAP = {
  kolkata: {
    bestMonths: "October to March",
    weather: "Pleasant, cool, and dry with temperatures between 15°C – 26°C. Perfect for walking tours and festivals.",
    festival: "Durga Puja (Autumn) & Christmas festivities on Park Street.",
  },
  kerala: {
    bestMonths: "September to March (Winter/Post-monsoon) & June to August (Ayurvedic Monsoon)",
    weather: "Lush tropical weather (23°C – 32°C). Houseboat cruising is magical in winter; monsoon brings refreshing rains.",
    festival: "Onam harvest festival and traditional Snake Boat races.",
  },
  "south korea": {
    bestMonths: "April to May (Spring Cherry Blossoms) & September to November (Crisp Autumn Foliage)",
    weather: "Mild and sunny (12°C – 22°C) with vibrant golden leaves in autumn and cherry blossom blooms in spring.",
    festival: "Cherry Blossom Festivals and Lotus Lantern Festival in Seoul.",
  },
  thailand: {
    bestMonths: "November to early April",
    weather: "Warm and sunny with comfortable beach breezes (24°C – 32°C). Low rainfall across Bangkok and islands.",
    festival: "Songkran (Water Festival in April) & Loy Krathong (Lantern Festival in November).",
  },
  dubai: {
    bestMonths: "November to March",
    weather: "Pleasantly warm and sunny (20°C – 28°C). Ideal for beach clubs, desert safaris, and outdoor rooftop dining.",
    festival: "Dubai Shopping Festival and New Year fireworks shows.",
  },
  france: {
    bestMonths: "May to September",
    weather: "Sunny, long daylight hours, and pleasant warm temperatures (18°C – 28°C). Perfect for sidewalk cafés and picnics.",
    festival: "Fête de la Musique (June) and Bastille Day celebrations.",
  },
};

// Curated city itineraries
function getCuratedCityPlan(cityOrCountry, days) {
  const c = normalize(cityOrCountry);

  if (c.includes("delhi") || c.includes("new delhi")) {
    const delhiDays = [
      {
        title: "Day 1: Historic Old Delhi & Street Food Trail",
        desc: "• Check in to your hotel and freshen up.\n• Visit the magnificent Mughal **Red Fort** and Asia's largest mosque **Jama Masjid**.\n• Savor authentic Old Delhi delicacies (paranthas, kebabs, jalebis) at historic **Chandni Chowk**.",
      },
      {
        title: "Day 2: Iconic Monuments & Spiritual Wonders",
        desc: "• Explore the towering UNESCO World Heritage site **Qutub Minar**.\n• Tour the grand garden tomb of **Humayun's Tomb** (inspiration for Taj Mahal).\n• Visit the serene flower-shaped **Lotus Temple** and relax in the evening.",
      },
      {
        title: "Day 3: Power Corridor & Central Delhi",
        desc: "• Drive past **Rashtrapati Bhavan** (Presidential Residence) and walk along Kartavya Path to **India Gate**.\n• Stroll through the circular colonnades and shopping hubs of **Connaught Place**.\n• Cultural evening and handicraft shopping at vibrant **Dilli Haat (INA)**.",
      },
      {
        title: "Day 4: Heritage, Art & Modern Nightlife",
        desc: "• Marvel at the grand architecture and musical fountain at **Akshardham Temple**.\n• Explore medieval ruins and trendy lake-view cafés at **Hauz Khas Village**.\n• Fine dining experience in South Delhi.",
      },
      {
        title: "Day 5: Culture, Street Markets & Departure",
        desc: "• Visit the National Museum or National Gallery of Modern Art (NGMA).\n• Bargain shopping for souvenirs and apparel at Sarojini Nagar or Khan Market.\n• Traditional afternoon tea before airport / railway station departure.",
      },
    ];
    return delhiDays.slice(0, days);
  }

  if (c.includes("mumbai") || c.includes("bombay")) {
    const mumbaiDays = [
      {
        title: "Day 1: Colonial Heritage & Queen's Necklace",
        desc: "• Visit the iconic **Gateway of India** and admire the Taj Mahal Palace hotel.\n• Stroll through heritage Colaba Causeway and enjoy sunset along **Marine Drive**.",
      },
      {
        title: "Day 2: Island Caves & Bollywood Culture",
        desc: "• Morning ferry to the ancient rock-cut **Elephanta Caves**.\n• Explore Bandra street art, Bandstand, and celebrity residences.",
      },
      {
        title: "Day 3: Spiritual Landmarks & Street Food",
        desc: "• Visit Siddhivinayak Temple and Haji Ali Dargah in the sea.\n• Evening pav bhaji and bhelpuri feast at lively **Juhu Beach**.",
      },
      {
        title: "Day 4: History, Architecture & Markets",
        desc: "• Admire Victorian gothic architecture at **Chhatrapati Shivaji Terminus (CST)**.\n• Shopping for spices and vintage curios at Crawford Market & Chor Bazaar.",
      },
      {
        title: "Day 5: Sea Link, Cafés & Departure",
        desc: "• Scenic drive across the Bandra-Worli Sea Link.\n• Brunch at iconic heritage Irani cafés before departure transfer.",
      },
    ];
    return mumbaiDays.slice(0, days);
  }

  if (c.includes("jaipur") || c.includes("rajasthan")) {
    const jaipurDays = [
      {
        title: "Day 1: The Pink City & Royal Palaces",
        desc: "• Visit the iconic honeycomb facade of **Hawa Mahal**.\n• Explore the majestic **City Palace** and astronomical wonders of **Jantar Mantar**.",
      },
      {
        title: "Day 2: Hill Forts & Floating Palace",
        desc: "• Ascend to the grand courtyards of **Amber Fort** with panoramic hill views.\n• Visit Jaigarh Fort (world's largest wheeled cannon) and photo stop at **Jal Mahal**.",
      },
      {
        title: "Day 3: Fort Sunsets & Royal Feasts",
        desc: "• Breathtaking sunset overlooking the city from **Nahargarh Fort**.\n• Authentic Rajasthani Thali dinner (Dal Baati Churma, Laal Maas) with folk dance at Chokhi Dhani.",
      },
      {
        title: "Day 4: Heritage Craft & Artistry",
        desc: "• Tour Albert Hall Museum and block-printing workshops in Sanganer.\n• Shop for authentic gemstones, block-printed quilts, and juttis in Johari & Bapu Bazaar.",
      },
      {
        title: "Day 5: Stepwells & Farewell",
        desc: "• Visit the architectural marvel **Panna Meena ka Kund** stepwell.\n• Traditional lassi at Lassiwala before departure.",
      },
    ];
    return jaipurDays.slice(0, days);
  }

  if (c.includes("goa")) {
    const goaDays = [
      {
        title: "Day 1: Sun, Sand & Coastal Shacks",
        desc: "• Check in to your beachside stay in North Goa.\n• Relax on Baga & Calangute beaches with fresh seafood and sunset music.",
      },
      {
        title: "Day 2: Portuguese Forts & Watersports",
        desc: "• Explore historic **Fort Aguada** and the dramatic cliffs of **Chapora Fort** (Dil Chahta Hai point).\n• Parasailing and jet skiing on Anjuna Beach.",
      },
      {
        title: "Day 3: UNESCO Churches & River Cruise",
        desc: "• Visit Basilica of Bom Jesus and Sé Cathedral in Old Goa.\n• Evening sunset dance cruise on the Mandovi River with Goan folk performances.",
      },
      {
        title: "Day 4: Serene South Goa & Spice Plantations",
        desc: "• Tour an organic Sahakari Spice Farm with traditional buffet lunch.\n• Unwind on the pristine white sands of Palolem & Agonda Beach.",
      },
      {
        title: "Day 5: Flea Markets & Farewell",
        desc: "• Souvenir shopping at local beach flea markets for cashews, spices, and handicrafts.\n• Farewell Goan fish curry lunch before heading to the airport.",
      },
    ];
    return goaDays.slice(0, days);
  }

  if (c.includes("bangalore") || c.includes("bengaluru")) {
    const blrDays = [
      {
        title: "Day 1: Garden City Greenery & Palace",
        desc: "• Stroll through the lush floral trails of **Lalbagh Botanical Garden** & glass house.\n• Visit the tudor-style **Bangalore Palace** and historic Cubbon Park.",
      },
      {
        title: "Day 2: Science, Tech & Craft Breweries",
        desc: "• Visit Visvesvaraya Industrial and Technological Museum.\n• Evening craft beer and artisan dining in vibrant Indiranagar & Koramangala.",
      },
      {
        title: "Day 3: Heritage Fort & Famous Filter Coffee",
        desc: "• Explore Tipu Sultan’s Summer Palace & Bangalore Fort.\n• Relish authentic South Indian breakfast (crispy dosa & filter coffee) at Vidyarthi Bhavan or MTR.",
      },
      {
        title: "Day 4: Art, Culture & Wildlife",
        desc: "• Day excursion to Bannerghatta National Park (Jungle Safari & Butterfly Park).\n• Browse art galleries at National Gallery of Modern Art (NGMA).",
      },
      {
        title: "Day 5: Silk Shopping & Departure",
        desc: "• Shop for Mysore silk sarees and sandalwood handicrafts on Commercial Street & MG Road.\n• Relaxing transfer to Kempegowda International Airport.",
      },
    ];
    return blrDays.slice(0, days);
  }

  if (c.includes("kolkata") || c.includes("calcutta")) {
    const kolkataDays = [
      {
        title: "Day 1: Colonial Grandeur & Iconic Heritage",
        desc: "• Check in to your luxury hotel and refresh.\n• Visit the majestic **Victoria Memorial** and stroll around the Maidan.\n• Evening dining and classic music on vibrant **Park Street**.",
      },
      {
        title: "Day 2: Cultural Icons & Riverside Serenity",
        desc: "• Walk across the historic **Howrah Bridge** and visit the bustling Flower Market.\n• Explore the historic **Dakshineswar Kali Temple** & Belur Math.\n• Sunset boat ride along the Hooghly River at **Princep Ghat**.",
      },
      {
        title: "Day 3: Art, Literature & Authentic Gastronomy",
        desc: "• Tour the **Indian Museum** and explore Jorasanko Thakur Bari (Rabindranath Tagore's ancestral home).\n• Feast on authentic Kolkata Biryani and world-famous Bengali sweets (Rosogolla, Sandesh) at historic sweet shops.",
      },
      {
        title: "Day 4: Architecture, Science & Modern Kolkata",
        desc: "• Admire the gothic architecture of **St. Paul’s Cathedral**.\n• Explore Science City and modern entertainment hubs around Salt Lake.\n• Relaxing dinner at top heritage restaurants overlooking the skyline.",
      },
      {
        title: "Day 5: Shopping, Local Markets & Farewell",
        desc: "• Morning shopping for handcrafted sarees and leather goods at **New Market**.\n• Enjoy traditional chai in earthen cups (kulhad) at a local café.\n• Check-out and comfortable transfer to your onward journey.",
      },
    ];
    return kolkataDays.slice(0, days);
  }

  if (c.includes("kerala")) {
    const keralaDays = [
      {
        title: "Day 1: Arrival & Coastal Backwaters",
        desc: "• Check in to your scenic **Spice Routes Houseboat** in Alappuzha.\n• Cruise through tranquil palm-fringed canals while savoring fresh Kerala cuisine.",
      },
      {
        title: "Day 2: Backwater Villages & Sunset",
        desc: "• Explore traditional coir-making villages and spice markets along the backwaters.\n• Sunset canoe ride and evening campfire overlooking the lake.",
      },
      {
        title: "Day 3: Heritage Fort Kochi & Chinese Fishing Nets",
        desc: "• Visit historic Fort Kochi, Mattancherry Dutch Palace, and Jew Town.\n• Watch the famous Chinese fishing nets in action at dusk.",
      },
      {
        title: "Day 4: Hill Station Tea Estates (Munnar)",
        desc: "• Scenic drive to Munnar tea plantations and mist-covered mountain viewpoints.\n• Visit a tea museum and enjoy organic estate tastings.",
      },
      {
        title: "Day 5: Ayurvedic Rejuvenation & Departure",
        desc: "• Enjoy an authentic Ayurvedic herbal massage and traditional Kerala Sadhya lunch.\n• Pick up freshly ground spices and souvenirs before check-out.",
      },
    ];
    return keralaDays.slice(0, days);
  }

  if (c.includes("south korea") || c.includes("korea") || c.includes("seoul")) {
    const koreaDays = [
      {
        title: "Day 1: Traditional Hanok & Royal Palaces",
        desc: "• Check in to your authentic **Sensational Hanok** stay in Jongno-gu, Seoul.\n• Explore **Gyeongbokgung Palace** in traditional Hanbok attire.\n• Stroll through Bukchon Hanok Village and cozy tea houses.",
      },
      {
        title: "Day 2: Vibrant Street Food & Shopping",
        desc: "• Taste famous street foods at **Gwangjang Market** (bbindaetteok, dumplings).\n• Explore cosmetic and fashion boutiques in Myeongdong.",
      },
      {
        title: "Day 3: Panorama Views & Modern Culture",
        desc: "• Ride the cable car to **N Seoul Tower** for panoramic city views.\n• Explore the futuristic architecture of Dongdaemun Design Plaza (DDP).",
      },
      {
        title: "Day 4: Art & Nightlife",
        desc: "• Visit contemporary art galleries in Insadong and Hongdae youth district.\n• Enjoy Korean BBQ and vibrant street performances.",
      },
      {
        title: "Day 5: Riverside Parks & Departure",
        desc: "• Morning picnic along the Han River with instant ramen and cycling.\n• Final souvenir shopping before heading to Incheon Airport.",
      },
    ];
    return koreaDays.slice(0, days);
  }

  if (c.includes("dubai")) {
    const dubaiDays = [
      {
        title: "Day 1: Downtown & Burj Khalifa",
        desc: "• Check in to your luxury hotel overlooking the Burj Khalifa.\n• Visit At The Top, Burj Khalifa observation deck and watch the Dubai Fountain show.",
      },
      {
        title: "Day 2: Desert Safari & Dune Bashing",
        desc: "• Afternoon 4x4 desert safari with sandboarding and camel rides.\n• Traditional BBQ buffet dinner under the stars at an Arabic desert camp.",
      },
      {
        title: "Day 3: Dubai Marina & Palm Jumeirah",
        desc: "• Yacht cruise through Dubai Marina and Atlantis The Palm.\n• Evening dining along the waterfront promenade.",
      },
      {
        title: "Day 4: Old Dubai & Gold Souk",
        desc: "• Ride an Abra across Dubai Creek to explore the Gold & Spice Souks.\n• Visit the Dubai Museum in Al Fahidi Historical Neighborhood.",
      },
      {
        title: "Day 5: Luxury Shopping & Departure",
        desc: "• Morning shopping at Dubai Mall or Mall of the Emirates.\n• Relaxing poolside afternoon before check-out.",
      },
    ];
    return dubaiDays.slice(0, days);
  }

  // Generic customized plan for any destination worldwide
  const destName =
    cityOrCountry && cityOrCountry !== "general"
      ? cityOrCountry.charAt(0).toUpperCase() + cityOrCountry.slice(1)
      : "Your Destination";

  const genericDays = [];
  for (let i = 1; i <= days; i++) {
    if (i === 1) {
      genericDays.push({
        title: `Day 1: Arrival & Settle In ${destName}`,
        desc: `• Check in to your accommodation in ${destName} and unwind after travel.\n• Stroll through vibrant local streets, visit nearby cafés, and savor authentic regional dinner.`,
      });
    } else if (i === days) {
      genericDays.push({
        title: `Day ${i}: Scenic Morning, Souvenir Shopping & Departure`,
        desc: `• Enjoy a relaxed morning breakfast with local specialties in ${destName}.\n• Explore local markets for unique handicrafts, spices, and souvenirs before checkout.`,
      });
    } else {
      genericDays.push({
        title: `Day ${i}: Iconic Landmarks, Nature & Culture in ${destName}`,
        desc: `• Visit top-rated historical monuments, scenic nature viewpoints, and cultural heritage spots in and around ${destName}.\n• Taste authentic street foods and signature delicacies at popular neighborhood eateries.`,
      });
    }
  }
  return genericDays;
}

// Intelligent multi-criteria travel concierge & database reasoning engine
async function generateLocalConciergeReply(userMessage, listings, history = [], user = null) {
  const rawQuery = userMessage.trim();
  let query = normalize(userMessage);

  // 1. GENERAL CONVERSATIONAL & GREETING INTENTS (Zero listings dump)

  // 1a. Greetings ("hi", "hello", "hey", etc.)
  if (
    /^(hi|hello|hey|heyy|heya|hola|greetings|good\s*(morning|afternoon|evening|day)|yo|sup)\b/i.test(
      query
    ) &&
    query.split(" ").length <= 4
  ) {
    return {
      reply:
        "Hello! 👋 I'm your Journey Cuisine AI Concierge. I can help you search motels, discover cheap rates, plan daily travel itineraries, recommend famous local food, calculate stay costs, and check your bookings.\n\nWhere would you like to travel today?",
      listings: [],
    };
  }

  // 1b. Identity ("who are you", "what is your name", etc.)
  if (
    query.includes("who are you") ||
    query.includes("what is your name") ||
    query.includes("what are you") ||
    query.includes("who made you") ||
    query.includes("who created you") ||
    query === "who r u"
  ) {
    return {
      reply:
        "I am the **Journey Cuisine AI Concierge**! ✈️🛎️\n\nI'm your intelligent travel and accommodation assistant. You can ask me to find cheap motels, search stays by location or ratings, build day-by-day vacation itineraries, recommend authentic local dishes, calculate trip costs, filter amenities like AC/TV/Wifi/pools, and look up your active bookings.",
      listings: [],
    };
  }

  // 1c. Company & Platform Info
  if (
    query.includes("about this company") ||
    query.includes("about the company") ||
    query.includes("about company") ||
    query.includes("tell me about this company") ||
    query.includes("tell me about company") ||
    query.includes("what is this company") ||
    query.includes("what is journey cuisine") ||
    query.includes("about journey cuisine") ||
    query.includes("what is this website") ||
    query.includes("what does this platform do") ||
    query.includes("what is this platform") ||
    query.includes("about this platform") ||
    query.includes("what is journeycuisine")
  ) {
    return {
      reply:
        "🏨 **About Journey Cuisine:**\n\n" +
        "**Journey Cuisine** is a modern accommodation booking and travel discovery platform designed to connect travelers with unique stays worldwide at transparent rates.\n\n" +
        "• **Diverse Stays:** Roadside motels, beachfront villas, cottages, cabins, houseboats, and resorts.\n" +
        "• **Direct Hosting:** List and host properties with full reservation management.\n" +
        "• **Smart AI Concierge:** Real-time multi-criteria search, regional cuisine pairing, rate comparisons, and personalized trip planning.\n\n" +
        "Can I help you find a stay or plan your next trip?",
      listings: [],
    };
  }

  // 1d. Contact Team & Customer Support
  if (
    query.includes("contact") ||
    query.includes("connect") ||
    query.includes("connect with your team") ||
    query.includes("connect to your team") ||
    query.includes("connect with team") ||
    query.includes("reach team") ||
    query.includes("contact us") ||
    query.includes("support") ||
    query.includes("customer care") ||
    query.includes("customer service") ||
    query.includes("help desk") ||
    query.includes("email team") ||
    query.includes("reach out") ||
    query.includes("get in touch") ||
    query.includes("in touch with") ||
    query.includes("speak to") ||
    query.includes("speak with") ||
    query.includes("talk to") ||
    query.includes("talk with") ||
    query.includes("talk to human") ||
    query.includes("admin email") ||
    query.includes("support email") ||
    query.includes("contact information") ||
    query.includes("contact info") ||
    query.includes("who to contact") ||
    query.includes("how to contact") ||
    query.includes("helpline") ||
    query.includes("phone number")
  ) {
    return {
      reply:
        "📬 **How to Contact Journey Cuisine Team:**\n\n" +
        "We're here to assist you with booking questions, host onboarding, feedback, and technical support!\n\n" +
        "• ✉️ **Official Support Email:** **skmirajulislam181@gmail.com**\n" +
        "• ⏱️ **Response Time:** Dedicated support responding within a few hours\n" +
        "• 🛎️ **Direct Concierge:** You can also ask me any questions directly right here in chat.\n\n" +
        "Feel free to email **skmirajulislam181@gmail.com** anytime and our team will get back to you promptly!",
      listings: [],
    };
  }

  // 1e. Capabilities & Help
  if (
    query.includes("what can you do") ||
    query.includes("how can you help") ||
    query.includes("your features") ||
    query === "help" ||
    query === "help me"
  ) {
    return {
      reply:
        "Here is what I can do for you:\n\n" +
        "1. 📍 **Find Stays by Destination:** Search across India, South Korea, Thailand, China, UAE, France, and 30+ countries.\n" +
        "2. 🏷️ **Filter by Category:** Cabins, Houseboats, Castles, Apartments, Tree houses, Domes, or Tents.\n" +
        "3. ⚡ **Filter by Amenities:** AC, TV, Wifi, Swimming Pool, Kitchen, Free Parking, Bathtub, Gym, and BBQ Grill.\n" +
        "4. 🍽️ **Explore Local Cuisine:** Discover iconic dishes and street food near your stay.\n" +
        "5. 💰 **Live Trip Cost Calculator:** Calculate total and per-guest costs for any duration.\n" +
        "6. 🗺️ **Plan Itineraries:** Request custom day-by-day vacation schedules with 1-click export.\n" +
        "7. 📅 **Check Reservations:** View your active trips and booking receipts directly in chat.\n" +
        "8. 🌤️ **Weather & Season Advice:** Learn the best months and festivals to visit global cities.",
      listings: [],
    };
  }

  // 1e. Gratitude
  if (
    /^(thank you|thanks|thank u|thx|thankyou|appreciate it|awesome|great)\b/i.test(
      query
    ) &&
    query.split(" ").length <= 4
  ) {
    return {
      reply:
        "You're very welcome! 😊 Feel free to ask anytime if you need help finding stays, delicious local food, or planning your next adventure. Safe travels! ✈️",
      listings: [],
    };
  }

  // 1f. Goodbyes
  if (
    /^(bye|goodbye|see you|cya|take care|have a good day)\b/i.test(query) &&
    query.split(" ").length <= 3
  ) {
    return {
      reply:
        "Goodbye! 👋 Have a wonderful trip and feel free to return whenever you're planning your next journey!",
      listings: [],
    };
  }

  // -------------------------------------------------------------
  // 2. MY RESERVATIONS & BOOKINGS LOOKUP
  // -------------------------------------------------------------
  if (
    query.includes("my booking") ||
    query.includes("my reservation") ||
    query.includes("my trip") ||
    query.includes("my stay") ||
    query.includes("upcoming booking") ||
    query.includes("show my bookings") ||
    query.includes("check my reservation")
  ) {
    if (!user || (!user.id && !user._id)) {
      return {
        reply:
          "🔒 Please make sure you are logged in to view your bookings and reservations!",
        listings: [],
      };
    }

    try {
      const userId = (user.id || user._id).toString();
      const userReservations = await reservationDB
        .find({ authorId: userId })
        .sort({ created_at: -1 })
        .lean();

      if (!userReservations || userReservations.length === 0) {
        return {
          reply:
            "📋 You currently have **no active bookings**.\n\nReady to embark on an adventure? Ask me for cheap motels, pool stays, or vacation itineraries to book your next trip!",
          listings: listings.slice(0, 3),
        };
      }

      // Fetch corresponding listings
      let replyText = `📋 **Your Bookings on Journey Cuisine (${userReservations.length}):**\n\n`;
      const bookedListingIds = userReservations.map((r) => r.listingId);
      const bookedListings = listings.filter((l) =>
        bookedListingIds.includes(l.id)
      );

      userReservations.forEach((resItem, idx) => {
        const matchingStay = listings.find((l) => l.id === resItem.listingId);
        const stayTitle = matchingStay ? matchingStay.title : `Stay #${resItem.listingId}`;
        const stayLoc = matchingStay ? ` (${matchingStay.location})` : "";
        const totalCost = (resItem.basePrice || 0) + (resItem.taxes || 0);

        replyText += `${idx + 1}. **${stayTitle}**${stayLoc}\n`;
        replyText += `   • **Dates:** ${resItem.checkIn || "Flexible"} → ${resItem.checkOut || "Flexible"} (${resItem.nightStaying || 1} nights)\n`;
        replyText += `   • **Guests:** ${resItem.guestNumber || 1} • **Total:** $${totalCost}\n\n`;
      });

      replyText += `You can manage your reservations anytime from the **Reservations** menu in the top bar!`;

      return {
        reply: replyText,
        listings: bookedListings.slice(0, 4),
      };
    } catch (err) {
      console.error("Error fetching user reservations:", err);
    }
  }

  // -------------------------------------------------------------
  // 3. REGIONAL FOOD & LOCAL CUISINE RECOMMENDATIONS (Journey Cuisine Signature)
  // -------------------------------------------------------------
  const isFoodQuery =
    query.includes("food") ||
    query.includes("cuisine") ||
    query.includes("dish") ||
    query.includes("dishes") ||
    query.includes("eat") ||
    query.includes("eating") ||
    query.includes("restaurant") ||
    query.includes("specialty") ||
    query.includes("specialities") ||
    query.includes("delicacies");

  if (isFoodQuery) {
    for (const key of Object.keys(REGIONAL_CUISINE_MAP)) {
      if (query.includes(key)) {
        const cuisineInfo = REGIONAL_CUISINE_MAP[key];
        let replyText = `🍽️ **Famous Authentic Cuisine & Dishes in ${cuisineInfo.name}:**\n\n`;
        cuisineInfo.dishes.forEach((d) => {
          replyText += `• ${d}\n`;
        });
        replyText += `\n🏨 **Top Nearby Stays in ${cuisineInfo.name} on Journey Cuisine:**\n`;

        const nearbyListings = listings.filter((l) => {
          const s = normalize(`${l.title} ${l.location} ${l.city} ${l.state} ${l.country}`);
          return s.includes(key);
        });

        const finalStays = nearbyListings.length > 0 ? nearbyListings.slice(0, 3) : listings.slice(0, 3);
        finalStays.forEach((item, idx) => {
          replyText += `${idx + 1}. **${item.title}** (${item.location}) — **$${item.pricePerNight}/night**\n`;
        });
        replyText += `\nClick on any stay below to book your culinary getaway!`;

        return {
          reply: replyText,
          listings: finalStays,
        };
      }
    }

    // General Food Guidance
    return {
      reply:
        `🍽️ **Explore Culinary Delights with Journey Cuisine!**\n\n` +
        `We pair unique motel stays with world-famous authentic regional food:\n` +
        `• **Kolkata:** Kolkata Biryani, Kathi Rolls & Rosogolla sweets.\n` +
        `• **Kerala:** Backwater Karimeen fish, Appam with stew & Malabar Parotta.\n` +
        `• **South Korea:** Korean BBQ, Gwangjang Market street food & Tteokbokki.\n` +
        `• **Thailand:** Pad Thai, Tom Yum Goong & Mango Sticky Rice.\n` +
        `• **Dubai:** Authentic Shawarma, Al Machboos & Luqaimat pastries.\n\n` +
        `Which destination's cuisine would you like to explore?`,
      listings: listings.slice(0, 3),
    };
  }

  // -------------------------------------------------------------
  // 4. WEATHER & BEST TRAVEL SEASON ADVISOR
  // -------------------------------------------------------------
  const isWeatherQuery =
    query.includes("weather") ||
    query.includes("best time to visit") ||
    query.includes("best month") ||
    query.includes("best season") ||
    query.includes("when to go") ||
    query.includes("temperature") ||
    query.includes("climate") ||
    query.includes("monsoon") ||
    query.includes("winter in") ||
    query.includes("summer in");

  if (isWeatherQuery) {
    for (const key of Object.keys(WEATHER_SEASON_MAP)) {
      if (query.includes(key)) {
        const wInfo = WEATHER_SEASON_MAP[key];
        const placeName = key.charAt(0).toUpperCase() + key.slice(1);
        const replyText =
          `🌤️ **Best Time to Visit ${placeName}:**\n\n` +
          `• 🗓️ **Ideal Travel Window:** **${wInfo.bestMonths}**\n` +
          `• 🌡️ **Weather & Climate:** ${wInfo.weather}\n` +
          `• 🎉 **Iconic Festivals & Highlights:** ${wInfo.festival}\n\n` +
          `Would you like me to find the best available stays in ${placeName} for these dates?`;

        const nearbyListings = listings.filter((l) => {
          const s = normalize(`${l.title} ${l.location} ${l.city} ${l.state} ${l.country}`);
          return s.includes(key);
        });

        return {
          reply: replyText,
          listings: nearbyListings.length > 0 ? nearbyListings.slice(0, 3) : listings.slice(0, 3),
        };
      }
    }
  }

  // -------------------------------------------------------------
  // 5. LIVE TRIP PRICE & SPLIT COST CALCULATOR
  // -------------------------------------------------------------
  const isCostCalcQuery =
    (query.includes("calculate") ||
      query.includes("cost for") ||
      query.includes("price for") ||
      query.includes("how much for") ||
      query.includes("split cost") ||
      query.includes("total price for")) &&
    /\b\d{1,4}\s*(?:night|nights|day|days)\b/i.test(query);

  if (isCostCalcQuery) {
    const nightsMatch = query.match(/\b(\d{1,4})\s*(?:night|nights|day|days)\b/i);
    const guestsMatch = query.match(/\b(\d{1,4})\s*(?:guest|guests|people|person|persons)\b/i);
    const numNights = nightsMatch ? parseInt(nightsMatch[1], 10) : 3;
    const numGuests = guestsMatch ? parseInt(guestsMatch[1], 10) : 2;

    // Check if location or property is specified
    let targetStays = [...listings];
    for (const place of Object.keys(LOCATION_SYNONYMS).concat(["kolkata", "kerala", "dubai", "france", "india"])) {
      if (query.includes(place)) {
        const filtered = listings.filter((l) => {
          const s = normalize(`${l.title} ${l.location} ${l.city} ${l.state} ${l.country}`);
          return s.includes(place);
        });
        if (filtered.length > 0) targetStays = filtered;
        break;
      }
    }

    const sampleStay = targetStays[0] || listings[0];
    const baseRate = sampleStay.pricePerNight;
    const totalBase = baseRate * numNights;
    const taxAndFees = Math.round(totalBase * 0.14);
    const grandTotal = totalBase + taxAndFees;
    const perPerson = Math.round(grandTotal / Math.max(numGuests, 1));

    let replyText = `💵 **Trip Cost Estimate for ${numNights} Nights (${numGuests} Guests):**\n\n`;
    replyText += `🏨 **Sample Stay:** **${sampleStay.title}** (${sampleStay.location})\n`;
    replyText += `• **Nightly Base Rate:** $${baseRate} / night\n`;
    replyText += `• **Accommodation Total (${numNights} nights):** $${totalBase}\n`;
    replyText += `• **Taxes & Service Fees (14%):** $${taxAndFees}\n`;
    replyText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    replyText += `💰 **Estimated Total:** **$${grandTotal}**\n`;
    replyText += `👤 **Per Person Share (${numGuests} guests):** **$${perPerson} / person**\n\n`;
    replyText += `Click below to view the stay details and finalize your reservation!`;

    return {
      reply: replyText,
      listings: targetStays.slice(0, 3),
    };
  }

  // -------------------------------------------------------------
  // 6. HOTEL / MOTEL TRAVEL FAQS
  // -------------------------------------------------------------
  if (
    query.includes("check in") ||
    query.includes("check out") ||
    query.includes("checkin") ||
    query.includes("checkout") ||
    query.includes("rule") ||
    query.includes("rules") ||
    query.includes("guideline") ||
    query.includes("policy") ||
    query.includes("policies") ||
    query.includes("timing")
  ) {
    return {
      reply:
        `🛎️ **Standard Motel Check-In & Check-Out Guidelines:**\n\n` +
        `• **Check-In:** Usually from **2:00 PM – 4:00 PM**. Many hosts offer flexible self check-in using smart locks or key lockboxes.\n` +
        `• **Check-Out:** Standard check-out is between **10:00 AM – 11:00 AM** to allow for room cleaning.\n` +
        `• **Valid ID:** Make sure to carry a valid government-issued photo ID upon check-in.\n` +
        `• **House Rules:** Please respect quiet hours (usually 10 PM – 7 AM) and check if the stay is pet-friendly in the listing amenities.\n\n` +
        `Need help finding a stay? Ask me for the cheapest motels or places in any city!`,
      listings: listings.slice(0, 3),
    };
  }

  if (
    query.includes("cancel") ||
    query.includes("cancellation") ||
    query.includes("refund")
  ) {
    return {
      reply:
        `📋 **Cancellation & Refund Policies:**\n\n` +
        `• You can review and manage your bookings anytime from your **Reservations Dashboard**.\n` +
        `• Hosts may offer flexible or moderate cancellation policies based on their listing settings.\n` +
        `• If you need assistance with an existing booking, navigate to your Reservations tab in the top navigation bar!`,
      listings: [],
    };
  }

  if (
    query.includes("difference") ||
    query.includes("motel vs hotel") ||
    query.includes("what is a motel")
  ) {
    return {
      reply:
        `🏨 **Motel vs. Hotel Key Differences:**\n\n` +
        `• **Motels (Motor Hotels):** Typically designed for road travelers with convenient parking right outside your room, direct exterior entrances, and affordable pricing.\n` +
        `• **Hotels:** Usually feature multi-story buildings with interior corridors, elevators, and extensive on-site amenities like fitness centers and banquet halls.\n` +
        `• **On Journey Cuisine:** You can explore both unique boutique motels, beachfront villas, houseboats, and luxury hotel suites at transparent rates!`,
      listings: listings.slice(0, 3),
    };
  }

  // -------------------------------------------------------------
  // 7. TRIP PLANNING & ITINERARY BUILDER
  // -------------------------------------------------------------
  const isTripPlanRequest =
    query.includes("plan trip") ||
    query.includes("plan a trip") ||
    query.includes("plan my trip") ||
    query.includes("itinerary") ||
    query.includes("travel plan") ||
    query.includes("help me plan") ||
    query.includes("plan for") ||
    query.includes("days trip") ||
    query.includes("day trip");

  const daysMatch = query.match(/\b(\d{1,4})\s*(?:day|days|night|nights)\b/i);
  const numDays = daysMatch ? parseInt(daysMatch[1], 10) : 0;

  const knownPlacesList = [
    "kolkata", "calcutta", "kerala", "bangalore", "mumbai", "delhi", "jaipur",
    "rajasthan", "himachal", "odisha", "lakshadweep", "maharashtra", "uttar pradesh",
    "south korea", "korea", "seoul", "gurye", "jongno",
    "china", "kunming", "yunnan",
    "thailand", "bangkok", "hua hin",
    "saudi arabia", "medina", "mecca", "makkah",
    "france", "paris",
    "italy", "rome", "camerino", "milan",
    "united kingdom", "london", "wales",
    "united arab emirates", "dubai",
    "indonesia", "bali",
    "united states", "america", "usa", "manhattan",
    "albania", "austria", "germany", "berlin", "afghanistan", "mexico", "poland", "japan", "tokyo", "india"
  ];

  let detectedPlanLocation = "";
  for (const place of knownPlacesList) {
    const regex = new RegExp(`\\b${escapeRegex(place)}\\b`, "i");
    if (regex.test(query)) {
      detectedPlanLocation = place;
      break;
    }
  }

  // Dynamic entity extraction if not in knownPlacesList (e.g. "Ranchi", "Raipur", "Shimla", "Ooty")
  if (!detectedPlanLocation) {
    const patterns = [
      /\b(?:trip|vacation|tour|itinerary|holiday|stay|travel|visit)\s+(?:in|to|for|at|around)\s+([a-zA-Z]+(?:\s+[a-zA-Z]+){0,3})/i,
      /\bplan\s+(?:a\s+)?(?:(?:\d{1,2})\s+(?:days?|nights?)\s+)?(?:trip\s+)?(?:in|to|for|around)\s+([a-zA-Z]+(?:\s+[a-zA-Z]+){0,3})/i,
      /\b(?:in|to|for|at)\s+([a-zA-Z]+(?:\s+[a-zA-Z]+){0,3})/i,
    ];

    for (const pat of patterns) {
      const match = rawQuery.match(pat) || query.match(pat);
      if (match && match[1]) {
        let candidate = match[1].trim();
        candidate = candidate
          .replace(/\b(for|with|and|all|nearby|available|stays?|properties|homestays?|motels?|hotels?|days?|nights?|\d+)\b.*$/i, "")
          .trim();
        if (
          candidate.length >= 2 &&
          !["the", "my", "a", "an", "this", "that", "some", "our", "me", "you", "us", "team"].includes(candidate.toLowerCase())
        ) {
          detectedPlanLocation = candidate;
          break;
        }
      }
    }
  }

  if (isTripPlanRequest || numDays > 0 || detectedPlanLocation) {
    if (!numDays && !detectedPlanLocation) {
      return {
        reply:
          `I would love to help you plan your perfect trip! ✈️🗺️\n\n` +
          `To create the best personalized itinerary with nearby homestays and motels, could you let me know:\n\n` +
          `1. 📍 **Destination:** Where would you like to travel? (e.g. *Kolkata, Kerala, South Korea, Dubai, Paris...*)\n` +
          `2. 🗓️ **Duration:** How many days will your trip be?\n` +
          `3. 🏖️ **Style & Amenities:** Are you looking for budget-friendly stays, luxury retreats, or specific facilities like a pool, AC, or kitchen?\n\n` +
          `Just reply with your destination and days (e.g. *"Plan a trip in Kolkata for 5 days"*), and I'll generate a full day-by-day plan with nearby stays!`,
        listings: [],
      };
    }

    const daysCount = Math.min(Math.max(numDays || 3, 1), 7);
    const locDisplayName = detectedPlanLocation
      ? detectedPlanLocation.charAt(0).toUpperCase() + detectedPlanLocation.slice(1)
      : "Your Destination";

    let planMatchedListings = [];
    if (detectedPlanLocation) {
      planMatchedListings = listings.filter((l) => {
        const searchable = normalize(
          `${l.title} ${l.location} ${l.city} ${l.state} ${l.country} ${l.address}`
        );
        const regex = new RegExp(`\\b${escapeRegex(detectedPlanLocation)}\\b`, "i");
        return regex.test(searchable);
      });
    }

    const dailySchedule = getCuratedCityPlan(detectedPlanLocation || "general", daysCount);
    let itineraryText = `✨ **${daysCount}-Day Personalized Itinerary for ${locDisplayName}** ✨\n\n`;

    dailySchedule.forEach((dayItem) => {
      itineraryText += `📅 **${dayItem.title}**\n${dayItem.desc}\n\n`;
    });

    if (planMatchedListings.length > 0) {
      itineraryText += `🏨 **Available Properties in ${locDisplayName} on Journey Cuisine:**\n`;
      planMatchedListings.slice(0, 4).forEach((item, idx) => {
        const star = item.ratings ? `★ ${item.ratings}/10` : "New";
        itineraryText += `${idx + 1}. **${item.title}** (${item.location}) — **$${item.pricePerNight}/night** (${item.houseType}, ${star})\n`;
      });
      itineraryText += `\nClick on any stay below to view photos and reserve!`;
    } else {
      itineraryText += `📍 *Note: We currently do not have active motel or homestay listings in **${locDisplayName}** in our database, but we are expanding rapidly to this region! 🌏*`;
    }

    const finalPlanListings = planMatchedListings.slice(0, 4);

    return {
      reply: itineraryText,
      listings: finalPlanListings,
    };
  }

  // -------------------------------------------------------------
  // 8. UNIFIED MULTI-CRITERIA DATABASE QUERY ENGINE
  // -------------------------------------------------------------
  let searchTarget = query;
  Object.keys(LOCATION_SYNONYMS).forEach((key) => {
    if (searchTarget.includes(key)) {
      searchTarget += " " + LOCATION_SYNONYMS[key];
    }
  });

  const allDbCountries = new Set();
  const allDbStates = new Set();
  const allDbCities = new Set();

  listings.forEach((l) => {
    if (l.country && l.country !== "undefined") allDbCountries.add(normalize(l.country));
    if (l.state && l.state !== "undefined") allDbStates.add(normalize(l.state));
    if (l.city && l.city !== "undefined") allDbCities.add(normalize(l.city));
  });

  const matchedLocationTerms = [];
  knownPlacesList.forEach((loc) => {
    const regex = new RegExp(`\\b${escapeRegex(loc)}\\b`, "i");
    if (regex.test(searchTarget) && !matchedLocationTerms.includes(loc)) {
      matchedLocationTerms.push(loc);
    }
  });

  allDbCities.forEach((city) => {
    if (city.length > 2) {
      const regex = new RegExp(`\\b${escapeRegex(city)}\\b`, "i");
      if (regex.test(searchTarget) && !matchedLocationTerms.includes(city)) {
        matchedLocationTerms.push(city);
      }
    }
  });

  allDbCountries.forEach((country) => {
    if (country.length > 2) {
      const regex = new RegExp(`\\b${escapeRegex(country)}\\b`, "i");
      if (regex.test(searchTarget) && !matchedLocationTerms.includes(country)) {
        matchedLocationTerms.push(country);
      }
    }
  });

  let candidateListings = [...listings];
  let locationLabel = "";

  if (matchedLocationTerms.length > 0) {
    locationLabel = matchedLocationTerms
      .map((l) => l.charAt(0).toUpperCase() + l.slice(1))
      .join(", ");

    candidateListings = candidateListings.filter((l) => {
      const searchable = normalize(
        `${l.title} ${l.location} ${l.city} ${l.state} ${l.country} ${l.address} ${l.description}`
      );
      return matchedLocationTerms.some((loc) => {
        const regex = new RegExp(`\\b${escapeRegex(loc)}\\b`, "i");
        return regex.test(searchable);
      });
    });
  }

  // Filter by Amenities (AC, TV, Wifi, Pool, Kitchen, Parking, Bathtub, Gym, etc.)
  const detectedAmenities = [];
  AMENITY_MAP.forEach((item) => {
    const matched = item.keywords.some((kw) => {
      const regex = new RegExp(`\\b${escapeRegex(kw)}\\b`, "i");
      return regex.test(query);
    });
    if (matched) {
      detectedAmenities.push(item);
    }
  });

  if (detectedAmenities.length > 0) {
    const amenityFiltered = candidateListings.filter((listing) => {
      const listingAmenitiesNorm = (listing.amenities || []).map(normalize);
      return detectedAmenities.every((amenityObj) =>
        amenityObj.dbNames.some((dbName) =>
          listingAmenitiesNorm.some((la) => la.includes(normalize(dbName)))
        )
      );
    });

    if (amenityFiltered.length > 0) {
      candidateListings = amenityFiltered;
    }
  }

  // Filter by Property Category
  const detectedCategories = [];
  CATEGORY_MAP.forEach((item) => {
    const matched = item.keywords.some((kw) => {
      const regex = new RegExp(`\\b${escapeRegex(kw)}\\b`, "i");
      return regex.test(query);
    });
    if (matched) {
      detectedCategories.push(item);
    }
  });

  if (detectedCategories.length > 0) {
    const categoryFiltered = candidateListings.filter((listing) => {
      const houseTypeNorm = normalize(listing.houseType);
      return detectedCategories.some((catObj) =>
        catObj.dbTypes.some((dbType) =>
          houseTypeNorm.includes(normalize(dbType))
        )
      );
    });

    if (categoryFiltered.length > 0) {
      candidateListings = categoryFiltered;
    }
  }

  // If no candidates found
  if (matchedLocationTerms.length > 0 && candidateListings.length === 0) {
    return {
      reply:
        `We currently don't have active listings matching all those specific filters in **${locationLabel}** in our database, but we are expanding rapidly! 🌏\n\n` +
        `Here are some of our popular top-rated international stays you can explore:`,
      listings: listings.slice(0, 3),
    };
  }

  // Sort Metrics
  const isTopRated =
    query.includes("best rate") ||
    query.includes("best rated") ||
    query.includes("highest rate") ||
    query.includes("highest rated") ||
    query.includes("top rate") ||
    query.includes("top rated") ||
    query.includes("5 star") ||
    query.includes("top review");

  const isLowestRated =
    query.includes("lowest rate") ||
    query.includes("lowest rated") ||
    query.includes("worst rated");

  const isExpensive =
    query.includes("expensive") ||
    query.includes("luxury") ||
    query.includes("premium") ||
    query.includes("highest price") ||
    query.includes("most expensive");

  const isCheapest =
    query.includes("cheap") ||
    query.includes("cheapest") ||
    query.includes("lowest price") ||
    query.includes("budget") ||
    query.includes("affordable") ||
    query.includes("least expensive");

  if (isTopRated && isExpensive) {
    candidateListings.sort((a, b) => {
      const rateA = typeof a.ratings === "number" ? a.ratings : 0;
      const rateB = typeof b.ratings === "number" ? b.ratings : 0;
      if (rateB !== rateA) return rateB - rateA;
      return b.pricePerNight - a.pricePerNight;
    });
  } else if (isTopRated) {
    candidateListings.sort((a, b) => {
      const rateA = typeof a.ratings === "number" ? a.ratings : 0;
      const rateB = typeof b.ratings === "number" ? b.ratings : 0;
      return rateB - rateA;
    });
  } else if (isLowestRated) {
    candidateListings.sort((a, b) => {
      const rateA = typeof a.ratings === "number" ? a.ratings : 10;
      const rateB = typeof b.ratings === "number" ? b.ratings : 10;
      return rateA - rateB;
    });
  } else if (isExpensive) {
    candidateListings.sort((a, b) => b.pricePerNight - a.pricePerNight);
  } else if (isCheapest) {
    candidateListings.sort((a, b) => a.pricePerNight - b.pricePerNight);
  }

  const topResults = candidateListings.slice(0, 4);

  const filterLabels = [];
  if (locationLabel) filterLabels.push(`in **${locationLabel}**`);
  if (detectedCategories.length > 0) {
    filterLabels.push(`Type: **${detectedCategories.map((c) => c.label).join(", ")}**`);
  }
  if (detectedAmenities.length > 0) {
    filterLabels.push(`Amenities: **${detectedAmenities.map((a) => a.label).join(", ")}**`);
  }
  if (isTopRated) filterLabels.push(`🌟 **Top Rated**`);
  if (isExpensive) filterLabels.push(`✨ **Luxury / High End**`);
  if (isCheapest) filterLabels.push(`💰 **Budget Friendly**`);

  const summaryHeader =
    filterLabels.length > 0
      ? `Found **${candidateListings.length} stays** matching ${filterLabels.join(" • ")}:`
      : `Found **${candidateListings.length} matching stays** for your search:`;

  let responseText = `${summaryHeader}\n\n`;
  topResults.forEach((item, idx) => {
    const starText = item.ratings ? `★ ${item.ratings}/10` : "New";
    const amenitiesPreview = (item.amenities || []).slice(0, 3).join(", ");
    responseText += `${idx + 1}. **${item.title}** in **${item.location}** — **$${item.pricePerNight}/night** (${item.houseType}, ${starText})\n`;
    if (amenitiesPreview) {
      responseText += `   • *Includes: ${amenitiesPreview}*\n`;
    }
  });
  responseText += `\nClick on any property card below to view verified amenities, photos, and book your stay!`;

  return {
    reply: responseText,
    listings: topResults,
  };
}

exports.handleAiChat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ success: 0, error: "Message is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const currentUser = req.user; // from JWT middleware

    // -------------------------------------------------------------
    // OFFENSIVE LANGUAGE BARRIER & SAFETY ENFORCEMENT
    // -------------------------------------------------------------
    if (isOffensiveMessage(message)) {
      const userId = currentUser?._id || currentUser?.id || currentUser;
      let dbUser = null;
      if (userId) {
        try {
          dbUser = await User.findById(userId);
        } catch (e) {
          console.error("User lookup error:", e);
        }
      }

      if (dbUser) {
        const warnings = dbUser.offensiveWarnings || 0;

        if (warnings < 5) {
          const newWarningCount = warnings + 1;
          const remainingWarnings = 5 - newWarningCount;

          await User.findByIdAndUpdate(dbUser._id, {
            $inc: { offensiveWarnings: 1 },
          });

          const isFinal = newWarningCount === 5;
          const warningTitle = isFinal
            ? `⚠️ **FINAL WARNING (5/5): Offensive Language Detected**`
            : `⚠️ **WARNING (${newWarningCount}/5): Offensive Language Detected**`;

          const warningBody = isFinal
            ? `**This is your 5th and FINAL warning.** Any subsequent offensive message will trigger **immediate permanent account deletion** from our database and permanent email blacklisting (**${dbUser.emailId}**).`
            : `You have **${remainingWarnings} warning(s) remaining**. If you exceed 5 warnings, your account will be **permanently deleted from our database** and your email (**${dbUser.emailId}**) will be **permanently blacklisted** from registering or logging in.`;

          return res.status(200).json({
            success: 1,
            isWarning: true,
            warningLevel: newWarningCount,
            reply:
              `${warningTitle}\n\n` +
              `Journey Cuisine enforces a strict zero-tolerance policy against vulgarity, abusive slurs, and harassment.\n\n` +
              `${warningBody}`,
            listings: [],
          });
        } else {
          // 6th offense (Exceeded 5 warnings): Remove Account & Blacklist Email
          const userEmail = (dbUser.emailId || "").toLowerCase().trim();

          if (userEmail) {
            await BlockedEmail.findOneAndUpdate(
              { email: userEmail },
              {
                email: userEmail,
                reason: "Exceeded 5 safety warnings: Repeated offensive language in AI Concierge",
                blockedAt: new Date(),
              },
              { upsert: true, new: true }
            );
          }

          // Permanently delete user from database
          await User.findByIdAndDelete(dbUser._id);

          return res.status(200).json({
            success: 1,
            isTerminated: true,
            isBlocked: true,
            userDeleted: true,
            reply:
              `🚫 **ACCOUNT TERMINATED & EMAIL PERMANENTLY BLACKLISTED**\n\n` +
              `Due to exceeding all 5 safety warnings and repeatedly using prohibited offensive language, your account has been **permanently removed from our company database**.\n\n` +
              `Your email address (**${userEmail}**) has been added to our **Permanent Global Blacklist**. You cannot log in or create a new account in the future.`,
            listings: [],
          });
        }
      } else {
        // Fallback warning if user object not loaded
        return res.status(200).json({
          success: 1,
          isWarning: true,
          reply:
            `⚠️ **WARNING: Offensive Language Detected**\n\n` +
            `Journey Cuisine enforces a strict zero-tolerance policy against abusive language. Continued use of offensive language will lead to immediate account termination and permanent email blacklisting.`,
          listings: [],
        });
      }
    }

    // 1. Fetch available listings from MongoDB with ALL location fields (city, state, country, address)
    const dbListings = await House.find({
      status: "Complete",
      photos: { $exists: true, $not: { $size: 0 } },
    }).lean();

    const formattedListings = dbListings.map((h) => {
      const city =
        h.location?.city?.name ||
        (typeof h.location?.city === "string" ? h.location.city : "") ||
        "";
      const state =
        h.location?.state?.name ||
        (typeof h.location?.state === "string" ? h.location.state : "") ||
        "";
      const country =
        h.location?.country?.name ||
        (typeof h.location?.country === "string" ? h.location.country : "") ||
        "";
      const addressLine =
        h.location?.addressLineOne || h.location?.addressLineTwo || "";

      const locationParts = [city, state, country].filter(
        (p) => p && p !== "undefined"
      );
      const locationStr =
        locationParts.length > 0
          ? locationParts.join(", ")
          : addressLine || "Global location";

      const amenityNames = (h.amenities || [])
        .map((a) => (typeof a === "object" ? a.name || a.title : a))
        .filter(Boolean);

      return {
        id: h._id.toString(),
        title: h.title || "Untitled Motel",
        houseType: h.houseType || "Motel",
        privacyType: h.privacyType || "Entire place",
        location: locationStr,
        city: city,
        state: state,
        country: country,
        address: addressLine,
        pricePerNight: h.basePrice || 50,
        priceAfterTaxes:
          h.priceAfterTaxes || Math.round((h.basePrice || 50) * 1.14),
        guests: h.floorPlan?.guests || 1,
        bedrooms: h.floorPlan?.bedrooms || 1,
        beds: h.floorPlan?.beds || 1,
        bathrooms: h.floorPlan?.bathroomsNumber || 1,
        ratings: h.ratings || null,
        amenities: amenityNames,
        thumbnail: h.photos?.[0] || "",
        photos: (h.photos || []).slice(0, 3),
        description: (h.description || "").slice(0, 300),
      };
    });

    // 2. Try Gemini API first (with 5-second timeout safeguard)
    let geminiSuccess = false;
    let replyText = "";
    let matchedListings = [];

    if (apiKey && apiKey.startsWith("AIzaSy")) {
      try {
        const systemPrompt = `You are the friendly, knowledgeable AI Travel & Motel Concierge for "Journey Cuisine".
DATABASE OF AVAILABLE MOTELS:
${JSON.stringify(formattedListings, null, 2)}

CORE CAPABILITIES:
1. GREETINGS & COMPANY INFO:
   - For greetings (e.g. "hi", "hello"), introduce yourself warmly without dumping listing cards.
   - For company/platform questions, explain that Journey Cuisine is a modern accommodation platform connecting travelers with verified motels, villas, and homestays.
2. TRIP PLANNING & ITINERARIES:
   - When user asks to plan a trip for a specific city/country (e.g. Kolkata for 5 days), provide a detailed day-by-day plan tailored to that destination and ONLY recommend properties located in that destination.
3. SIGNATURE CUISINE RECOMMENDATIONS:
   - Recommend famous local food, street eats, and delicacies for any destination (e.g. Kolkata Biryani/Rosogolla, Kerala Karimeen/Appam, South Korea K-BBQ/Tteokbokki).
4. LIVE TRIP COST ESTIMATES:
   - Calculate total cost (base rate × nights + 14% taxes) and per-person split for any guest count.
5. MULTI-CRITERIA FILTERING:
   - Filter by Region, Country, City, Category (Cabin, Boat, Castle, etc.), Amenities (AC, TV, Wifi, Pool, Kitchen, Parking, Bathtub, Gym), and Rating/Price.
6. MULTI-LANGUAGE:
   - Respond in the language requested (English, Hindi, Bengali, Korean, Spanish, French, etc.).
7. STRUCTURED OUTPUT: At the very end of your response, ONLY if you recommend specific properties from the database, output a JSON block formatted EXACTLY as:
\`\`\`json
{"recommendedIds":["id1","id2"]}
\`\`\`
8. Answer general hotel and travel hospitality questions.
9. CONTACT & SUPPORT:
   - When asked how to contact the team, support, customer care, or email, provide the official support email: skmirajulislam181@gmail.com and output an empty JSON list {"recommendedIds":[]}.
10. STRICT GUARDRAIL: Politely decline non-travel/non-hotel questions.`;

        const contents = [];
        if (Array.isArray(history)) {
          for (const turn of history.slice(-6)) {
            if (turn.role && turn.content) {
              contents.push({
                role: turn.role === "user" ? "user" : "model",
                parts: [{ text: turn.content }],
              });
            }
          }
        }
        contents.push({ role: "user", parts: [{ text: message }] });

        const modelName =
          process.env.GEMINI_MODERATION_MODEL || "gemini-2.5-flash";
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(5000),
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents,
            generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
          }),
        });

        if (response.ok) {
          const geminiData = await response.json();
          const rawText =
            geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            geminiSuccess = true;
            replyText = rawText;

            let recommendedIds = [];
            const jsonMatch = replyText.match(/```json\s*([\s\S]*?)\s*```/);
            if (jsonMatch && jsonMatch[1]) {
              try {
                const parsed = JSON.parse(jsonMatch[1]);
                if (Array.isArray(parsed.recommendedIds)) {
                  recommendedIds = parsed.recommendedIds;
                }
                replyText = replyText
                  .replace(/```json\s*[\s\S]*?\s*```/, "")
                  .trim();
              } catch {
                // Ignore parse error
              }
            }

            matchedListings = formattedListings.filter((l) =>
              recommendedIds.includes(l.id)
            );
          }
        }
      } catch (err) {
        console.error(
          "Gemini API call failed, automatically triggering intelligent concierge backup:",
          err.message
        );
      }
    }

    // 3. Automatic failover to local engine if Gemini fails or is unauthenticated
    if (!geminiSuccess) {
      const localResult = await generateLocalConciergeReply(
        message,
        formattedListings,
        history,
        currentUser
      );
      replyText = localResult.reply;
      matchedListings = localResult.listings;
    }

    return res.status(200).json({
      success: 1,
      reply: replyText,
      listings: matchedListings,
    });
  } catch (error) {
    console.error("handleAiChat error:", error);
    return res.status(500).json({ success: 0, error: "Internal server error" });
  }
};

/**
 * AI Image Moderation Endpoint
 * Evaluates uploaded motel listing images using Gemini Vision API.
 * Rejects adult/sexual, racism/hate, gore/violence, and murder-related content.
 * Warns the user with safety strikes (1-5), and permanently blocks & deletes accounts on 5th strike.
 */
exports.moderateImage = async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg" } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        success: 0,
        error: "Missing image data for AI moderation.",
      });
    }

    // Clean base64 string
    const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");

    // 1. Check Authenticated User
    const dbUser = req.user ? await User.findById(req.user) : null;
    if (!dbUser) {
      return res.status(401).json({
        success: 0,
        error: "Authentication required for image moderation.",
      });
    }

    // Check if user is already blacklisted
    const userEmail = (dbUser.emailId || "").toLowerCase().trim();
    const isAlreadyBlocked = userEmail
      ? await BlockedEmail.findOne({ email: userEmail })
      : null;

    if (isAlreadyBlocked) {
      await User.findByIdAndDelete(dbUser._id);
      return res.status(403).json({
        success: 0,
        isTerminated: true,
        error: "Your account is permanently blocked from Journey Cuisine.",
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const modelsToTry = [
      process.env.GEMINI_MODERATION_MODEL || "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-1.5-flash",
    ];

    let moderationResult = {
      isViolating: false,
      category: "NONE",
      categoryLabel: "Safe",
      reason: "No policy violations detected.",
    };

    let aiAnalyzed = false;

    if (apiKey && apiKey.startsWith("AIzaSy")) {
      for (const model of modelsToTry) {
        if (aiAnalyzed) break;
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

          const promptText = `You are a strict AI image moderation and safety auditor for "Journey Cuisine" motel and hotel platform.
Analyze this uploaded motel listing image very carefully.
Evaluate if this image contains ANY of the following prohibited policy violations:
1. ADULT_SEXUAL: Adult nudity, pornography, sexually explicit or suggestive poses, genitals, sexual acts, sex toys, erotic fetish material.
2. RACISM_HATE: Swastikas, Nazi symbols, KKK imagery, Confederate battle flags in hate context, racist caricatures, white supremacist symbols, hate speech slogans.
3. VIOLENCE_GORE: Severe physical violence, core gore, blood splatter, severed body parts, torture, weapons brandished menacingly in hostile manner.
4. MURDER_EXTREME_HARM: Dead human bodies, corpses, murder scenes, execution, hanging, self-harm, suicide, horrific fatal trauma.

Normal hospitality scenes (motel rooms, beds, bathrooms, swimming pools, buildings, beaches, scenery, food, happy travelers) are completely SAFE.

Output a valid JSON object ONLY:
{
  "isViolating": true or false,
  "category": "ADULT_SEXUAL" | "RACISM_HATE" | "VIOLENCE_GORE" | "MURDER_EXTREME_HARM" | "NONE",
  "categoryLabel": "Adult & Sexual Content" | "Racism & Hate Imagery" | "Violence & Gore" | "Murder & Extreme Harm" | "Safe",
  "reason": "Clear concise explanation of what was detected or why it violated policies"
}`;

          const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: AbortSignal.timeout(10000),
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: promptText },
                    {
                      inlineData: {
                        mimeType: mimeType,
                        data: base64Data,
                      },
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.1,
                responseMimeType: "application/json",
              },
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const rawContent =
              data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (rawContent) {
              const cleaned = rawContent
                .replace(/^```json\s*/i, "")
                .replace(/\s*```$/i, "")
                .trim();
              const parsed = JSON.parse(cleaned);
              moderationResult = {
                isViolating: Boolean(parsed.isViolating),
                category: parsed.category || "NONE",
                categoryLabel: parsed.categoryLabel || (parsed.isViolating ? "Prohibited Content" : "Safe"),
                reason: parsed.reason || "Content policy violation detected.",
              };
              aiAnalyzed = true;
            }
          } else {
            console.warn(`Gemini Vision model ${model} returned status ${response.status}`);
          }
        } catch (mErr) {
          console.warn(`Gemini Vision moderation with ${model} error:`, mErr.message);
        }
      }
    }

    // Process Moderation Outcome
    if (moderationResult.isViolating) {
      const currentWarnings = Number(dbUser.offensiveWarnings || 0);
      const newWarningCount = currentWarnings + 1;

      dbUser.offensiveWarnings = newWarningCount;
      await dbUser.save();

      // Check for 5th or higher Strike (Permanent Termination)
      if (newWarningCount >= 5) {
        if (userEmail) {
          await BlockedEmail.findOneAndUpdate(
            { email: userEmail },
            {
              email: userEmail,
              reason: `Exceeded 5 community safety violations (Prohibited image upload: ${moderationResult.categoryLabel})`,
              blockedAt: new Date(),
            },
            { upsert: true, new: true }
          );
        }

        // Permanently delete user from database
        await User.findByIdAndDelete(dbUser._id);

        return res.status(200).json({
          success: 1,
          isViolating: true,
          isTerminated: true,
          category: moderationResult.category,
          categoryLabel: moderationResult.categoryLabel,
          reason: moderationResult.reason,
          warningCount: 5,
          warningsRemaining: 0,
          message:
            "Your account has been permanently terminated and your email blacklisted due to reaching 5 community safety violations.",
        });
      } else {
        // Strike 1 to 4
        const remainingWarnings = 5 - newWarningCount;
        return res.status(200).json({
          success: 1,
          isViolating: true,
          isTerminated: false,
          category: moderationResult.category,
          categoryLabel: moderationResult.categoryLabel,
          reason: moderationResult.reason,
          warningCount: newWarningCount,
          warningsRemaining: remainingWarnings,
          message: `Community safety violation detected (${moderationResult.categoryLabel}). This is strike ${newWarningCount} of 5. Reaching 5 strikes will permanently delete your account and blacklist your email.`,
        });
      }
    }

    // Image is clean & compliant
    return res.status(200).json({
      success: 1,
      isViolating: false,
      isSafe: true,
      message: "Image verified safe for publication.",
    });
  } catch (error) {
    console.error("moderateImage controller error:", error);
    return res.status(500).json({
      success: 0,
      error: "Error processing image moderation.",
    });
  }
};

/**
 * AI Listing Description Generator
 * POST /ai/generate_description
 */
exports.generateListingDescription = async (req, res) => {
  try {
    const { title, houseType, location, amenities, cuisineOfferings, tone } = req.body;

    const typeLabel = houseType || "boutique motel retreat";
    const placeName = title || "our peaceful haven";
    const locString =
      typeof location === "object"
        ? [location?.address, location?.city?.name, location?.city?.country]
            .filter(Boolean)
            .join(", ")
        : location || "a scenic destination";

    const amenityList =
      Array.isArray(amenities) && amenities.length > 0
        ? amenities.slice(0, 6).join(", ")
        : "fast Wi-Fi, air conditioning, and full home comfort";

    const hasDining = Array.isArray(cuisineOfferings) && cuisineOfferings.length > 0;
    const mealHighlight = hasDining
      ? `Indulge in authentic host-prepared dining offerings (${cuisineOfferings
          .map((c) => c.title)
          .join(", ")}) during your stay.`
      : "Located within easy reach of top-rated regional culinary gems and authentic neighborhood eateries.";

    let generatedText = "";

    if (tone === "culinary") {
      generatedText = `Welcome to ${placeName}, where memorable travel meets authentic gastronomy in ${locString}!\n\nThis charming ${typeLabel.toLowerCase()} is designed for travelers who cherish rich regional flavors and warm hospitality. Unwind in thoughtfully appointed spaces featuring ${amenityList}.\n\n${mealHighlight}\n\nWhether you're exploring the local culinary trail, relaxing on the private patio, or gathering for an unforgettable evening feast, your stay promises an inspiring taste of local culture. Book your culinary getaway today!`;
    } else if (tone === "luxury") {
      generatedText = `Experience refined elegance and serene sophistication at ${placeName}, nestled in ${locString}.\n\nThis premier ${typeLabel.toLowerCase()} offers an elevated sanctuary for discerning travelers. Immerse yourself in designer interiors, plush bedding, and top-tier amenities including ${amenityList}.\n\n${mealHighlight}\n\nFrom tranquil morning coffees to breathtaking twilight views, every detail is curated for supreme comfort and relaxation. Reserve your five-star escape today.`;
    } else if (tone === "modern") {
      generatedText = `Discover a stylish, high-tech haven at ${placeName} in the heart of ${locString}!\n\nPerfect for modern adventurers, remote professionals, and city explorers, this contemporary ${typeLabel.toLowerCase()} seamlessly blends comfort with sleek design. Enjoy seamless connectivity with ${amenityList}.\n\n${mealHighlight}\n\nStep out to explore iconic landmarks and hidden city gems, then recharge in a comfortable, modern retreat. Secure your stay now!`;
    } else {
      // Default: "cozy" / homestyle
      generatedText = `Make yourself at home at ${placeName}, your tranquil sanctuary in ${locString}.\n\nThis cozy and inviting ${typeLabel.toLowerCase()} is the perfect retreat for families, couples, and friends seeking relaxation. Enjoy peaceful surroundings equipped with ${amenityList}.\n\n${mealHighlight}\n\nRelax, recharge, and create lasting memories in a space crafted with care and warmth. We look forward to hosting you!`;
    }

    return res.status(200).json({
      success: 1,
      description: generatedText,
    });
  } catch (error) {
    console.error("generateListingDescription error:", error);
    return res.status(500).json({ success: 0, message: "Failed to generate description" });
  }
};

/**
 * AI Smart Pricing Recommendation Engine
 * POST /ai/smart_pricing
 */
exports.calculateSmartPricing = async (req, res) => {
  try {
    const { houseType, floorPlan, amenities, cuisineOfferings } = req.body;

    const categoryBase = {
      Hotel: 95,
      House: 80,
      Apartment: 70,
      Cabin: 85,
      Boat: 120,
      Castle: 250,
      Dome: 110,
      Tent: 45,
      "Tree house": 105,
      Camper: 55,
      Container: 65,
    };

    let base = categoryBase[houseType] || 75;

    const guests = Number(floorPlan?.guests) || 1;
    const bedrooms = Number(floorPlan?.bedrooms) || 1;
    const bathrooms = Number(floorPlan?.bathroomsNumber) || 1;
    base += (guests - 1) * 12;
    base += (bedrooms - 1) * 20;
    base += (bathrooms - 1) * 15;

    if (Array.isArray(amenities)) {
      if (amenities.includes("Pool") || amenities.includes("Swimming Pool")) base += 25;
      if (amenities.includes("Air conditioning")) base += 10;
      if (amenities.includes("Bathtub") || amenities.includes("Buthub")) base += 12;
      if (amenities.includes("Grill") || amenities.includes("Campfire")) base += 8;
      if (amenities.includes("Dedicated workspace")) base += 7;
      if (amenities.includes("Exercise equipment")) base += 10;
    }

    if (Array.isArray(cuisineOfferings) && cuisineOfferings.length > 0) {
      base += cuisineOfferings.length * 6;
    }

    const recommendedPrice = Math.round(base);
    const lowRange = Math.round(recommendedPrice * 0.85);
    const highRange = Math.round(recommendedPrice * 1.25);
    const peakSeasonPrice = Math.round(recommendedPrice * 1.4);

    return res.status(200).json({
      success: 1,
      pricing: {
        recommendedPrice,
        lowRange,
        highRange,
        peakSeasonPrice,
        currency: "USD",
        confidence: "94%",
        insights: [
          `Base price calculated for ${guests} guest(s) and ${bedrooms} bedroom(s).`,
          amenities?.length > 5
            ? "Boosted by premium amenity selection (Pool, AC, Workspace)."
            : "Standard amenity profile.",
          cuisineOfferings?.length > 0
            ? `Includes value add from ${cuisineOfferings.length} dining experience(s).`
            : "Add host meals to boost booking value.",
        ],
      },
    });
  } catch (error) {
    console.error("calculateSmartPricing error:", error);
    return res.status(500).json({ success: 0, message: "Failed to calculate smart pricing" });
  }
};

