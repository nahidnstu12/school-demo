export const mockproducts = [
    // Electronics
    {
      name: 'Premium Wireless Headphones',
      description: 'Premium noise-cancelling wireless headphones with 30-hour battery life and superior sound quality. Perfect for music enthusiasts and professionals alike.',
      price: 299.99,
      category: 'Electronics',
      stock: 25,
      sku: 'ELEC-001',
      featured: true,
      tags: JSON.stringify(['wireless', 'audio', 'noise-cancelling', 'premium']),
      images: [
        { filename: 'headphones1.jpg', mimetype: 'image/jpeg', size: 123456 },
        { filename: 'headphones2.jpg', mimetype: 'image/jpeg', size: 123456 }
      ]
    },
    {
      name: 'Ultra HD Smart TV - 55"',
      description: 'Crystal clear 4K Ultra HD smart television with built-in streaming apps and voice control. Experience your favorite content like never before.',
      price: 849.99,
      category: 'Electronics',
      stock: 10,
      sku: 'ELEC-002',
      featured: true,
      tags: JSON.stringify(['tv', '4k', 'smart-tv', 'entertainment']),
      images: [
        { filename: 'tv1.jpg', mimetype: 'image/jpeg', size: 234567 }
      ]
    },
    {
      name: 'Professional DSLR Camera',
      description: 'Professional-grade DSLR camera with 24.2MP sensor, 4K video recording, and interchangeable lens system. Capture life\'s moments with exceptional clarity.',
      price: 1299.99,
      category: 'Electronics',
      stock: 5,
      sku: 'ELEC-003',
      featured: false,
      tags: JSON.stringify(['camera', 'photography', 'professional', 'dslr']),
      images: [
        { filename: 'camera1.jpg', mimetype: 'image/jpeg', size: 345678 },
        { filename: 'camera2.jpg', mimetype: 'image/jpeg', size: 345678 }
      ]
    },
    {
      name: 'Lightweight Tablet - 10.2"',
      description: 'Versatile, lightweight tablet with 10.2" Retina display, powerful processor, and all-day battery life. Perfect for work and entertainment on the go.',
      price: 429.99,
      category: 'Electronics',
      stock: 30,
      sku: 'ELEC-004',
      featured: false,
      tags: JSON.stringify(['tablet', 'portable', 'touchscreen']),
      images: [
        { filename: 'tablet1.jpg', mimetype: 'image/jpeg', size: 456789 }
      ]
    },
    {
      name: 'Wireless Charging Pad',
      description: 'Fast wireless charging pad compatible with all Qi-enabled devices. Sleek, minimalist design with LED indicator.',
      price: 39.99,
      category: 'Electronics',
      stock: 50,
      sku: 'ELEC-005',
      featured: false,
      tags: JSON.stringify(['wireless', 'charging', 'accessories']),
      images: [
        { filename: 'charger1.jpg', mimetype: 'image/jpeg', size: 56789 }
      ]
    },
    {
      name: 'Smart Home Speaker',
      description: 'Intelligent voice-controlled speaker with premium sound quality and smart home integration. Control your music, get answers, and manage your smart home.',
      price: 129.99,
      category: 'Electronics',
      stock: 0,
      sku: 'ELEC-006',
      featured: false,
      tags: JSON.stringify(['smart-home', 'speakers', 'voice-assistant']),
      images: [
        { filename: 'speaker1.jpg', mimetype: 'image/jpeg', size: 67890 }
      ]
    },
    {
      name: 'Gaming Laptop - 15.6"',
      description: 'High-performance gaming laptop with 15.6" 144Hz display, NVIDIA RTX graphics, and customizable RGB keyboard. Dominate the competition wherever you go.',
      price: 1599.99,
      category: 'Electronics',
      stock: 8,
      sku: 'ELEC-007',
      featured: true,
      tags: JSON.stringify(['gaming', 'laptop', 'high-performance']),
      images: [
        { filename: 'laptop1.jpg', mimetype: 'image/jpeg', size: 789012 },
        { filename: 'laptop2.jpg', mimetype: 'image/jpeg', size: 789012 }
      ]
    },
    
    // Books
    {
      name: 'The Future of AI: A Guide',
      description: 'A comprehensive guide to artificial intelligence, its current applications, and future potential. Learn how AI is reshaping our world and what lies ahead.',
      price: 24.99,
      category: 'Books',
      stock: 45,
      sku: 'BOOK-001',
      featured: false,
      tags: JSON.stringify(['ai', 'technology', 'non-fiction', 'education']),
      images: [
        { filename: 'book-ai.jpg', mimetype: 'image/jpeg', size: 89012 }
      ]
    },
    {
      name: 'Cooking Masterclass Cookbook',
      description: 'A collection of 100+ recipes from world-renowned chefs, with step-by-step instructions and beautiful photography. Elevate your culinary skills.',
      price: 39.99,
      category: 'Books',
      stock: 30,
      sku: 'BOOK-002',
      featured: true,
      tags: JSON.stringify(['cooking', 'food', 'recipes', 'non-fiction']),
      images: [
        { filename: 'cookbook.jpg', mimetype: 'image/jpeg', size: 90123 }
      ]
    },
    {
      name: 'Fantasy Epic: The Crystal Kingdoms',
      description: 'The first book in an epic fantasy series. Follow the journey of unlikely heroes as they discover ancient magic and battle dark forces threatening their world.',
      price: 18.99,
      category: 'Books',
      stock: 60,
      sku: 'BOOK-003',
      featured: false,
      tags: JSON.stringify(['fantasy', 'fiction', 'series']),
      images: [
        { filename: 'fantasy-book.jpg', mimetype: 'image/jpeg', size: 101234 }
      ]
    },
    {
      name: 'Modern Web Development',
      description: 'A comprehensive guide to modern web development, covering the latest frameworks, tools, and best practices. Perfect for aspiring and experienced developers alike.',
      price: 49.99,
      category: 'Books',
      stock: 25,
      sku: 'BOOK-004',
      featured: false,
      tags: JSON.stringify(['programming', 'web-development', 'education', 'technical']),
      images: [
        { filename: 'webdev-book.jpg', mimetype: 'image/jpeg', size: 112345 }
      ]
    },
    
    // Clothing
    {
      name: 'Premium Cotton T-Shirt',
      description: 'Ultra-soft 100% organic cotton t-shirt with a relaxed fit. Available in multiple colors. Ethically sourced and sustainably made.',
      price: 29.99,
      category: 'Clothing',
      stock: 100,
      sku: 'CLTH-001',
      featured: false,
      tags: JSON.stringify(['t-shirt', 'casual', 'cotton', 'sustainable']),
      images: [
        { filename: 'tshirt1.jpg', mimetype: 'image/jpeg', size: 123456 },
        { filename: 'tshirt2.jpg', mimetype: 'image/jpeg', size: 123456 }
      ]
    },
    {
      name: 'Slim Fit Jeans',
      description: 'Classic slim fit jeans made from premium denim with a touch of stretch for comfort. Perfect for everyday wear with timeless style.',
      price: 59.99,
      category: 'Clothing',
      stock: 75,
      sku: 'CLTH-002',
      featured: false,
      tags: JSON.stringify(['jeans', 'denim', 'casual']),
      images: [
        { filename: 'jeans1.jpg', mimetype: 'image/jpeg', size: 234567 }
      ]
    },
    {
      name: 'Waterproof Hiking Jacket',
      description: 'Professional-grade waterproof hiking jacket with breathable fabric and adjustable hood. Designed for outdoor adventures in all weather conditions.',
      price: 149.99,
      category: 'Clothing',
      stock: 40,
      sku: 'CLTH-003',
      featured: true,
      tags: JSON.stringify(['outdoor', 'hiking', 'waterproof', 'jacket']),
      images: [
        { filename: 'jacket1.jpg', mimetype: 'image/jpeg', size: 345678 },
        { filename: 'jacket2.jpg', mimetype: 'image/jpeg', size: 345678 }
      ]
    },
    {
      name: 'Formal Business Suit',
      description: 'Elegant tailored business suit made from premium wool blend. Perfect for professional settings and special occasions.',
      price: 299.99,
      category: 'Clothing',
      stock: 15,
      sku: 'CLTH-004',
      featured: false,
      tags: JSON.stringify(['formal', 'business', 'suit', 'professional']),
      images: [
        { filename: 'suit1.jpg', mimetype: 'image/jpeg', size: 456789 }
      ]
    },
    {
      name: 'Athletic Performance Sneakers',
      description: 'Lightweight, breathable athletic sneakers with responsive cushioning and superior grip. Designed for performance and comfort during intense workouts.',
      price: 119.99,
      category: 'Clothing',
      stock: 60,
      sku: 'CLTH-005',
      featured: true,
      tags: JSON.stringify(['shoes', 'athletic', 'fitness', 'performance']),
      images: [
        { filename: 'sneakers1.jpg', mimetype: 'image/jpeg', size: 567890 },
        { filename: 'sneakers2.jpg', mimetype: 'image/jpeg', size: 567890 }
      ]
    },
    
    // Home & Kitchen
    {
      name: 'Professional Chef Knife Set',
      description: 'Premium 15-piece chef knife set with high-carbon stainless steel blades and ergonomic handles. Everything you need for professional-level food preparation.',
      price: 189.99,
      category: 'Home & Kitchen',
      stock: 30,
      sku: 'HOME-001',
      featured: true,
      tags: JSON.stringify(['kitchen', 'cooking', 'knives', 'chef']),
      images: [
        { filename: 'knives1.jpg', mimetype: 'image/jpeg', size: 678901 },
        { filename: 'knives2.jpg', mimetype: 'image/jpeg', size: 678901 }
      ]
    },
    {
      name: 'Smart Coffee Maker',
      description: 'Programmable smart coffee maker with app control, customizable brewing options, and built-in grinder. Enjoy barista-quality coffee at home.',
      price: 149.99,
      category: 'Home & Kitchen',
      stock: 20,
      sku: 'HOME-002',
      featured: false,
      tags: JSON.stringify(['coffee', 'smart-home', 'kitchen-appliance']),
      images: [
        { filename: 'coffee-maker.jpg', mimetype: 'image/jpeg', size: 789012 }
      ]
    },
    {
      name: 'Luxury Bed Sheet Set - Queen',
      description: '100% Egyptian cotton luxury bed sheet set with 1000 thread count. Includes flat sheet, fitted sheet, and 2 pillowcases. Experience hotel-quality comfort.',
      price: 129.99,
      category: 'Home & Kitchen',
      stock: 45,
      sku: 'HOME-003',
      featured: false,
      tags: JSON.stringify(['bedroom', 'luxury', 'cotton', 'bedding']),
      images: [
        { filename: 'sheets1.jpg', mimetype: 'image/jpeg', size: 890123 }
      ]
    },
    {
      name: 'Non-Stick Cookware Set',
      description: '10-piece non-stick cookware set with durable construction and heat-resistant handles. Dishwasher safe and compatible with all cooktops.',
      price: 199.99,
      category: 'Home & Kitchen',
      stock: 25,
      sku: 'HOME-004',
      featured: false,
      tags: JSON.stringify(['kitchen', 'cooking', 'cookware', 'non-stick']),
      images: [
        { filename: 'cookware1.jpg', mimetype: 'image/jpeg', size: 901234 },
        { filename: 'cookware2.jpg', mimetype: 'image/jpeg', size: 901234 }
      ]
    },
    {
      name: 'Modern Floor Lamp',
      description: 'Stylish modern floor lamp with adjustable brightness and color temperature. Perfect for living rooms, offices, and reading corners.',
      price: 89.99,
      category: 'Home & Kitchen',
      stock: 35,
      sku: 'HOME-005',
      featured: false,
      tags: JSON.stringify(['lighting', 'decor', 'furniture']),
      images: [
        { filename: 'lamp1.jpg', mimetype: 'image/jpeg', size: 123456 }
      ]
    },
    
    // Sports & Outdoors
    {
      name: 'Premium Yoga Mat',
      description: 'Extra thick, non-slip yoga mat made from eco-friendly materials. Provides excellent cushioning and support for all types of yoga and floor exercises.',
      price: 49.99,
      category: 'Sports & Outdoors',
      stock: 50,
      sku: 'SPRT-001',
      featured: false,
      tags: JSON.stringify(['yoga', 'fitness', 'exercise', 'eco-friendly']),
      images: [
        { filename: 'yoga-mat.jpg', mimetype: 'image/jpeg', size: 234567 }
      ]
    },
    {
      name: 'Mountain Bike - 27.5"',
      description: 'High-performance mountain bike with lightweight aluminum frame, 24-speed drivetrain, and hydraulic disc brakes. Conquer any trail with confidence.',
      price: 899.99,
      category: 'Sports & Outdoors',
      stock: 10,
      sku: 'SPRT-002',
      featured: true,
      tags: JSON.stringify(['biking', 'mountain-bike', 'outdoor', 'adventure']),
      images: [
        { filename: 'bike1.jpg', mimetype: 'image/jpeg', size: 345678 },
        { filename: 'bike2.jpg', mimetype: 'image/jpeg', size: 345678 }
      ]
    },
    {
      name: 'Portable Camping Tent - 4 Person',
      description: 'Waterproof 4-person camping tent with easy setup and compact storage. Features ventilation windows and interior storage pockets.',
      price: 129.99,
      category: 'Sports & Outdoors',
      stock: 30,
      sku: 'SPRT-003',
      featured: false,
      tags: JSON.stringify(['camping', 'outdoor', 'tent', 'family']),
      images: [
        { filename: 'tent1.jpg', mimetype: 'image/jpeg', size: 456789 }
      ]
    },
    {
      name: 'Professional Basketball',
      description: 'Official size and weight basketball with premium composite leather construction. Provides excellent grip and durability for indoor and outdoor play.',
      price: 39.99,
      category: 'Sports & Outdoors',
      stock: 45,
      sku: 'SPRT-004',
      featured: false,
      tags: JSON.stringify(['basketball', 'sports', 'ball', 'team-sports']),
      images: [
        { filename: 'basketball.jpg', mimetype: 'image/jpeg', size: 567890 }
      ]
    },
    
    // Beauty & Personal Care
    {
      name: 'Luxury Skincare Set',
      description: 'Complete luxury skincare set featuring cleanser, toner, serum, moisturizer, and eye cream. Made with natural ingredients and suitable for all skin types.',
      price: 149.99,
      category: 'Beauty & Personal Care',
      stock: 25,
      sku: 'BEAUTY-001',
      featured: true,
      tags: JSON.stringify(['skincare', 'beauty', 'luxury', 'natural']),
      images: [
        { filename: 'skincare1.jpg', mimetype: 'image/jpeg', size: 678901 },
        { filename: 'skincare2.jpg', mimetype: 'image/jpeg', size: 678901 }
      ]
    },
    {
      name: 'Professional Hair Dryer',
      description: 'Salon-quality hair dryer with multiple heat and speed settings, ionic technology, and concentrator attachment. Reduce frizz and achieve a professional blowout at home.',
      price: 89.99,
      category: 'Beauty & Personal Care',
      stock: 30,
      sku: 'BEAUTY-002',
      featured: false,
      tags: JSON.stringify(['haircare', 'styling', 'salon', 'professional']),
      images: [
        { filename: 'hairdryer.jpg', mimetype: 'image/jpeg', size: 789012 }
      ]
    },
    {
      name: 'Organic Bath Bomb Set',
      description: 'Set of 12 handcrafted organic bath bombs in various scents. Made with essential oils and natural ingredients for a luxurious bathing experience.',
      price: 34.99,
      category: 'Beauty & Personal Care',
      stock: 0,
      sku: 'BEAUTY-003',
      featured: false,
      tags: JSON.stringify(['bath', 'organic', 'relaxation', 'self-care']),
      images: [
        { filename: 'bathbombs.jpg', mimetype: 'image/jpeg', size: 890123 }
      ]
    },
    
    // Toys & Games
    {
      name: 'Educational Building Blocks Set',
      description: 'STEM-focused building blocks set with 500+ pieces. Encourages creativity, problem-solving, and fine motor skills. Suitable for ages 6 and up.',
      price: 49.99,
      category: 'Toys & Games',
      stock: 40,
      sku: 'TOY-001',
      featured: true,
      tags: JSON.stringify(['educational', 'building-blocks', 'stem', 'kids']),
      images: [
        { filename: 'blocks1.jpg', mimetype: 'image/jpeg', size: 901234 },
        { filename: 'blocks2.jpg', mimetype: 'image/jpeg', size: 901234 }
      ]
    },
    {
      name: 'Strategy Board Game',
      description: 'Engaging strategy board game for 2-6 players. Develop your civilization, form alliances, and conquer territories. Perfect for game nights.',
      price: 59.99,
      category: 'Toys & Games',
      stock: 25,
      sku: 'TOY-002',
      featured: false,
      tags: JSON.stringify(['board-game', 'strategy', 'family', 'entertainment']),
      images: [
        { filename: 'boardgame.jpg', mimetype: 'image/jpeg', size: 123456 }
      ]
    },
    {
      name: 'Remote Control Racing Car',
      description: 'High-speed remote control racing car with responsive controls and durable construction. Includes rechargeable battery for extended play time.',
      price: 69.99,
      category: 'Toys & Games',
      stock: 35,
      sku: 'TOY-003',
      featured: false,
      tags: JSON.stringify(['rc-car', 'racing', 'remote-control', 'kids']),
      images: [
        { filename: 'rccar.jpg', mimetype: 'image/jpeg', size: 234567 }
      ]
    },
    
    // Health & Wellness
    {
      name: 'Smart Fitness Watch',
      description: 'Advanced fitness tracker with heart rate monitoring, sleep tracking, GPS, and 20+ exercise modes. Stay motivated and achieve your fitness goals.',
      price: 129.99,
      category: 'Health & Wellness',
      stock: 30,
      sku: 'HEALTH-001',
      featured: true,
      tags: JSON.stringify(['fitness', 'wearable', 'smart-watch', 'health-tracking']),
      images: [
        { filename: 'fitnesswatch.jpg', mimetype: 'image/jpeg', size: 345678 },
        { filename: 'fitnesswatch2.jpg', mimetype: 'image/jpeg', size: 345678 }
      ]
    },
    {
      name: 'Massage Therapy Gun',
      description: 'Professional-grade massage therapy gun with 6 interchangeable heads and 5 speed settings. Relieve muscle soreness and improve recovery time.',
      price: 149.99,
      category: 'Health & Wellness',
      stock: 20,
      sku: 'HEALTH-002',
      featured: false,
      tags: JSON.stringify(['massage', 'recovery', 'fitness', 'muscle-therapy']),
      images: [
        { filename: 'massagegun.jpg', mimetype: 'image/jpeg', size: 456789 }
      ]
    },
    {
      name: 'Digital Food Scale',
      description: 'Precise digital food scale with nutritional calculator. Track calories, macros, and portion sizes for a healthier lifestyle.',
      price: 29.99,
      category: 'Health & Wellness',
      stock: 0,
      sku: 'HEALTH-003',
      featured: false,
      tags: JSON.stringify(['kitchen', 'nutrition', 'diet', 'food-scale']),
      images: [
        { filename: 'foodscale.jpg', mimetype: 'image/jpeg', size: 567890 }
      ]
    }
  ];

  import { v4 as uuidv4 } from 'uuid';

// Define teacher specializations
const specializations = [
  'Mathematics', 
  'Physics', 
  'Chemistry', 
  'Biology', 
  'English Literature',
  'History', 
  'Geography', 
  'Computer Science', 
  'Physical Education',
  'Art', 
  'Music', 
  'Economics', 
  'Business Studies',
  'Foreign Languages', 
  'Social Sciences'
];

// Define designations
const designations = [
  'Junior Teacher',
  'Senior Teacher',
  'Head of Department',
  'Assistant Professor',
  'Associate Professor',
  'Professor',
  'Lecturer',
  'Visiting Faculty',
  'Teaching Assistant',
  'Subject Coordinator'
];

// Helper to get random item from array
const getRandomItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Helper to create a random date between two dates
const randomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Create mock teacher data generator
const generateMockTeacher = (index: number) => {
  const firstName = `Teacher${index}`;
  const lastName = `Last${index}`;
  const id = uuidv4();
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 10000)}@example.com`;
  
  return {
    id,
    firstName,
    lastName,
    email,
    phone: `+1${Math.floor(Math.random() * 10000000000).toString().padStart(10, '0')}`,
    designation: getRandomItem(designations),
    specialization: getRandomItem(specializations),
    joiningDate: randomDate(new Date('2015-01-01'), new Date()).toISOString(),
    address: `${Math.floor(Math.random() * 1000) + 1} Main St, City ${Math.floor(Math.random() * 100) + 1}`,
    district: `District ${Math.floor(Math.random() * 20) + 1}`,
    education: {
      degree: getRandomItem(['Bachelor of Education', 'Master of Education', 'Ph.D. in Education', 'Master of Arts', 'Bachelor of Science', 'Master of Science', 'Ph.D.']),
      university: getRandomItem(['State University', 'National University', 'City College', 'Technical Institute', 'International University']),
      graduationYear: Math.floor(Math.random() * 20) + 2000
    },
    certifications: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => 
      getRandomItem([
        'Teaching Certification',
        'Subject Matter Expert',
        'Educational Leadership',
        'Special Education',
        'Technology in Education',
        'Advanced Instructional Methods',
        'Curriculum Development'
      ])
    ),
    yearsOfExperience: Math.floor(Math.random() * 20) + 1,
    status: Math.random() > 0.1 // 90% active
  };
};

// Generate data for 500 teachers (50 teachers per 10 institutions)
export const mockTeachers = Array.from({ length: 100 }, (_, i) => generateMockTeacher(i + 1));


// {
//   "id": "cm93ri2c701ptgvpdcuvx7sew",
//   "institutionId": "cm93r6vwq000ngvpde7kgvthn",
//   "userId": "cm93ri27501ongvpdonlh62tk",
//   "pdsId": null,
//   "designation": "Teaching Assistant",
//   "joiningDate": "2025-04-02T02:23:56.762Z",
//   "address": "347 Main St, City 53",
//   "district": "District 12",
//   "specialization": "Art",
//   "status": false,
//   "createdAt": "2025-04-05T05:17:21.994Z",
//   "updatedAt": "2025-04-05T05:17:21.994Z",
//   "deleted": false,
//   "user": {
//       "id": "cm93ri27501ongvpdonlh62tk",
//       "avatar": null,
//       "firstName": "Teacher288",
//       "lastName": "Last288",
//       "phone": "+14103023273",
//       "status": true,
//       "email": "teacher288.last288758@example.com",
//       "emailVerifiedAt": null,
//       "password": "$2b$12$qJJWWpNo6xwR5gqKLoSMB.hdMyX5OeEVkVTkufnswYEdboXjFW9kC",
//       "role": "TEACHER",
//       "rememberToken": null,
//       "createdAt": "2025-04-05T05:17:21.916Z",
//       "updatedAt": "2025-04-05T05:17:21.916Z",
//       "deleted": false
//   },
//   "institution": {
//       "id": "cm93r6vwq000ngvpde7kgvthn",
//       "userId": "cm93r6vuu0005gvpdc4rf1aie",
//       "uuid": "2e97dea7-92f1-4f54-a506-56fd2253fdd1",
//       "name": "Institution 6",
//       "registrationNo": null,
//       "noOfStudents": null,
//       "noOfTeachers": null,
//       "type": "PRIMARY_SCHOOL",
//       "coverPhoto": "cm93r6uj40002gvpd4j1am4jw",
//       "logo": "cm93r6uid0000gvpd9tkarjdo",
//       "location": "Address 6",
//       "contactNumber": "+12345678905",
//       "address": "Street 6, City",
//       "status": true,
//       "limit": null,
//       "extraInfos": {
//           "details": "Additional information"
//       },
//       "createdAt": "2025-04-05T05:08:40.548Z",
//       "updatedAt": "2025-04-05T05:08:40.548Z",
//       "deleted": false
//   }
// }