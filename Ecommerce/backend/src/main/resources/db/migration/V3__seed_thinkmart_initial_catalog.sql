-- ==============================================================================
-- Flyway Migration V3: Seed Initial Product Catalog
-- Seeds the 5 canonical categories and 12 official products.
-- ZERO user accounts or passwords are in this script.
-- Uses idempotent upsert syntax to guarantee repeatable, safe execution.
-- ==============================================================================

-- 1. Insert Categories
INSERT INTO categories (id, name, slug, icon, description, display_order)
VALUES
    (1, 'Laptops', 'laptops', '💻', 'High performance, gaming and ultrabooks', 1),
    (2, 'Smartphones', 'smartphones', '📱', '5G flagships and value smartphones', 2),
    (3, 'Watches', 'watches', '⌚', 'Smartwatches, fitness and health trackers', 3),
    (4, 'Headphones', 'headphones', '🎧', 'Wireless earbuds and noise cancelling audio', 4),
    (5, 'Accessories', 'accessories', '🔌', 'Power banks, ergonomic mice, chargers and cables', 5)
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    icon = VALUES(icon),
    description = VALUES(description),
    display_order = VALUES(display_order);

-- 2. Insert Products
INSERT INTO products (id, name, brand, category_id, price, original_price, rating, reviews_count, image_url, description, discount_tag, featured, stock_quantity)
VALUES
    ('tm-laptop-01', 'ThinkBook Pro 15 Laptop', 'ThinkMart', 1, 64990.00, 79990.00, 4.8, 142,
     'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80',
     'Intel Core i7 12th Gen, 16GB RAM, 512GB NVMe SSD, 15.6 FHD IPS Anti-Glare Display.', '18% OFF', TRUE, 45),

    ('tm-laptop-02', 'MacBook Air M2 Silver', 'Apple', 1, 94900.00, 114900.00, 4.9, 320,
     'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
     'Apple M2 chip with 8-core CPU and 8-core GPU, 8GB Unified Memory, 256GB SSD Storage.', '17% OFF', TRUE, 30),

    ('tm-laptop-03', 'HP Pavilion Gaming Laptop', 'HP', 1, 58990.00, 72990.00, 4.6, 98,
     'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80',
     'AMD Ryzen 5 5600H, GTX 1650 4GB GPU, 16GB DDR4, 512GB SSD, 144Hz FHD Display.', '19% OFF', FALSE, 25),

    ('tm-phone-01', 'Galaxy S24 Ultra 5G', 'Samsung', 2, 119999.00, 134999.00, 4.9, 215,
     'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80',
     '200MP AI Camera, Snapdragon 8 Gen 3, 12GB RAM, 256GB Storage, Built-in S-Pen.', '11% OFF', TRUE, 40),

    ('tm-phone-02', 'iPhone 15 Pro Titanium', 'Apple', 2, 127900.00, 139900.00, 4.9, 410,
     'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80',
     'A17 Pro Bionic Chip, 48MP Main Camera, Action Button, Type-C Port, Super Retina XDR.', '8% OFF', TRUE, 35),

    ('tm-phone-03', 'OnePlus 12 5G Flowy Emerald', 'OnePlus', 2, 64999.00, 69999.00, 4.7, 164,
     'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=600&q=80',
     'Snapdragon 8 Gen 3, 16GB RAM, 512GB Storage, 100W SUPERVOOC Fast Charging.', '7% OFF', FALSE, 50),

    ('tm-watch-01', 'Apple Watch Series 9 GPS', 'Apple', 3, 41900.00, 44900.00, 4.8, 189,
     'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80',
     'S9 SiP Chip, Double Tap Gesture, Brighter Display, ECG, Blood Oxygen Monitor.', '6% OFF', TRUE, 40),

    ('tm-watch-02', 'Galaxy Watch6 Classic LTE', 'Samsung', 3, 33999.00, 40999.00, 4.6, 87,
     'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
     'Rotating Bezel, Sapphire Crystal Glass, Advanced Sleep Coaching, Body Composition.', '17% OFF', FALSE, 30),

    ('tm-audio-01', 'Sony WH-1000XM5 ANC Headphones', 'Sony', 4, 26990.00, 34990.00, 4.9, 512,
     'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
     'Industry Leading Noise Cancellation, 30-Hour Battery Life, Crystal Clear Hands-Free Calling.', '22% OFF', TRUE, 60),

    ('tm-audio-02', 'AirPods Pro (2nd Gen) Type-C', 'Apple', 4, 21900.00, 24900.00, 4.8, 380,
     'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80',
     'Active Noise Cancellation, Adaptive Audio, Personalised Spatial Audio, MagSafe Charging Case.', '12% OFF', FALSE, 55),

    ('tm-acc-01', 'Anker 20,000mAh Power Bank 65W', 'Anker', 5, 4999.00, 6999.00, 4.7, 290,
     'https://images.unsplash.com/photo-1609592424074-b9b519e917d2?auto=format&fit=crop&w=600&q=80',
     'Fast Charging for Laptops and Phones, Dual USB-C Ports, Digital Power Status Display.', '28% OFF', TRUE, 80),

    ('tm-acc-02', 'Logitech MX Master 3S Mouse', 'Logitech', 5, 8995.00, 10995.00, 4.9, 440,
     'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80',
     'Quiet Clicks, 8K DPI Any-Surface Tracking, Electromagnetic MagSpeed Scrolling.', '18% OFF', FALSE, 70)
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    brand = VALUES(brand),
    category_id = VALUES(category_id),
    price = VALUES(price),
    original_price = VALUES(original_price),
    rating = VALUES(rating),
    reviews_count = VALUES(reviews_count),
    image_url = VALUES(image_url),
    description = VALUES(description),
    discount_tag = VALUES(discount_tag),
    featured = VALUES(featured),
    stock_quantity = VALUES(stock_quantity);

