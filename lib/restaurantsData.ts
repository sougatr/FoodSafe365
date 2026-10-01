export interface RestaurantItem {
  id: string;
  name: string;
  city: 'mumbai' | 'delhi' | 'bengaluru' | 'kolkata' | 'hyderabad' | 'agra' | 'chandigarh' | 'jaipur' | 'pan-india' | string;
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
  },

  // --- KOLKATA DINING & SWIGGY ICONS ---
  {
    id: 'peter-cat-kolkata',
    name: 'Peter Cat',
    city: 'kolkata',
    location: 'Park Street, Kolkata',
    tableCode: 'Table QR #07',
    cuisine: 'Iconic Chelo Kebab, Sizzlers & Continental Classic',
    category: 'fine_dine',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.9',
    reviews: 1850,
    lastCheck: 'Today, 10:30 AM',
    signals: {
      cold: { title: 'Butter & Meat < 4°C', subtitle: 'Cold Chain Maintained' },
      medical: { title: '100% Medical', subtitle: 'Form 1A Certified' },
      pest: { title: 'Pest Safe', subtitle: 'Zero Pest Activity' }
    }
  },
  {
    id: 'mocambo-kolkata',
    name: 'Mocambo',
    city: 'kolkata',
    location: 'Park Street, Kolkata',
    tableCode: 'Table QR #11',
    cuisine: 'Heritage Devilled Crab, Beckti Bell Vue & Steaks',
    category: 'fine_dine',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.8',
    reviews: 1420,
    lastCheck: 'Today, 09:45 AM',
    signals: {
      cold: { title: 'Seafood Chilled < 2°C', subtitle: 'Ice Slush Stored' },
      medical: { title: '100% Medical', subtitle: 'Stool Test Cleared' },
      pest: { title: 'Pest Safe', subtitle: 'Nightly Pest Trap Check' }
    }
  },
  {
    id: 'flurys-kolkata',
    name: 'Flurys Tearoom & Confectionery',
    city: 'kolkata',
    location: 'Park Street, Kolkata',
    tableCode: 'Table QR #03',
    cuisine: 'English Breakfast, Rum Balls, Viennese Pastries & Coffee',
    category: 'iconic_cafe',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.8',
    reviews: 1640,
    lastCheck: 'Today, 08:00 AM',
    signals: {
      cold: { title: 'Dairy & Cream < 4°C', subtitle: 'Bakery Chillers OK' },
      medical: { title: '100% Medical', subtitle: 'All Bakers Certified' },
      pest: { title: 'Pest Safe', subtitle: 'Bakery Fly-Traps Active' }
    }
  },
  {
    id: 'arsalan-kolkata',
    name: 'Arsalan',
    city: 'kolkata',
    location: 'Park Circus & Ripon Street, Kolkata',
    tableCode: 'Table QR #18',
    cuisine: 'Kolkata Mutton Biryani, Chicken Chaap & Firni',
    category: 'swiggy_popular',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.8',
    reviews: 3200,
    lastCheck: 'Today, 11:00 AM',
    signals: {
      cold: { title: 'Dum Handi Core ≥ 80°C', subtitle: 'Piping Hot Safe Temp' },
      medical: { title: '100% Medical', subtitle: 'Staff Health Screened' },
      pest: { title: 'Pest Safe', subtitle: 'Clean Grease Traps' }
    }
  },
  {
    id: 'aminia-kolkata',
    name: 'Aminia',
    city: 'kolkata',
    location: 'New Market & Golpark, Kolkata',
    tableCode: 'Table QR #09',
    cuisine: 'Classic Kolkata Awadhi Biryani, Rezala & Kebabs',
    category: 'swiggy_popular',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.7',
    reviews: 2150,
    lastCheck: 'Today, 10:15 AM',
    signals: {
      cold: { title: 'Cold Room < 4°C', subtitle: 'Meat Stored Separately' },
      medical: { title: '100% Medical', subtitle: 'Form 1A Updated' },
      pest: { title: 'Pest Safe', subtitle: 'Certified Monthly' }
    }
  },
  {
    id: 'shiraz-golden-kolkata',
    name: 'Shiraz Golden Restaurant',
    city: 'kolkata',
    location: 'Mullick Bazar, Park Street Ext., Kolkata',
    tableCode: 'Table QR #14',
    cuisine: 'Legendary Mutton Chaap, Shahi Biryani & Parathas',
    category: 'swiggy_popular',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.7',
    reviews: 1390,
    lastCheck: 'Today, 10:45 AM',
    signals: {
      cold: { title: 'Raw Meat Bottom Shelf', subtitle: 'FSSAI Cross-Contam OK' },
      medical: { title: '100% Medical', subtitle: 'Medical Checkups 6-mo' },
      pest: { title: 'Pest Safe', subtitle: 'Insect Killers On' }
    }
  },
  {
    id: '6-ballygunge-place',
    name: '6 Ballygunge Place',
    city: 'kolkata',
    location: 'Ballygunge & Sector V, Kolkata',
    tableCode: 'Table QR #05',
    cuisine: 'Traditional Bengali Daab Chingri, Kosha Mangsho & Bhetki Paturi',
    category: 'fine_dine',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.9',
    reviews: 1670,
    lastCheck: 'Today, 09:30 AM',
    signals: {
      cold: { title: 'Mustard Pastes Chilled', subtitle: 'Fresh Prep < 5°C' },
      medical: { title: '100% Medical', subtitle: 'Staff Stool Tests Done' },
      pest: { title: 'Pest Safe', subtitle: 'Kitchen Walls Sanitized' }
    }
  },
  {
    id: 'kusum-rolls-kolkata',
    name: 'Kusum Rolls',
    city: 'kolkata',
    location: 'Park Street, Kolkata',
    tableCode: 'Counter QR #01',
    cuisine: 'Iconic Kolkata Kathi Rolls, Egg-Chicken & Paneer Rolls',
    category: 'swiggy_popular',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.8',
    reviews: 2450,
    lastCheck: 'Today, 11:30 AM',
    signals: {
      cold: { title: 'Tawa Heat > 120°C', subtitle: 'Fresh Cooked On-Order' },
      medical: { title: '100% Medical', subtitle: 'Handlers Wear Gloves' },
      pest: { title: 'Pest Safe', subtitle: 'Clean Prep Counters' }
    }
  },
  {
    id: 'oudh-1590-kolkata',
    name: 'Oudh 1590',
    city: 'kolkata',
    location: 'Deshapriya Park & Salt Lake, Kolkata',
    tableCode: 'Table QR #06',
    cuisine: 'Period Dining Awadhi Biryani, Galawati Kebab & Raan',
    category: 'fine_dine',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.8',
    reviews: 1290,
    lastCheck: 'Today, 10:00 AM',
    signals: {
      cold: { title: 'Slow-Cooked > 85°C', subtitle: 'Copper Handi Sealed' },
      medical: { title: '100% Medical', subtitle: 'FoSTaC Certified Super' },
      pest: { title: 'Pest Safe', subtitle: 'Bait Stations Clean' }
    }
  },
  {
    id: 'balaram-mullick-kolkata',
    name: 'Balaram Mullick & Radharaman Mullick',
    city: 'kolkata',
    location: 'Bhowanipore & Ballygunge, Kolkata',
    tableCode: 'Counter QR #02',
    cuisine: 'Century-Old Mishti Doi, Baked Rosogolla, Sandesh & Sweets',
    category: 'iconic_cafe',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.9',
    reviews: 3100,
    lastCheck: 'Today, 08:30 AM',
    signals: {
      cold: { title: 'Chilled Displays < 4°C', subtitle: 'Milk Products Safe' },
      medical: { title: '100% Medical', subtitle: 'Sweetmakers Form 1A' },
      pest: { title: 'Pest Safe', subtitle: 'Fly-Screens Intact' }
    }
  },

  // --- HYDERABAD DINING & SWIGGY ICONS ---
  {
    id: 'paradise-biryani-hyderabad',
    name: 'Paradise Biryani',
    city: 'hyderabad',
    location: 'Secunderabad & Hitec City, Hyderabad',
    tableCode: 'Table QR #10',
    cuisine: 'World Famous Hyderabadi Dum Biryani, Mirchi Ka Salan & Double Ka Meetha',
    category: 'swiggy_popular',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.8',
    reviews: 4500,
    lastCheck: 'Today, 11:15 AM',
    signals: {
      cold: { title: 'Dum Handi Core ≥ 82°C', subtitle: 'Thermal Probe Passed' },
      medical: { title: '100% Medical', subtitle: 'Form 1A & Stool Cleared' },
      pest: { title: 'Pest Safe', subtitle: 'Certified Commercial' }
    }
  },
  {
    id: 'bawarchi-hyderabad',
    name: 'Bawarchi Restaurant',
    city: 'hyderabad',
    location: 'RTC X Roads, Hyderabad',
    tableCode: 'Table QR #15',
    cuisine: 'Authentic Hyderabadi Mutton Biryani, Boti Kebab & Tandoori',
    category: 'swiggy_popular',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.8',
    reviews: 3890,
    lastCheck: 'Today, 10:45 AM',
    signals: {
      cold: { title: 'Cold Storage < 3°C', subtitle: 'Fresh Marinated Meat' },
      medical: { title: '100% Medical', subtitle: 'Staff Tested 6-mo' },
      pest: { title: 'Pest Safe', subtitle: 'Kitchen Drain De-greased' }
    }
  },
  {
    id: 'shah-ghouse-hyderabad',
    name: 'Shah Ghouse Cafe & Restaurant',
    city: 'hyderabad',
    location: 'Tolichowki & Charminar, Hyderabad',
    tableCode: 'Table QR #12',
    cuisine: 'Special Mutton Biryani, Irani Chai, Haleem & Paya',
    category: 'swiggy_popular',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.7',
    reviews: 2980,
    lastCheck: 'Today, 09:15 AM',
    signals: {
      cold: { title: 'Haleem Pot ≥ 85°C', subtitle: 'Continuous Core Heat' },
      medical: { title: '100% Medical', subtitle: 'Form 1A Certified' },
      pest: { title: 'Pest Safe', subtitle: 'Sanitized Daily' }
    }
  },
  {
    id: 'pista-house-hyderabad',
    name: 'Pista House',
    city: 'hyderabad',
    location: 'Charminar & Gachibowli, Hyderabad',
    tableCode: 'Table QR #08',
    cuisine: 'GI-Tagged Hyderabadi Haleem, Zafrani Biryani & Bakery Delights',
    category: 'swiggy_popular',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.8',
    reviews: 3410,
    lastCheck: 'Today, 10:30 AM',
    signals: {
      cold: { title: 'Cold Room < 4°C', subtitle: 'Raw Ingredients Safe' },
      medical: { title: '100% Medical', subtitle: 'All Handlers Certified' },
      pest: { title: 'Pest Safe', subtitle: 'Pest Traps Monitored' }
    }
  },
  {
    id: 'cafe-niloufer-hyderabad',
    name: 'Cafe Niloufer',
    city: 'hyderabad',
    location: 'Red Hills & Banjara Hills, Hyderabad',
    tableCode: 'Table QR #04',
    cuisine: 'Iconic Malai Chai, Osmania Biscuits, Bun Maska & Puffs',
    category: 'iconic_cafe',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.9',
    reviews: 4200,
    lastCheck: 'Today, 07:45 AM',
    signals: {
      cold: { title: 'Dairy Chilled < 4°C', subtitle: 'Fresh Milk Storage' },
      medical: { title: '100% Medical', subtitle: 'Bakers Form 1A' },
      pest: { title: 'Pest Safe', subtitle: 'Spotless Counters' }
    }
  },
  {
    id: 'chutneys-hyderabad',
    name: 'Chutneys',
    city: 'hyderabad',
    location: 'Banjara Hills & Jubilee Hills, Hyderabad',
    tableCode: 'Table QR #09',
    cuisine: 'Steam Dosa, Guntur Idli, 6 Assorted Fresh Chutneys & Thalis',
    category: 'fine_dine',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.8',
    reviews: 2150,
    lastCheck: 'Today, 08:30 AM',
    signals: {
      cold: { title: 'Chutneys Freshly Made', subtitle: 'Chilled < 5°C Batch' },
      medical: { title: '100% Medical', subtitle: 'Supervisor FoSTaC' },
      pest: { title: 'Pest Safe', subtitle: 'Zero Insect Activity' }
    }
  },
  {
    id: 'karachi-bakery-hyderabad',
    name: 'Karachi Bakery',
    city: 'hyderabad',
    location: 'Mozamjahi Market & Banjara Hills, Hyderabad',
    tableCode: 'Counter QR #03',
    cuisine: 'Legendary Fruit Biscuits, Cashew Cookies, Plum Cake & Pastries',
    category: 'iconic_cafe',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.8',
    reviews: 3600,
    lastCheck: 'Today, 09:00 AM',
    signals: {
      cold: { title: 'Bakery Chillers < 4°C', subtitle: 'Butter & Creams OK' },
      medical: { title: '100% Medical', subtitle: 'Form 1A Current' },
      pest: { title: 'Pest Safe', subtitle: 'Clean Packaging Hub' }
    }
  },
  {
    id: 'minerva-coffee-shop-hyderabad',
    name: 'Minerva Coffee Shop',
    city: 'hyderabad',
    location: 'Himayatnagar & Somajiguda, Hyderabad',
    tableCode: 'Table QR #06',
    cuisine: 'Filter Coffee, Button Vada, Mysore Bonda & South Indian Meals',
    category: 'iconic_cafe',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.7',
    reviews: 1890,
    lastCheck: 'Today, 08:15 AM',
    signals: {
      cold: { title: 'Fresh Batter Refrig < 5°C', subtitle: 'Controlled Ferm' },
      medical: { title: '100% Medical', subtitle: 'Staff Hygiene Clean' },
      pest: { title: 'Pest Safe', subtitle: 'Kitchen Drain Clean' }
    }
  },

  // --- AGRA DINING & SWIGGY ICONS ---
  {
    id: 'peshawri-itc-mughal-agra',
    name: 'Peshawri - ITC Mughal',
    city: 'agra',
    location: 'Fatehabad Road, Agra',
    tableCode: 'Table QR #02',
    cuisine: 'Royal Dal Bukhara, Sikandari Raan, Murgh Malai Kebab & Tandoori',
    category: 'fine_dine',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.9',
    reviews: 980,
    lastCheck: 'Today, 10:15 AM',
    signals: {
      cold: { title: 'Chiller Temp 2.8°C', subtitle: 'Cold Storage Verified' },
      medical: { title: '100% Medical', subtitle: 'Hospital Grade Testing' },
      pest: { title: 'Pest Safe', subtitle: 'Zero Pest Activity' }
    }
  },
  {
    id: 'pinch-of-spice-agra',
    name: 'Pinch of Spice',
    city: 'agra',
    location: 'Wazirpura & Fatehabad Road, Agra',
    tableCode: 'Table QR #08',
    cuisine: 'Murg Boti Masala, Paneer Lababdar & North Indian Gourmet',
    category: 'fine_dine',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.8',
    reviews: 1650,
    lastCheck: 'Today, 10:45 AM',
    signals: {
      cold: { title: 'Cooked Food ≥ 76°C', subtitle: 'Core Probe Passed' },
      medical: { title: '100% Medical', subtitle: 'Form 1A Certified' },
      pest: { title: 'Pest Safe', subtitle: 'Kitchen UV Traps On' }
    }
  },
  {
    id: 'dasaprakash-agra',
    name: 'Dasaprakash',
    city: 'agra',
    location: 'Meher Cinema Complex, Gwalior Road, Agra',
    tableCode: 'Table QR #05',
    cuisine: 'Pure Vegetarian South Indian Dosa, Thali & Ice Cream Desserts',
    category: 'swiggy_popular',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.7',
    reviews: 1200,
    lastCheck: 'Today, 08:45 AM',
    signals: {
      cold: { title: 'Sambhar Hot > 75°C', subtitle: 'Fresh Steam Station' },
      medical: { title: '100% Medical', subtitle: 'Staff Screened' },
      pest: { title: 'Pest Safe', subtitle: 'Screens All Closed' }
    }
  },
  {
    id: 'panchhi-petha-agra',
    name: 'Panchhi Petha Store',
    city: 'agra',
    location: 'Hari Parbat & Sadar Bazar, Agra',
    tableCode: 'Counter QR #01',
    cuisine: 'Original Agra Petha, Kesar Petha, Paan Petha & Dalmoth',
    category: 'swiggy_popular',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.8',
    reviews: 2890,
    lastCheck: 'Today, 09:30 AM',
    signals: {
      cold: { title: 'Hygienic Sealed Pack', subtitle: 'Food-Grade Materials' },
      medical: { title: '100% Medical', subtitle: 'Sweetmakers Cleared' },
      pest: { title: 'Pest Safe', subtitle: 'Sealed Glass Counters' }
    }
  },
  {
    id: 'mama-chicken-agra',
    name: 'Mama Chicken Mama Franky',
    city: 'agra',
    location: 'Sadar Bazar, Agra Cantt, Agra',
    tableCode: 'Table QR #03',
    cuisine: 'Famous Franky Rolls, Tandoori Chicken, Butter Chicken & Naans',
    category: 'swiggy_popular',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.7',
    reviews: 1450,
    lastCheck: 'Today, 11:30 AM',
    signals: {
      cold: { title: 'Tandoori Core ≥ 78°C', subtitle: 'Thoroughly Cooked' },
      medical: { title: '100% Medical', subtitle: 'Clean Handwash Station' },
      pest: { title: 'Pest Safe', subtitle: 'Pedal Bins Covered' }
    }
  },

  // --- CHANDIGARH DINING & SWIGGY ICONS ---
  {
    id: 'pal-dhaba-chandigarh',
    name: 'Pal Dhaba',
    city: 'chandigarh',
    location: 'Sector 28 D, Chandigarh',
    tableCode: 'Table QR #09',
    cuisine: 'Legendary Butter Chicken, Rogan Josh, Dal Makhani & Keema Naan',
    category: 'swiggy_popular',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.8',
    reviews: 2750,
    lastCheck: 'Today, 10:15 AM',
    signals: {
      cold: { title: 'Gravy Stored Hot > 75°C', subtitle: 'Danger Zone Prevented' },
      medical: { title: '100% Medical', subtitle: 'Form 1A Certified' },
      pest: { title: 'Pest Safe', subtitle: 'Floor Drains Clean' }
    }
  },
  {
    id: 'gopal-sweets-chandigarh',
    name: 'Gopal Sweets',
    city: 'chandigarh',
    location: 'Sector 35 & Sector 8, Chandigarh',
    tableCode: 'Table QR #12',
    cuisine: 'Chole Bhature, Dhokla, Rasmalai, Kaju Katli & Punjabi Chaat',
    category: 'swiggy_popular',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.8',
    reviews: 3100,
    lastCheck: 'Today, 08:30 AM',
    signals: {
      cold: { title: 'Dairy & Sweets < 4°C', subtitle: 'Refrigerated Cases' },
      medical: { title: '100% Medical', subtitle: 'Stool Test Cleared' },
      pest: { title: 'Pest Safe', subtitle: 'Daily Pest Check' }
    }
  },
  {
    id: 'virgin-courtyard-chandigarh',
    name: 'Virgin Courtyard',
    city: 'chandigarh',
    location: 'Sector 7 C, Chandigarh',
    tableCode: 'Table QR #04',
    cuisine: 'Mediterranean Italian Fine Dining, Wood-Fired Pizza & Pasta',
    category: 'fine_dine',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.9',
    reviews: 1120,
    lastCheck: 'Today, 10:45 AM',
    signals: {
      cold: { title: 'Cheese & Cold Cuts < 3°C', subtitle: 'Imported Chillers OK' },
      medical: { title: '100% Medical', subtitle: 'Hospital Screened' },
      pest: { title: 'Pest Safe', subtitle: 'Courtyard Pest Shield' }
    }
  },
  {
    id: 'nik-bakers-chandigarh',
    name: 'Nik Baker\'s',
    city: 'chandigarh',
    location: 'Sector 9 & Sector 35, Chandigarh',
    tableCode: 'Table QR #07',
    cuisine: 'Gourmet Red Velvet, Bagels, Quiches, Shakes & Aussie Pastries',
    category: 'iconic_cafe',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.8',
    reviews: 2400,
    lastCheck: 'Today, 09:00 AM',
    signals: {
      cold: { title: 'Bakery Chillers < 4°C', subtitle: 'Whipped Cream Safe' },
      medical: { title: '100% Medical', subtitle: 'All Bakers Form 1A' },
      pest: { title: 'Pest Safe', subtitle: 'Fly-Screens Intact' }
    }
  },
  {
    id: 'sindhi-sweets-chandigarh',
    name: 'Sindhi Sweets',
    city: 'chandigarh',
    location: 'Sector 17, Chandigarh',
    tableCode: 'Table QR #06',
    cuisine: 'Pani Puri, Pav Bhaji, Pure Ghee Desi Sweets & Quick Bites',
    category: 'swiggy_popular',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.7',
    reviews: 1850,
    lastCheck: 'Today, 09:30 AM',
    signals: {
      cold: { title: 'Water Filtered RO Safe', subtitle: 'UV Purified Water' },
      medical: { title: '100% Medical', subtitle: 'Handlers Form 1A' },
      pest: { title: 'Pest Safe', subtitle: 'Kitchen Cleansed' }
    }
  },

  // --- JAIPUR DINING & SWIGGY ICONS ---
  {
    id: 'lmb-jaipur',
    name: 'LMB - Laxmi Mishtan Bhandar',
    city: 'jaipur',
    location: 'Johari Bazar, Jaipur',
    tableCode: 'Table QR #08',
    cuisine: 'Royal Rajasthani Thali, Paneer Ghewar, Pyaaz Kachori & Ker Sangri',
    category: 'fine_dine',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.8',
    reviews: 2900,
    lastCheck: 'Today, 08:45 AM',
    signals: {
      cold: { title: 'Pure Desi Ghee Tested', subtitle: 'FSSAI Oil Specs OK' },
      medical: { title: '100% Medical', subtitle: 'Form 1A Certified' },
      pest: { title: 'Pest Safe', subtitle: 'Zero Pest Activity' }
    }
  },
  {
    id: 'rawat-mishtan-jaipur',
    name: 'Rawat Mishtan Bhandar',
    city: 'jaipur',
    location: 'Station Road, Jaipur',
    tableCode: 'Table QR #11',
    cuisine: 'World Famous Pyaaz Kachori, Mawa Kachori, Mirchi Vada & Sweets',
    category: 'swiggy_popular',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.9',
    reviews: 4800,
    lastCheck: 'Today, 07:30 AM',
    signals: {
      cold: { title: 'Frying Oil Polar Compounds Safe', subtitle: 'TPM < 25% Verified' },
      medical: { title: '100% Medical', subtitle: 'Staff Medically Cleared' },
      pest: { title: 'Pest Safe', subtitle: 'Nightly Fogging Active' }
    }
  },
  {
    id: 'chokhi-dhani-jaipur',
    name: 'Chokhi Dhani',
    city: 'jaipur',
    location: '12 Miles, Tonk Road, Jaipur',
    tableCode: 'Table QR #20',
    cuisine: 'Authentic Rajasthani Village Thali, Dal Baati Churma & Bajre Ki Roti',
    category: 'fine_dine',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.9',
    reviews: 3600,
    lastCheck: 'Today, 11:00 AM',
    signals: {
      cold: { title: 'Chilled Storage < 4°C', subtitle: 'Milk & Curd Fresh' },
      medical: { title: '100% Medical', subtitle: 'FoSTaC Supervisors' },
      pest: { title: 'Pest Safe', subtitle: 'Resort Wide Traps' }
    }
  },
  {
    id: '1135-ad-jaipur',
    name: '1135 AD - Amer Fort',
    city: 'jaipur',
    location: 'Amer Fort, Jaipur',
    tableCode: 'Table QR #03',
    cuisine: 'Royal Rajputana Laal Maas, Safed Maas, Murgh Tikka & Thalis',
    category: 'fine_dine',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.9',
    reviews: 1350,
    lastCheck: 'Today, 10:30 AM',
    signals: {
      cold: { title: 'Cold Room < 3°C', subtitle: 'Segregated Meat Storage' },
      medical: { title: '100% Medical', subtitle: 'Hospital Certified' },
      pest: { title: 'Pest Safe', subtitle: 'Heritage Enclosure Clean' }
    }
  },
  {
    id: 'handi-jaipur',
    name: 'Handi Restaurant',
    city: 'jaipur',
    location: 'MI Road, Jaipur',
    tableCode: 'Table QR #07',
    cuisine: 'Famous Handi Meat, Rajasthani Laal Maas & Mughlai Tandoor',
    category: 'swiggy_popular',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.7',
    reviews: 2100,
    lastCheck: 'Today, 10:45 AM',
    signals: {
      cold: { title: 'Handi Core ≥ 80°C', subtitle: 'Safe Serving Temp' },
      medical: { title: '100% Medical', subtitle: 'Form 1A Updated' },
      pest: { title: 'Pest Safe', subtitle: 'Sanitized Daily' }
    }
  },
  {
    id: 'tapri-central-jaipur',
    name: 'Tapri Central',
    city: 'jaipur',
    location: 'C-Scheme & Central Park, Jaipur',
    tableCode: 'Table QR #05',
    cuisine: 'Chai Ki Tapri, Bun Maska, Khakhra Pizza, Nachos & Rooftop Cafe',
    category: 'iconic_cafe',
    badge: 'FOODSAFE TODAY VERIFIED',
    score: '4.8',
    reviews: 3200,
    lastCheck: 'Today, 08:00 AM',
    signals: {
      cold: { title: 'Milk Storage < 4°C', subtitle: 'Chilled Dairy' },
      medical: { title: '100% Medical', subtitle: 'Staff Hairnets & Aprons' },
      pest: { title: 'Pest Safe', subtitle: 'Spotless Open Kitchen' }
    }
  }
];
