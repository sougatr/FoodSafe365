export interface RestaurantItem {
  id: string;
  name: string;
  city: 'mumbai' | 'delhi' | 'bengaluru' | 'pan-india';
  location: string;
  tableCode: string;
  cuisine: string;
  category?: string;
  badge: string;
  score: string;
  reviews: number;
  lastCheck: string;
  signals: {
    cold: { title: string; subtitle: string };
    medical: { title: string; subtitle: string };
    pest: { title: string; subtitle: string };
  };
}

export const POPULAR_RESTAURANTS: RestaurantItem[] = [
  // --- MUMBAI DINING & SWIGGY ICONS ---
  {
    id: 'the-table',
    name: 'The Table',
    city: 'mumbai',
    location: 'Colaba, Mumbai',
    tableCode: 'Table QR #02',
    cuisine: 'Modern European & Farm-to-Table Fine Dining',
    category: 'fine_dine',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.9',
    reviews: 320,
    lastCheck: 'Today, 09:30 AM',
    signals: {
      cold: { title: 'Cold < 5°C', subtitle: 'Refrigeration OK' },
      medical: { title: '100% Medical', subtitle: 'Stool Test Cleared' },
      pest: { title: 'Pest Safe', subtitle: 'Inspected Weekly' }
    }
  },
  {
    id: 'the-bombay-canteen',
    name: 'The Bombay Canteen',
    city: 'mumbai',
    location: 'Lower Parel, Mumbai',
    tableCode: 'Table QR #08',
    cuisine: 'Regional Indian & Craft Cocktails',
    category: 'fine_dine',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.8',
    reviews: 410,
    lastCheck: 'Today, 10:15 AM',
    signals: {
      cold: { title: 'Cold < 5°C', subtitle: 'Chilled Storage' },
      medical: { title: '100% Medical', subtitle: 'Form 1A Certified' },
      pest: { title: 'Pest Safe', subtitle: 'Zero Pest Activity' }
    }
  },
  {
    id: 'bastian-mumbai',
    name: 'Bastian',
    city: 'mumbai',
    location: 'Bandra West, Mumbai',
    tableCode: 'Table QR #05',
    cuisine: 'Seafood, Asian & Contemporary Dining',
    category: 'fine_dine',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.8',
    reviews: 295,
    lastCheck: 'Today, 09:45 AM',
    signals: {
      cold: { title: 'Raw Seafood < 2°C', subtitle: 'Ice Slush Stored' },
      medical: { title: '100% Medical', subtitle: 'Stool Test Cleared' },
      pest: { title: 'Pest Safe', subtitle: 'Weekly Certificate' }
    }
  },
  {
    id: 'social-mumbai',
    name: 'Colaba Social',
    city: 'mumbai',
    location: 'Colaba, Mumbai',
    tableCode: 'Table QR #14',
    cuisine: 'Casual Dining, Bar & All-Day Cafe',
    category: 'swiggy_popular',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.7',
    reviews: 580,
    lastCheck: 'Today, 08:30 AM',
    signals: {
      cold: { title: 'Chillers < 5°C', subtitle: 'Refrigeration OK' },
      medical: { title: '100% Medical', subtitle: 'All Staff Screened' },
      pest: { title: 'Pest Safe', subtitle: 'Bait Stations Intact' }
    }
  },
  {
    id: 'leopold-cafe',
    name: 'Leopold Cafe & Bar',
    city: 'mumbai',
    location: 'Colaba Causeway, Mumbai',
    tableCode: 'Table QR #03',
    cuisine: 'Iconic Heritage Cafe, Continental & Indian',
    category: 'iconic_cafe',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.7',
    reviews: 620,
    lastCheck: 'Today, 07:45 AM',
    signals: {
      cold: { title: 'Cold Storage < 5°C', subtitle: 'Chilled OK' },
      medical: { title: '100% Medical', subtitle: 'Form 1A Current' },
      pest: { title: 'Pest Safe', subtitle: 'Sanitized Nightly' }
    }
  },
  {
    id: 'kyani-and-co',
    name: 'Kyani & Co.',
    city: 'mumbai',
    location: 'Marine Lines, Mumbai',
    tableCode: 'Table QR #01',
    cuisine: 'Irani Chai, Bun Maska & Heritage Bakery',
    category: 'iconic_cafe',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.8',
    reviews: 480,
    lastCheck: 'Today, 07:15 AM',
    signals: {
      cold: { title: 'Dairy & Butter < 5°C', subtitle: 'Fresh Daily' },
      medical: { title: '100% Medical', subtitle: 'Stool Test Cleared' },
      pest: { title: 'Pest Safe', subtitle: 'Bakery Pest Shield' }
    }
  },
  {
    id: 'pizza-by-the-bay',
    name: 'Pizza By The Bay',
    city: 'mumbai',
    location: 'Marine Drive, Mumbai',
    tableCode: 'Table QR #11',
    cuisine: 'Italian, Gourmet Pizzas & Sea-View Cafe',
    category: 'swiggy_popular',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.8',
    reviews: 350,
    lastCheck: 'Today, 10:00 AM',
    signals: {
      cold: { title: 'Cheese < 4°C', subtitle: 'Cold Chain OK' },
      medical: { title: '100% Medical', subtitle: 'Staff Certified' },
      pest: { title: 'Pest Safe', subtitle: 'Inspected Weekly' }
    }
  },
  {
    id: 'bademiya-mumbai',
    name: 'Bademiya',
    city: 'mumbai',
    location: 'Tulloch Road, Colaba, Mumbai',
    tableCode: 'Table QR #09',
    cuisine: 'Kebabs, Rolls & Mughlai Street Cuisine',
    category: 'swiggy_popular',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.6',
    reviews: 740,
    lastCheck: 'Today, 11:30 AM',
    signals: {
      cold: { title: 'Core Temp ≥ 75°C', subtitle: 'Cooked Thoroughly' },
      medical: { title: '100% Medical', subtitle: 'Stool Test Cleared' },
      pest: { title: 'Pest Safe', subtitle: 'Floor Drains Clean' }
    }
  },
  {
    id: 'mahesh-lunch-home',
    name: 'Mahesh Lunch Home',
    city: 'mumbai',
    location: 'Fort, Mumbai',
    tableCode: 'Table QR #06',
    cuisine: 'Mangalorean Seafood & Coastal Cuisine',
    category: 'fine_dine',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.8',
    reviews: 380,
    lastCheck: 'Today, 10:45 AM',
    signals: {
      cold: { title: 'Fresh Catch < 2°C', subtitle: 'Daily Inspection' },
      medical: { title: '100% Medical', subtitle: 'Form 1A Cleared' },
      pest: { title: 'Pest Safe', subtitle: 'Kitchen Free of Pests' }
    }
  },
  {
    id: 'trishna-mumbai',
    name: 'Trishna',
    city: 'mumbai',
    location: 'Kala Ghoda, Fort, Mumbai',
    tableCode: 'Table QR #04',
    cuisine: 'Butter Pepper Garlic Crab & Coastal Delicacies',
    category: 'fine_dine',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.9',
    reviews: 430,
    lastCheck: 'Today, 11:00 AM',
    signals: {
      cold: { title: 'Live Seafood Chilled', subtitle: 'Fresh Stock' },
      medical: { title: '100% Medical', subtitle: 'Stool Test Cleared' },
      pest: { title: 'Pest Safe', subtitle: 'Weekly Deep Sweep' }
    }
  },
  {
    id: 'o-pedro-mumbai',
    name: 'O Pedro',
    city: 'mumbai',
    location: 'BKC, Mumbai',
    tableCode: 'Table QR #10',
    cuisine: 'Goan, Portuguese & Craft Cocktails',
    category: 'fine_dine',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.8',
    reviews: 280,
    lastCheck: 'Today, 10:20 AM',
    signals: {
      cold: { title: 'Cold Room < 4°C', subtitle: 'Refrigeration OK' },
      medical: { title: '100% Medical', subtitle: 'Certified Cooks' },
      pest: { title: 'Pest Safe', subtitle: 'Bait Boxes Intact' }
    }
  },

  // --- SWIGGY / PAN-INDIA DELIVERY & HIGH-VOLUME BRANDS ---
  {
    id: 'behrouz-biryani',
    name: 'Behrouz Biryani',
    city: 'pan-india',
    location: 'Multiple Outlets · Swiggy Cloud Kitchen',
    tableCode: 'Delivery Pack #91',
    cuisine: 'Royal Dum Biryani & Mughlai Kebabs',
    category: 'swiggy_popular',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.7',
    reviews: 1250,
    lastCheck: 'Today, 09:00 AM',
    signals: {
      cold: { title: 'Dum Hot ≥ 75°C', subtitle: 'Sealed Handi Transit' },
      medical: { title: '100% Medical', subtitle: 'Cloud Staff Tested' },
      pest: { title: 'Pest Safe', subtitle: 'Tamper-Evident Seal' }
    }
  },
  {
    id: 'faasos',
    name: 'Faasos',
    city: 'pan-india',
    location: 'Multiple Outlets · Swiggy Cloud Kitchen',
    tableCode: 'Delivery Pack #42',
    cuisine: 'Signature Wraps, Rolls & Meals',
    category: 'swiggy_popular',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.6',
    reviews: 1890,
    lastCheck: 'Today, 08:30 AM',
    signals: {
      cold: { title: 'Raw Prep < 5°C', subtitle: 'Refrigerated Holding' },
      medical: { title: '100% Medical', subtitle: 'Stool Test Cleared' },
      pest: { title: 'Pest Safe', subtitle: 'Daily Deep Cleanse' }
    }
  },
  {
    id: 'biryani-by-kilo',
    name: 'Biryani By Kilo',
    city: 'pan-india',
    location: 'Multiple Outlets · Swiggy Delivery & Dine-In',
    tableCode: 'Table QR #07',
    cuisine: 'Fresh Dum Biryani Cooked in Clay Handis',
    category: 'swiggy_popular',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.8',
    reviews: 860,
    lastCheck: 'Today, 10:10 AM',
    signals: {
      cold: { title: 'Core Temp ≥ 75°C', subtitle: 'Freshly Baked Handi' },
      medical: { title: '100% Medical', subtitle: 'Form 1A Certified' },
      pest: { title: 'Pest Safe', subtitle: 'Sealed Earthen Ware' }
    }
  },
  {
    id: 'mcdonalds-india',
    name: "McDonald's",
    city: 'pan-india',
    location: 'Pan-India Outlets & Swiggy Delivery',
    tableCode: 'Table QR #15',
    cuisine: 'Burgers, Fries, McCafé & Fast Food',
    category: 'swiggy_popular',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.8',
    reviews: 3200,
    lastCheck: 'Today, 07:00 AM',
    signals: {
      cold: { title: 'Freezer < -18°C', subtitle: 'Patty Core Verified' },
      medical: { title: '100% Medical', subtitle: 'All Crew Cleared' },
      pest: { title: 'Pest Safe', subtitle: 'HACCP Standard Audited' }
    }
  },
  {
    id: 'dominos-pizza',
    name: "Domino's Pizza",
    city: 'pan-india',
    location: 'Pan-India Outlets & Swiggy Delivery',
    tableCode: 'Delivery Pack #10',
    cuisine: 'Hot Pizzas, Garlic Bread & Desserts',
    category: 'swiggy_popular',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.7',
    reviews: 4100,
    lastCheck: 'Today, 08:15 AM',
    signals: {
      cold: { title: 'Cheese Chill < 4°C', subtitle: 'Dough Proofed 4°C' },
      medical: { title: '100% Medical', subtitle: 'Rider & Crew Health' },
      pest: { title: 'Pest Safe', subtitle: 'Tamper Safe Packaging' }
    }
  },
  {
    id: 'burger-king-india',
    name: 'Burger King',
    city: 'pan-india',
    location: 'Pan-India Outlets & Swiggy Delivery',
    tableCode: 'Table QR #09',
    cuisine: 'Flame-Grilled Whoppers, Burgers & Shakes',
    category: 'swiggy_popular',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.6',
    reviews: 1950,
    lastCheck: 'Today, 08:45 AM',
    signals: {
      cold: { title: 'Broiler Core ≥ 75°C', subtitle: 'Flame Grilled Safe' },
      medical: { title: '100% Medical', subtitle: 'Crew Stool Tested' },
      pest: { title: 'Pest Safe', subtitle: 'Fly Screens In Place' }
    }
  },
  {
    id: 'subway-india',
    name: 'Subway',
    city: 'pan-india',
    location: 'Pan-India Outlets & Swiggy Delivery',
    tableCode: 'Counter QR #01',
    cuisine: 'Fresh Subs, Salads & Wraps',
    category: 'swiggy_popular',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.7',
    reviews: 1420,
    lastCheck: 'Today, 08:00 AM',
    signals: {
      cold: { title: 'Salad Bar < 5°C', subtitle: 'Cold Bain Marie' },
      medical: { title: '100% Medical', subtitle: 'Sandwich Artists Safe' },
      pest: { title: 'Pest Safe', subtitle: 'Daily Sanitized Glass' }
    }
  },
  {
    id: 'kfc-india',
    name: 'KFC',
    city: 'pan-india',
    location: 'Pan-India Outlets & Swiggy Delivery',
    tableCode: 'Table QR #08',
    cuisine: 'Crispy Fried Chicken, Burgers & Wings',
    category: 'swiggy_popular',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.7',
    reviews: 2600,
    lastCheck: 'Today, 09:15 AM',
    signals: {
      cold: { title: 'Fry Core ≥ 82°C', subtitle: 'Pressure Fried Hot' },
      medical: { title: '100% Medical', subtitle: 'Form 1A Maintained' },
      pest: { title: 'Pest Safe', subtitle: 'Oil TPM Tested Daily' }
    }
  },
  {
    id: 'haldirams',
    name: "Haldiram's",
    city: 'pan-india',
    location: 'Multiple Outlets · Delhi, Mumbai & Swiggy',
    tableCode: 'Table QR #18',
    cuisine: 'Pure Vegetarian Sweets, Chaat, Thalis & Snacks',
    category: 'swiggy_popular',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.8',
    reviews: 3500,
    lastCheck: 'Today, 07:30 AM',
    signals: {
      cold: { title: 'Dairy Sweets < 4°C', subtitle: 'Pure Ghee Tested' },
      medical: { title: '100% Medical', subtitle: 'Staff Certified Clean' },
      pest: { title: 'Pest Safe', subtitle: 'UV Fly Killers Active' }
    }
  },
  {
    id: 'barbeque-nation',
    name: 'Barbeque Nation',
    city: 'pan-india',
    location: 'Multiple Outlets · Pan-India Dine-In',
    tableCode: 'Live Grill #05',
    cuisine: 'Live Table Grills, Barbeque & Multi-Cuisine Buffet',
    category: 'swiggy_popular',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.8',
    reviews: 2200,
    lastCheck: 'Today, 10:30 AM',
    signals: {
      cold: { title: 'Buffet Hot ≥ 65°C', subtitle: 'Chilled Salad Counter' },
      medical: { title: '100% Medical', subtitle: 'Quarterly Checkups' },
      pest: { title: 'Pest Safe', subtitle: 'Zero Pest Activity' }
    }
  },
  {
    id: 'starbucks-india',
    name: 'Starbucks Coffee',
    city: 'pan-india',
    location: 'Multiple Outlets & Swiggy Delivery',
    tableCode: 'Cafe QR #03',
    cuisine: 'Artisan Espresso, Frappuccinos & Gourmet Bakery',
    category: 'iconic_cafe',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.9',
    reviews: 1850,
    lastCheck: 'Today, 06:45 AM',
    signals: {
      cold: { title: 'Milk Chilled < 4°C', subtitle: 'Steam Wand Sanitized' },
      medical: { title: '100% Medical', subtitle: 'Baristas Tested' },
      pest: { title: 'Pest Safe', subtitle: 'Water RO Filter Checked' }
    }
  },
  {
    id: 'third-wave-coffee',
    name: 'Third Wave Coffee',
    city: 'pan-india',
    location: 'Multiple Outlets · Bengaluru, Mumbai, Delhi',
    tableCode: 'Table QR #06',
    cuisine: 'Speciality Coffee, Sandwiches & Bagels',
    category: 'iconic_cafe',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.8',
    reviews: 940,
    lastCheck: 'Today, 07:15 AM',
    signals: {
      cold: { title: 'Cold Brew Chilled', subtitle: 'Brew Line Cleaned' },
      medical: { title: '100% Medical', subtitle: 'Stool Test Cleared' },
      pest: { title: 'Pest Safe', subtitle: 'Clean Bar Guarantee' }
    }
  },
  {
    id: 'blue-tokai-coffee',
    name: 'Blue Tokai Coffee Roasters',
    city: 'pan-india',
    location: 'Multiple Outlets · Mumbai, Delhi, Bengaluru',
    tableCode: 'Table QR #02',
    cuisine: 'Single-Origin Coffee, Sourdough & Croissants',
    category: 'iconic_cafe',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.9',
    reviews: 1100,
    lastCheck: 'Today, 07:30 AM',
    signals: {
      cold: { title: 'Cold Storage < 5°C', subtitle: 'Fresh Sourdough' },
      medical: { title: '100% Medical', subtitle: 'Staff Certified' },
      pest: { title: 'Pest Safe', subtitle: 'Cafe Sanitized Nightly' }
    }
  },
  {
    id: 'chaayos',
    name: 'Chaayos',
    city: 'pan-india',
    location: 'Multiple Outlets & Swiggy Delivery',
    tableCode: 'Table QR #04',
    cuisine: 'Desi Chai, Bun Maska & Indian Street Snacks',
    category: 'swiggy_popular',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.7',
    reviews: 1650,
    lastCheck: 'Today, 08:00 AM',
    signals: {
      cold: { title: 'Dairy Refrigerated', subtitle: 'Chai Boiled ≥ 100°C' },
      medical: { title: '100% Medical', subtitle: 'Form 1A Cleared' },
      pest: { title: 'Pest Safe', subtitle: 'Counter Sanitized' }
    }
  },
  {
    id: 'wow-momo',
    name: 'Wow! Momo',
    city: 'pan-india',
    location: 'Multiple Outlets & Swiggy Delivery',
    tableCode: 'Kiosk QR #01',
    cuisine: 'Steamed, Pan-Fried & Sizzler Momos',
    category: 'swiggy_popular',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.6',
    reviews: 1480,
    lastCheck: 'Today, 09:30 AM',
    signals: {
      cold: { title: 'Steamed ≥ 85°C', subtitle: 'Piping Hot Service' },
      medical: { title: '100% Medical', subtitle: 'Crew Certified' },
      pest: { title: 'Pest Safe', subtitle: 'Fly Killers Active' }
    }
  },

  // --- DELHI NCR ICONS & SWIGGY FAVORITES ---
  {
    id: 'bukhara-delhi',
    name: 'Bukhara - ITC Maurya',
    city: 'delhi',
    location: 'Chanakyapuri, New Delhi',
    tableCode: 'Tandoor QR #01',
    cuisine: 'Iconic Tandoori, Dal Bukhara & Northwest Frontier',
    category: 'fine_dine',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.9',
    reviews: 620,
    lastCheck: 'Today, 10:00 AM',
    signals: {
      cold: { title: 'Tandoor Core ≥ 85°C', subtitle: 'Cooked Thoroughly' },
      medical: { title: '100% Medical', subtitle: 'ITC Master Hygiene' },
      pest: { title: 'Pest Safe', subtitle: 'Five-Star Audit 100%' }
    }
  },
  {
    id: 'indian-accent-delhi',
    name: 'Indian Accent',
    city: 'delhi',
    location: 'The Lodhi, Lodhi Road, New Delhi',
    tableCode: 'Table QR #07',
    cuisine: 'Inventive Progressive Indian Fine Dining',
    category: 'fine_dine',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '5.0',
    reviews: 490,
    lastCheck: 'Today, 10:30 AM',
    signals: {
      cold: { title: 'Chillers < 3°C', subtitle: 'Cold Precision' },
      medical: { title: '100% Medical', subtitle: 'Form 1A Certified' },
      pest: { title: 'Pest Safe', subtitle: 'Pest Shield Active' }
    }
  },
  {
    id: 'karims-delhi',
    name: "Karim's",
    city: 'delhi',
    location: 'Gali Kababian, Jama Masjid, Old Delhi',
    tableCode: 'Table QR #04',
    cuisine: 'Mutton Burra, Seekh Kebabs & Mughlai Heritage',
    category: 'swiggy_popular',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.7',
    reviews: 890,
    lastCheck: 'Today, 11:15 AM',
    signals: {
      cold: { title: 'Core Temp ≥ 75°C', subtitle: 'Fresh Hot Kebab' },
      medical: { title: '100% Medical', subtitle: 'Stool Test Cleared' },
      pest: { title: 'Pest Safe', subtitle: 'Clean Drain Grates' }
    }
  },
  {
    id: 'gulati-restaurant',
    name: 'Gulati Restaurant',
    city: 'delhi',
    location: 'Pandara Road Market, New Delhi',
    tableCode: 'Table QR #10',
    cuisine: 'Butter Chicken, Dal Makhani & Tandoori Feast',
    category: 'swiggy_popular',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.8',
    reviews: 670,
    lastCheck: 'Today, 10:45 AM',
    signals: {
      cold: { title: 'Curry Holding ≥ 65°C', subtitle: 'Hot Bain Marie' },
      medical: { title: '100% Medical', subtitle: 'Form 1A Complete' },
      pest: { title: 'Pest Safe', subtitle: 'Pest Inspection Pass' }
    }
  },
  {
    id: 'saravanaa-bhavan-delhi',
    name: 'Saravanaa Bhavan',
    city: 'delhi',
    location: 'Connaught Place, New Delhi',
    tableCode: 'Table QR #12',
    cuisine: 'Authentic South Indian Tiffin, Dosa & Filter Coffee',
    category: 'swiggy_popular',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.8',
    reviews: 780,
    lastCheck: 'Today, 07:30 AM',
    signals: {
      cold: { title: 'Chutneys Fresh < 5°C', subtitle: 'Zero Fermentation' },
      medical: { title: '100% Medical', subtitle: 'Staff Certified Clean' },
      pest: { title: 'Pest Safe', subtitle: 'Kitchen UV Traps On' }
    }
  },
  {
    id: 'big-chill-cafe',
    name: 'The Big Chill Cafe',
    city: 'delhi',
    location: 'Khan Market, New Delhi',
    tableCode: 'Table QR #08',
    cuisine: 'Pastas, Wood-Fired Pizza & Famous Cheesecakes',
    category: 'iconic_cafe',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.9',
    reviews: 820,
    lastCheck: 'Today, 09:15 AM',
    signals: {
      cold: { title: 'Desserts Chill < 4°C', subtitle: 'Freshly Baked Safe' },
      medical: { title: '100% Medical', subtitle: 'Stool Test Cleared' },
      pest: { title: 'Pest Safe', subtitle: 'Pest Certificate 100%' }
    }
  },
  {
    id: 'cafe-delhi-heights',
    name: 'Cafe Delhi Heights',
    city: 'delhi',
    location: 'Connaught Place / Cyber Hub, Delhi NCR',
    tableCode: 'Table QR #11',
    cuisine: 'Juicy Lucy Burger, Continental & Fusion Cafe',
    category: 'swiggy_popular',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.8',
    reviews: 540,
    lastCheck: 'Today, 09:45 AM',
    signals: {
      cold: { title: 'Cold Storage < 5°C', subtitle: 'Refrigeration OK' },
      medical: { title: '100% Medical', subtitle: 'Staff Hygiene 100%' },
      pest: { title: 'Pest Safe', subtitle: 'Bait Stations Tested' }
    }
  },

  // --- BENGALURU ICONS & SWIGGY FAVORITES ---
  {
    id: 'rameshwaram-cafe',
    name: 'The Rameshwaram Cafe',
    city: 'bengaluru',
    location: '12th Main, Indiranagar, Bengaluru',
    tableCode: 'Order Counter #01',
    cuisine: 'Ghee Podi Idli, Crispy Dosas & Filter Kaapi',
    category: 'swiggy_popular',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.9',
    reviews: 1450,
    lastCheck: 'Today, 06:30 AM',
    signals: {
      cold: { title: 'RO Water Potable', subtitle: 'Water Lab Tested OK' },
      medical: { title: '100% Medical', subtitle: 'Form 1A Stool Cleared' },
      pest: { title: 'Pest Safe', subtitle: 'Continuous Upkeep' }
    }
  },
  {
    id: 'truffles-bengaluru',
    name: 'Truffles',
    city: 'bengaluru',
    location: 'Koramangala, Bengaluru',
    tableCode: 'Table QR #14',
    cuisine: 'All-American Burgers, Steaks, Fries & Desserts',
    category: 'swiggy_popular',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.8',
    reviews: 1890,
    lastCheck: 'Today, 08:30 AM',
    signals: {
      cold: { title: 'Meat Patty Core 75°C', subtitle: 'Cooked Thoroughly' },
      medical: { title: '100% Medical', subtitle: 'Staff Certified' },
      pest: { title: 'Pest Safe', subtitle: 'Fly Screens Sealed' }
    }
  },
  {
    id: 'meghana-foods',
    name: 'Meghana Foods',
    city: 'bengaluru',
    location: 'Koramangala & Indiranagar, Bengaluru',
    tableCode: 'Table QR #09',
    cuisine: 'Spicy Andhra Dum Biryani, Boneless Chicken & Paneer',
    category: 'swiggy_popular',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.8',
    reviews: 2100,
    lastCheck: 'Today, 09:15 AM',
    signals: {
      cold: { title: 'Biryani Dum ≥ 75°C', subtitle: 'Piping Hot Safe' },
      medical: { title: '100% Medical', subtitle: 'Kitchen Handlers Safe' },
      pest: { title: 'Pest Safe', subtitle: 'Inspected Weekly' }
    }
  },
  {
    id: 'toit-brewpub',
    name: 'Toit Brewpub',
    city: 'bengaluru',
    location: '100 Feet Road, Indiranagar, Bengaluru',
    tableCode: 'Table QR #21',
    cuisine: 'Craft Microbrewery, Wood-Fired Pizza & Pub Grub',
    category: 'fine_dine',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.9',
    reviews: 1320,
    lastCheck: 'Today, 10:00 AM',
    signals: {
      cold: { title: 'Keg Cold Room < 4°C', subtitle: 'Beer Lines Cleaned' },
      medical: { title: '100% Medical', subtitle: 'Form 1A Certified' },
      pest: { title: 'Pest Safe', subtitle: 'Zero Pest Activity' }
    }
  },
  {
    id: 'vidyarthi-bhavan',
    name: 'Vidyarthi Bhavan',
    city: 'bengaluru',
    location: 'Gandhi Bazaar, Basavanagudi, Bengaluru',
    tableCode: 'Table QR #05',
    cuisine: 'Iconic Masale Dose, Kesari Bath & Filter Coffee',
    category: 'iconic_cafe',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.8',
    reviews: 980,
    lastCheck: 'Today, 07:00 AM',
    signals: {
      cold: { title: 'Fresh Ghee & Batter', subtitle: 'Daily Fermentation' },
      medical: { title: '100% Medical', subtitle: 'Stool Test Cleared' },
      pest: { title: 'Pest Safe', subtitle: 'Heritage Clean Protocol' }
    }
  },
  {
    id: 'ctr-shri-sagar',
    name: 'CTR - Shri Sagar',
    city: 'bengaluru',
    location: '7th Cross, Margosa Road, Malleshwaram, Bengaluru',
    tableCode: 'Table QR #02',
    cuisine: 'Crispy Benne Masala Dosa, Mangalore Bajji & Coffee',
    category: 'iconic_cafe',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.8',
    reviews: 890,
    lastCheck: 'Today, 07:30 AM',
    signals: {
      cold: { title: 'Fresh Dairy Stored < 5°C', subtitle: 'Chilled Milk & Curd' },
      medical: { title: '100% Medical', subtitle: 'Staff Screened' },
      pest: { title: 'Pest Safe', subtitle: 'Drains Cleaned Daily' }
    }
  },
  {
    id: 'mtr-bengaluru',
    name: 'MTR - Mavalli Tiffin Room',
    city: 'bengaluru',
    location: 'Lalbagh Road, Bengaluru',
    tableCode: 'Table QR #04',
    cuisine: 'Century-Old Heritage Rava Idli, Dosa & Pure Vegetarian',
    category: 'iconic_cafe',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.9',
    reviews: 1120,
    lastCheck: 'Today, 07:15 AM',
    signals: {
      cold: { title: 'Dairy Stored < 4°C', subtitle: 'Pure Ghee Quality' },
      medical: { title: '100% Medical', subtitle: 'Form 1A Cleared' },
      pest: { title: 'Pest Safe', subtitle: 'Kitchen Sanitized' }
    }
  },
  {
    id: 'empire-restaurant',
    name: 'Empire Restaurant',
    city: 'bengaluru',
    location: 'Church Street & Koramangala, Bengaluru',
    tableCode: 'Table QR #16',
    cuisine: 'Empire Special Ghee Rice, Chicken Kebab & Grill',
    category: 'swiggy_popular',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.7',
    reviews: 1740,
    lastCheck: 'Today, 10:15 AM',
    signals: {
      cold: { title: 'Grill Core ≥ 75°C', subtitle: 'Hot Meat Inspection' },
      medical: { title: '100% Medical', subtitle: 'Kitchen Crew Tested' },
      pest: { title: 'Pest Safe', subtitle: 'Sanitized Nightly' }
    }
  }
];
