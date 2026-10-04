/**
 * ThinkMart Product Catalog
 * Shared product data for ThinkMart E-Commerce
 */

const THINKMART_PRODUCTS = [
  {
    id: "tm-laptop-01",
    name: "ThinkBook Pro 15 Laptop",
    brand: "ThinkMart",
    category: "Laptops",
    price: 64990,
    originalPrice: 79990,
    rating: 4.8,
    reviews: 142,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80",
    description: "Intel Core i7 12th Gen, 16GB RAM, 512GB NVMe SSD, 15.6 FHD IPS Anti-Glare Display.",
    discountTag: "18% OFF",
    featured: true
  },
  {
    id: "tm-laptop-02",
    name: "MacBook Air M2 Silver",
    brand: "Apple",
    category: "Laptops",
    price: 94900,
    originalPrice: 114900,
    rating: 4.9,
    reviews: 320,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
    description: "Apple M2 chip with 8-core CPU and 8-core GPU, 8GB Unified Memory, 256GB SSD Storage.",
    discountTag: "17% OFF",
    featured: true
  },
  {
    id: "tm-laptop-03",
    name: "HP Pavilion Gaming Laptop",
    brand: "HP",
    category: "Laptops",
    price: 58990,
    originalPrice: 72990,
    rating: 4.6,
    reviews: 98,
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80",
    description: "AMD Ryzen 5 5600H, GTX 1650 4GB GPU, 16GB DDR4, 512GB SSD, 144Hz FHD Display.",
    discountTag: "19% OFF",
    featured: false
  },
  {
    id: "tm-phone-01",
    name: "Galaxy S24 Ultra 5G",
    brand: "Samsung",
    category: "Smartphones",
    price: 119999,
    originalPrice: 134999,
    rating: 4.9,
    reviews: 215,
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80",
    description: "200MP AI Camera, Snapdragon 8 Gen 3, 12GB RAM, 256GB Storage, Built-in S-Pen.",
    discountTag: "11% OFF",
    featured: true
  },
  {
    id: "tm-phone-02",
    name: "iPhone 15 Pro Titanium",
    brand: "Apple",
    category: "Smartphones",
    price: 127900,
    originalPrice: 139900,
    rating: 4.9,
    reviews: 410,
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80",
    description: "A17 Pro Bionic Chip, 48MP Main Camera, Action Button, Type-C Port, Super Retina XDR.",
    discountTag: "8% OFF",
    featured: true
  },
  {
    id: "tm-phone-03",
    name: "OnePlus 12 5G Flowy Emerald",
    brand: "OnePlus",
    category: "Smartphones",
    price: 64999,
    originalPrice: 69999,
    rating: 4.7,
    reviews: 164,
    image: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=600&q=80",
    description: "Snapdragon 8 Gen 3, 16GB RAM, 512GB Storage, 100W SUPERVOOC Fast Charging.",
    discountTag: "7% OFF",
    featured: false
  },
  {
    id: "tm-watch-01",
    name: "Apple Watch Series 9 GPS",
    brand: "Apple",
    category: "Watches",
    price: 41900,
    originalPrice: 44900,
    rating: 4.8,
    reviews: 189,
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80",
    description: "S9 SiP Chip, Double Tap Gesture, Brighter Display, ECG, Blood Oxygen Monitor.",
    discountTag: "6% OFF",
    featured: true
  },
  {
    id: "tm-watch-02",
    name: "Galaxy Watch6 Classic LTE",
    brand: "Samsung",
    category: "Watches",
    price: 33999,
    originalPrice: 40999,
    rating: 4.6,
    reviews: 87,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
    description: "Rotating Bezel, Sapphire Crystal Glass, Advanced Sleep Coaching, Body Composition.",
    discountTag: "17% OFF",
    featured: false
  },
  {
    id: "tm-audio-01",
    name: "Sony WH-1000XM5 ANC Headphones",
    brand: "Sony",
    category: "Headphones",
    price: 26990,
    originalPrice: 34990,
    rating: 4.9,
    reviews: 512,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
    description: "Industry Leading Noise Cancellation, 30-Hour Battery Life, Crystal Clear Hands-Free Calling.",
    discountTag: "22% OFF",
    featured: true
  },
  {
    id: "tm-audio-02",
    name: "AirPods Pro (2nd Gen) Type-C",
    brand: "Apple",
    category: "Headphones",
    price: 21900,
    originalPrice: 24900,
    rating: 4.8,
    reviews: 380,
    image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80",
    description: "Active Noise Cancellation, Adaptive Audio, Personalised Spatial Audio, MagSafe Charging Case.",
    discountTag: "12% OFF",
    featured: false
  },
  {
    id: "tm-acc-01",
    name: "Anker 20,000mAh Power Bank 65W",
    brand: "Anker",
    category: "Accessories",
    price: 4999,
    originalPrice: 6999,
    rating: 4.7,
    reviews: 290,
    image: "https://images.unsplash.com/photo-1609592424074-b9b519e917d2?auto=format&fit=crop&w=600&q=80",
    description: "Fast Charging for Laptops and Phones, Dual USB-C Ports, Digital Power Status Display.",
    discountTag: "28% OFF",
    featured: true
  },
  {
    id: "tm-acc-02",
    name: "Logitech MX Master 3S Mouse",
    brand: "Logitech",
    category: "Accessories",
    price: 8995,
    originalPrice: 10995,
    rating: 4.9,
    reviews: 440,
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80",
    description: "Quiet Clicks, 8K DPI Any-Surface Tracking, Electromagnetic MagSpeed Scrolling.",
    discountTag: "18% OFF",
    featured: false
  }
];

function getProductById(id) {
  return THINKMART_PRODUCTS.find(p => p.id === id) || null;
}

function getFeaturedProducts() {
  return THINKMART_PRODUCTS.filter(p => p.featured);
}
