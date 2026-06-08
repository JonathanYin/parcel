import { Category, Product, categories } from "./types";

const catalog: Record<Category, Array<[string, number, string, string]>> = {
  Computers: [
    ["NovaBook Air 14", 899, "💻", "Featherlight laptop for everyday creative work."],
    ["PixelForge Mini PC", 549, "🖥️", "Tiny desktop with surprisingly big performance."],
    ["CloudView 27-inch Display", 279, "🖥️", "Crisp 4K display with an ultra-clean profile."],
    ["Orbit Mechanical Keyboard", 89, "⌨️", "Tactile, quiet, and built for long sessions."],
    ["Drift Wireless Mouse", 49, "🖱️", "Ergonomic precision with a two-year battery."],
    ["Studio Webcam Pro", 129, "📷", "A crisp 4K camera built for flattering calls."],
    ["Arc USB-C Hub", 59, "🔌", "Seven useful ports in one compact aluminum hub."],
    ["QuietType Keyboard", 72, "⌨️", "Low-profile keys with a soft, precise feel."],
  ],
  Phones: [
    ["Luma Phone Pro", 999, "📱", "A bright, fast phone with an exceptional camera."],
    ["Luma Phone Mini", 649, "📱", "Flagship speed in a perfectly pocketable size."],
    ["PocketFlip 5G", 729, "📲", "A playful folding phone that fits anywhere."],
    ["ClearCall Everyday", 299, "☎️", "Dependable battery life and a friendly price."],
    ["SnapShot Camera Phone", 849, "📸", "A pocket camera that also happens to be a phone."],
    ["PowerPocket Battery", 45, "🔋", "Fast charging power that slips into any bag."],
    ["Magnetic Charging Stand", 39, "🧲", "A tidy bedside charger with a perfect viewing angle."],
    ["Pocket Lens Kit", 54, "🔭", "Three creative lenses for more playful phone photos."],
  ],
  Food: [
    ["Midnight Snack Box", 29, "🍿", "A salty-sweet collection for movie nights."],
    ["Cloud Nine Coffee Beans", 18, "☕", "Chocolatey medium roast for brighter mornings."],
    ["Around-the-World Ramen", 34, "🍜", "Six comforting bowls inspired by favorite cities."],
    ["Tiny Treats Cookie Tin", 22, "🍪", "Buttery bite-size cookies in five flavors."],
    ["Hot Honey Trio", 26, "🍯", "Sweet heat from mellow to seriously spicy."],
    ["Sunday Pancake Kit", 24, "🥞", "Fluffy brunch essentials in one cheerful box."],
    ["Bright Day Tea Sampler", 19, "🫖", "Twelve fragrant teas for every kind of afternoon."],
    ["Crunch Club Mix", 16, "🥨", "A savory snack mix with an excellent crunch."],
  ],
  Accessories: [
    ["Daytrip Canvas Tote", 38, "👜", "Roomy, durable, and ready for every errand."],
    ["Moonlight Sunglasses", 64, "🕶️", "Classic frames with modern polarized lenses."],
    ["Loop Wireless Earbuds", 119, "🎧", "Rich sound, tiny case, all-day comfort."],
    ["Everyday Carry Wallet", 42, "👛", "A slim wallet with clever hidden storage."],
    ["Soft Landing Phone Case", 24, "🪩", "Shock-absorbing protection in joyful colors."],
    ["Cloud Carry Backpack", 78, "🎒", "A lightweight pack with a place for everything."],
    ["Tiny Travel Organizer", 31, "🧳", "Cables, cards, and small essentials neatly contained."],
    ["Daily Gold Hoops", 36, "✨", "Simple polished hoops made for every outfit."],
  ],
  Clothing: [
    ["Sunday Soft Hoodie", 68, "🧥", "Heavyweight comfort with a perfectly relaxed fit."],
    ["Everywhere Crew Socks", 18, "🧦", "Six cheerful pairs with cushioned soles."],
    ["Easy Day Overshirt", 74, "👕", "A polished layer that feels like pajamas."],
    ["Sunset Runner Sneakers", 92, "👟", "Cloud-soft trainers made for all-day wandering."],
    ["Weekend Cap", 28, "🧢", "Washed cotton and an easy, broken-in shape."],
    ["Soft Knit Beanie", 32, "🧶", "Warm, stretchy, and never too serious."],
    ["Everyday Linen Pants", 82, "👖", "Easygoing tailored pants with a breezy feel."],
    ["Morning Walk Jacket", 96, "🧥", "A light weather-resistant layer for daily adventures."],
  ],
  Home: [
    ["Glow Anywhere Lamp", 59, "💡", "A rechargeable little light with cozy warmth."],
    ["Dreamy Throw Blanket", 46, "🛋️", "Ridiculously soft and generously oversized."],
    ["Sunday Ceramic Mug Set", 32, "☕", "Four hand-finished mugs for slow mornings."],
    ["Happy Plant Starter", 35, "🪴", "An easy-care plant in a cheerful ceramic pot."],
    ["Calm Room Diffuser", 44, "🌿", "A quiet mist with a clean cedar scent."],
    ["Ripple Glass Vase", 39, "🏺", "Textured glass that makes every stem look special."],
    ["Soft Step Bath Mat", 27, "🛁", "Plush comfort for the first step of your day."],
    ["Little Things Tray", 21, "🗝️", "A sculptural catchall for keys and tiny treasures."],
  ],
  Gaming: [
    ["QuestBox Controller", 69, "🎮", "Low-latency control with satisfying haptics."],
    ["Neon Realm Desk Mat", 29, "🌌", "A smooth oversized surface with subtle glow."],
    ["Pixel Party Card Game", 21, "🃏", "Fast, funny rounds for two to eight players."],
    ["Level Up Headset", 84, "🎧", "Immersive spatial audio and a clear mic."],
    ["Retro Pocket Console", 79, "🕹️", "A tiny arcade packed with nostalgic fun."],
    ["Cozy Quest Board Game", 38, "🎲", "A gentle adventure for game night regulars."],
    ["Stream Light Mini", 49, "🔆", "A soft adjustable glow for your setup."],
    ["Arcade Keycap Set", 35, "⌨️", "Colorful keys with a nostalgic pixel-inspired palette."],
  ],
  Books: [
    ["A Very Good Weekend", 19, "📕", "A cozy mystery about a suspiciously perfect town."],
    ["Make Small Things", 24, "📗", "A practical guide to creative momentum."],
    ["The Atlas of Snacks", 31, "📘", "Illustrated stories and recipes from everywhere."],
    ["Tomorrow, But Better", 17, "📙", "Optimistic science fiction for the near future."],
    ["Houseplants Have Secrets", 22, "📓", "A witty guide to keeping leafy roommates happy."],
    ["The Small Joys Cookbook", 28, "📔", "Comforting recipes for ordinary good days."],
    ["Color Outside Everything", 18, "📒", "A vibrant workbook for rebuilding creative habits."],
    ["Notes From a Quiet City", 21, "📖", "Tender short stories about unexpected connection."],
  ],
};

const gradients = [
  "from-sky-200 via-blue-100 to-indigo-200",
  "from-orange-200 via-amber-100 to-yellow-200",
  "from-pink-200 via-rose-100 to-orange-100",
  "from-emerald-200 via-teal-100 to-cyan-200",
  "from-violet-200 via-purple-100 to-fuchsia-200",
];

export const products: Product[] = categories.flatMap((category, categoryIndex) =>
  catalog[category].map(([name, price, emoji, description], index) => ({
    id: `${category.toLowerCase()}-${index + 1}`,
    name,
    category,
    price,
    emoji,
    description,
    gradient: gradients[(categoryIndex + index) % gradients.length],
    imageSrc: `/products/items/${category.toLowerCase()}-${index + 1}.webp`,
    rating: Number((4.2 + ((categoryIndex * 3 + index) % 8) / 10).toFixed(1)),
    reviewCount: 128 + ((categoryIndex + 4) * (index + 7) * 37) % 8400,
    deliveryDays: 1 + ((categoryIndex + index) % 4),
    badge: index === 0 ? "Trending" : index === 3 ? "Great value" : undefined,
  })),
);

export const getProduct = (id: string) => products.find((product) => product.id === id);
export const getCategoryProducts = (category: string) =>
  products.filter((product) => product.category.toLowerCase() === category.toLowerCase());

export const formatMoney = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

export const deliveryEstimate = (days: number) => `in ${days} ${days === 1 ? "day" : "days"}`;
