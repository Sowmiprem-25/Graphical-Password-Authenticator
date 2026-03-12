// Internal Image Library — Memory-Assisted Graphical Password System
// 150 predefined icons across 8 categories
// No user-uploaded images; all assets are controlled internally

const IMAGE_CATEGORIES = {
  ANIMALS: 'animals',
  NATURE: 'nature',
  FOOD: 'food',
  VEHICLES: 'vehicles',
  OBJECTS: 'objects',
  TECHNOLOGY: 'technology',
  SYMBOLS: 'symbols',
  TOOLS: 'tools',
};

// Each icon uses an emoji as its visual representation rendered as SVG text
// id, name, category, emoji (used to render the icon visually)
const IMAGE_LIBRARY = [
  // --- ANIMALS (20) ---
  { id: 'ani_001', name: 'Lion',       category: IMAGE_CATEGORIES.ANIMALS,    emoji: '🦁' },
  { id: 'ani_002', name: 'Tiger',      category: IMAGE_CATEGORIES.ANIMALS,    emoji: '🐯' },
  { id: 'ani_003', name: 'Elephant',   category: IMAGE_CATEGORIES.ANIMALS,    emoji: '🐘' },
  { id: 'ani_004', name: 'Penguin',    category: IMAGE_CATEGORIES.ANIMALS,    emoji: '🐧' },
  { id: 'ani_005', name: 'Dolphin',    category: IMAGE_CATEGORIES.ANIMALS,    emoji: '🐬' },
  { id: 'ani_006', name: 'Eagle',      category: IMAGE_CATEGORIES.ANIMALS,    emoji: '🦅' },
  { id: 'ani_007', name: 'Giraffe',    category: IMAGE_CATEGORIES.ANIMALS,    emoji: '🦒' },
  { id: 'ani_008', name: 'Zebra',      category: IMAGE_CATEGORIES.ANIMALS,    emoji: '🦓' },
  { id: 'ani_009', name: 'Whale',      category: IMAGE_CATEGORIES.ANIMALS,    emoji: '🐋' },
  { id: 'ani_010', name: 'Owl',        category: IMAGE_CATEGORIES.ANIMALS,    emoji: '🦉' },
  { id: 'ani_011', name: 'Fox',        category: IMAGE_CATEGORIES.ANIMALS,    emoji: '🦊' },
  { id: 'ani_012', name: 'Wolf',       category: IMAGE_CATEGORIES.ANIMALS,    emoji: '🐺' },
  { id: 'ani_013', name: 'Bear',       category: IMAGE_CATEGORIES.ANIMALS,    emoji: '🐻' },
  { id: 'ani_014', name: 'Koala',      category: IMAGE_CATEGORIES.ANIMALS,    emoji: '🐨' },
  { id: 'ani_015', name: 'Parrot',     category: IMAGE_CATEGORIES.ANIMALS,    emoji: '🦜' },
  { id: 'ani_016', name: 'Frog',       category: IMAGE_CATEGORIES.ANIMALS,    emoji: '🐸' },
  { id: 'ani_017', name: 'Crab',       category: IMAGE_CATEGORIES.ANIMALS,    emoji: '🦀' },
  { id: 'ani_018', name: 'Turtle',     category: IMAGE_CATEGORIES.ANIMALS,    emoji: '🐢' },
  { id: 'ani_019', name: 'Shark',      category: IMAGE_CATEGORIES.ANIMALS,    emoji: '🦈' },
  { id: 'ani_020', name: 'Octopus',    category: IMAGE_CATEGORIES.ANIMALS,    emoji: '🐙' },

  // --- NATURE (20) ---
  { id: 'nat_001', name: 'Sunflower',  category: IMAGE_CATEGORIES.NATURE,     emoji: '🌻' },
  { id: 'nat_002', name: 'Rose',       category: IMAGE_CATEGORIES.NATURE,     emoji: '🌹' },
  { id: 'nat_003', name: 'Cactus',     category: IMAGE_CATEGORIES.NATURE,     emoji: '🌵' },
  { id: 'nat_004', name: 'Snowflake',  category: IMAGE_CATEGORIES.NATURE,     emoji: '❄️' },
  { id: 'nat_005', name: 'Rainbow',    category: IMAGE_CATEGORIES.NATURE,     emoji: '🌈' },
  { id: 'nat_006', name: 'Volcano',    category: IMAGE_CATEGORIES.NATURE,     emoji: '🌋' },
  { id: 'nat_007', name: 'Mountain',   category: IMAGE_CATEGORIES.NATURE,     emoji: '🏔️' },
  { id: 'nat_008', name: 'Wave',       category: IMAGE_CATEGORIES.NATURE,     emoji: '🌊' },
  { id: 'nat_009', name: 'Leaf',       category: IMAGE_CATEGORIES.NATURE,     emoji: '🍃' },
  { id: 'nat_010', name: 'Tree',       category: IMAGE_CATEGORIES.NATURE,     emoji: '🌲' },
  { id: 'nat_011', name: 'Cloud',      category: IMAGE_CATEGORIES.NATURE,     emoji: '⛅' },
  { id: 'nat_012', name: 'Lightning',  category: IMAGE_CATEGORIES.NATURE,     emoji: '⚡' },
  { id: 'nat_013', name: 'Moon',       category: IMAGE_CATEGORIES.NATURE,     emoji: '🌙' },
  { id: 'nat_014', name: 'Sun',        category: IMAGE_CATEGORIES.NATURE,     emoji: '☀️' },
  { id: 'nat_015', name: 'Star',       category: IMAGE_CATEGORIES.NATURE,     emoji: '⭐' },
  { id: 'nat_016', name: 'Comet',      category: IMAGE_CATEGORIES.NATURE,     emoji: '☄️' },
  { id: 'nat_017', name: 'Tornado',    category: IMAGE_CATEGORIES.NATURE,     emoji: '🌪️' },
  { id: 'nat_018', name: 'Mushroom',   category: IMAGE_CATEGORIES.NATURE,     emoji: '🍄' },
  { id: 'nat_019', name: 'Cherry',     category: IMAGE_CATEGORIES.NATURE,     emoji: '🍒' },
  { id: 'nat_020', name: 'Seedling',   category: IMAGE_CATEGORIES.NATURE,     emoji: '🌱' },

  // --- FOOD (20) ---
  { id: 'fod_001', name: 'Pizza',      category: IMAGE_CATEGORIES.FOOD,       emoji: '🍕' },
  { id: 'fod_002', name: 'Burger',     category: IMAGE_CATEGORIES.FOOD,       emoji: '🍔' },
  { id: 'fod_003', name: 'Sushi',      category: IMAGE_CATEGORIES.FOOD,       emoji: '🍣' },
  { id: 'fod_004', name: 'Ice Cream',  category: IMAGE_CATEGORIES.FOOD,       emoji: '🍦' },
  { id: 'fod_005', name: 'Cake',       category: IMAGE_CATEGORIES.FOOD,       emoji: '🎂' },
  { id: 'fod_006', name: 'Cookie',     category: IMAGE_CATEGORIES.FOOD,       emoji: '🍪' },
  { id: 'fod_007', name: 'Donut',      category: IMAGE_CATEGORIES.FOOD,       emoji: '🍩' },
  { id: 'fod_008', name: 'Popcorn',    category: IMAGE_CATEGORIES.FOOD,       emoji: '🍿' },
  { id: 'fod_009', name: 'Taco',       category: IMAGE_CATEGORIES.FOOD,       emoji: '🌮' },
  { id: 'fod_010', name: 'Ramen',      category: IMAGE_CATEGORIES.FOOD,       emoji: '🍜' },
  { id: 'fod_011', name: 'Cheese',     category: IMAGE_CATEGORIES.FOOD,       emoji: '🧀' },
  { id: 'fod_012', name: 'Egg',        category: IMAGE_CATEGORIES.FOOD,       emoji: '🥚' },
  { id: 'fod_013', name: 'Avocado',    category: IMAGE_CATEGORIES.FOOD,       emoji: '🥑' },
  { id: 'fod_014', name: 'Strawberry', category: IMAGE_CATEGORIES.FOOD,       emoji: '🍓' },
  { id: 'fod_015', name: 'Watermelon', category: IMAGE_CATEGORIES.FOOD,       emoji: '🍉' },
  { id: 'fod_016', name: 'Pineapple',  category: IMAGE_CATEGORIES.FOOD,       emoji: '🍍' },
  { id: 'fod_017', name: 'Banana',     category: IMAGE_CATEGORIES.FOOD,       emoji: '🍌' },
  { id: 'fod_018', name: 'Coffee',     category: IMAGE_CATEGORIES.FOOD,       emoji: '☕' },
  { id: 'fod_019', name: 'Cocktail',   category: IMAGE_CATEGORIES.FOOD,       emoji: '🍹' },
  { id: 'fod_020', name: 'Honey',      category: IMAGE_CATEGORIES.FOOD,       emoji: '🍯' },

  // --- VEHICLES (20) ---
  { id: 'veh_001', name: 'Rocket',     category: IMAGE_CATEGORIES.VEHICLES,   emoji: '🚀' },
  { id: 'veh_002', name: 'Airplane',   category: IMAGE_CATEGORIES.VEHICLES,   emoji: '✈️' },
  { id: 'veh_003', name: 'Helicopter', category: IMAGE_CATEGORIES.VEHICLES,   emoji: '🚁' },
  { id: 'veh_004', name: 'Sailboat',   category: IMAGE_CATEGORIES.VEHICLES,   emoji: '⛵' },
  { id: 'veh_005', name: 'Ship',       category: IMAGE_CATEGORIES.VEHICLES,   emoji: '🚢' },
  { id: 'veh_006', name: 'Train',      category: IMAGE_CATEGORIES.VEHICLES,   emoji: '🚂' },
  { id: 'veh_007', name: 'Bicycle',    category: IMAGE_CATEGORIES.VEHICLES,   emoji: '🚲' },
  { id: 'veh_008', name: 'Motorcycle', category: IMAGE_CATEGORIES.VEHICLES,   emoji: '🏍️' },
  { id: 'veh_009', name: 'Car',        category: IMAGE_CATEGORIES.VEHICLES,   emoji: '🚗' },
  { id: 'veh_010', name: 'Truck',      category: IMAGE_CATEGORIES.VEHICLES,   emoji: '🚛' },
  { id: 'veh_011', name: 'Bus',        category: IMAGE_CATEGORIES.VEHICLES,   emoji: '🚌' },
  { id: 'veh_012', name: 'Taxi',       category: IMAGE_CATEGORIES.VEHICLES,   emoji: '🚕' },
  { id: 'veh_013', name: 'Ambulance',  category: IMAGE_CATEGORIES.VEHICLES,   emoji: '🚑' },
  { id: 'veh_014', name: 'Firetruck',  category: IMAGE_CATEGORIES.VEHICLES,   emoji: '🚒' },
  { id: 'veh_015', name: 'Tractor',    category: IMAGE_CATEGORIES.VEHICLES,   emoji: '🚜' },
  { id: 'veh_016', name: 'Submarine',  category: IMAGE_CATEGORIES.VEHICLES,   emoji: '🤿' },
  { id: 'veh_017', name: 'UFO',        category: IMAGE_CATEGORIES.VEHICLES,   emoji: '🛸' },
  { id: 'veh_018', name: 'Cable Car',  category: IMAGE_CATEGORIES.VEHICLES,   emoji: '🚡' },
  { id: 'veh_019', name: 'Scooter',    category: IMAGE_CATEGORIES.VEHICLES,   emoji: '🛵' },
  { id: 'veh_020', name: 'Canoe',      category: IMAGE_CATEGORIES.VEHICLES,   emoji: '🛶' },

  // --- OBJECTS (20) ---
  { id: 'obj_001', name: 'Crown',      category: IMAGE_CATEGORIES.OBJECTS,    emoji: '👑' },
  { id: 'obj_002', name: 'Diamond',    category: IMAGE_CATEGORIES.OBJECTS,    emoji: '💎' },
  { id: 'obj_003', name: 'Book',       category: IMAGE_CATEGORIES.OBJECTS,    emoji: '📚' },
  { id: 'obj_004', name: 'Anchor',     category: IMAGE_CATEGORIES.OBJECTS,    emoji: '⚓' },
  { id: 'obj_005', name: 'Bell',       category: IMAGE_CATEGORIES.OBJECTS,    emoji: '🔔' },
  { id: 'obj_006', name: 'Trophy',     category: IMAGE_CATEGORIES.OBJECTS,    emoji: '🏆' },
  { id: 'obj_007', name: 'Shield',     category: IMAGE_CATEGORIES.OBJECTS,    emoji: '🛡️' },
  { id: 'obj_008', name: 'Lamp',       category: IMAGE_CATEGORIES.OBJECTS,    emoji: '💡' },
  { id: 'obj_009', name: 'Magnifier',  category: IMAGE_CATEGORIES.OBJECTS,    emoji: '🔍' },
  { id: 'obj_010', name: 'Key',        category: IMAGE_CATEGORIES.OBJECTS,    emoji: '🗝️' },
  { id: 'obj_011', name: 'Lock',       category: IMAGE_CATEGORIES.OBJECTS,    emoji: '🔒' },
  { id: 'obj_012', name: 'Clock',      category: IMAGE_CATEGORIES.OBJECTS,    emoji: '🕐' },
  { id: 'obj_013', name: 'Hourglass',  category: IMAGE_CATEGORIES.OBJECTS,    emoji: '⏳' },
  { id: 'obj_014', name: 'Compass',    category: IMAGE_CATEGORIES.OBJECTS,    emoji: '🧭' },
  { id: 'obj_015', name: 'Telescope',  category: IMAGE_CATEGORIES.OBJECTS,    emoji: '🔭' },
  { id: 'obj_016', name: 'Microscope', category: IMAGE_CATEGORIES.OBJECTS,    emoji: '🔬' },
  { id: 'obj_017', name: 'Candle',     category: IMAGE_CATEGORIES.OBJECTS,    emoji: '🕯️' },
  { id: 'obj_018', name: 'Balloon',    category: IMAGE_CATEGORIES.OBJECTS,    emoji: '🎈' },
  { id: 'obj_019', name: 'Dice',       category: IMAGE_CATEGORIES.OBJECTS,    emoji: '🎲' },
  { id: 'obj_020', name: 'Puzzle',     category: IMAGE_CATEGORIES.OBJECTS,    emoji: '🧩' },

  // --- TECHNOLOGY (20) ---
  { id: 'tec_001', name: 'Laptop',     category: IMAGE_CATEGORIES.TECHNOLOGY, emoji: '💻' },
  { id: 'tec_002', name: 'Phone',      category: IMAGE_CATEGORIES.TECHNOLOGY, emoji: '📱' },
  { id: 'tec_003', name: 'Robot',      category: IMAGE_CATEGORIES.TECHNOLOGY, emoji: '🤖' },
  { id: 'tec_004', name: 'Camera',     category: IMAGE_CATEGORIES.TECHNOLOGY, emoji: '📷' },
  { id: 'tec_005', name: 'Satellite',  category: IMAGE_CATEGORIES.TECHNOLOGY, emoji: '🛰️' },
  { id: 'tec_006', name: 'Controller', category: IMAGE_CATEGORIES.TECHNOLOGY, emoji: '🎮' },
  { id: 'tec_007', name: 'Printer',    category: IMAGE_CATEGORIES.TECHNOLOGY, emoji: '🖨️' },
  { id: 'tec_008', name: 'CPU',        category: IMAGE_CATEGORIES.TECHNOLOGY, emoji: '💾' },
  { id: 'tec_009', name: 'Magnet',     category: IMAGE_CATEGORIES.TECHNOLOGY, emoji: '🧲' },
  { id: 'tec_010', name: 'Battery',    category: IMAGE_CATEGORIES.TECHNOLOGY, emoji: '🔋' },
  { id: 'tec_011', name: 'Wifi',       category: IMAGE_CATEGORIES.TECHNOLOGY, emoji: '📡' },
  { id: 'tec_012', name: 'Projector',  category: IMAGE_CATEGORIES.TECHNOLOGY, emoji: '📽️' },
  { id: 'tec_013', name: 'Watch',      category: IMAGE_CATEGORIES.TECHNOLOGY, emoji: '⌚' },
  { id: 'tec_014', name: 'Headphones', category: IMAGE_CATEGORIES.TECHNOLOGY, emoji: '🎧' },
  { id: 'tec_015', name: 'Speaker',    category: IMAGE_CATEGORIES.TECHNOLOGY, emoji: '🔊' },
  { id: 'tec_016', name: 'Keyboard',   category: IMAGE_CATEGORIES.TECHNOLOGY, emoji: '⌨️' },
  { id: 'tec_017', name: 'Monitor',    category: IMAGE_CATEGORIES.TECHNOLOGY, emoji: '🖥️' },
  { id: 'tec_018', name: 'Mouse',      category: IMAGE_CATEGORIES.TECHNOLOGY, emoji: '🖱️' },
  { id: 'tec_019', name: 'USB',        category: IMAGE_CATEGORIES.TECHNOLOGY, emoji: '🔌' },
  { id: 'tec_020', name: 'Light LED',  category: IMAGE_CATEGORIES.TECHNOLOGY, emoji: '🔦' },

  // --- SYMBOLS (15) ---
  { id: 'sym_001', name: 'Heart',      category: IMAGE_CATEGORIES.SYMBOLS,    emoji: '❤️' },
  { id: 'sym_002', name: 'Fire',       category: IMAGE_CATEGORIES.SYMBOLS,    emoji: '🔥' },
  { id: 'sym_003', name: 'Peace',      category: IMAGE_CATEGORIES.SYMBOLS,    emoji: '☮️' },
  { id: 'sym_004', name: 'Infinity',   category: IMAGE_CATEGORIES.SYMBOLS,    emoji: '♾️' },
  { id: 'sym_005', name: 'Yin Yang',   category: IMAGE_CATEGORIES.SYMBOLS,    emoji: '☯️' },
  { id: 'sym_006', name: 'Skull',      category: IMAGE_CATEGORIES.SYMBOLS,    emoji: '💀' },
  { id: 'sym_007', name: 'Globe',      category: IMAGE_CATEGORIES.SYMBOLS,    emoji: '🌍' },
  { id: 'sym_008', name: 'Flag',       category: IMAGE_CATEGORIES.SYMBOLS,    emoji: '🚩' },
  { id: 'sym_009', name: 'Radioactive',category: IMAGE_CATEGORIES.SYMBOLS,    emoji: '☢️' },
  { id: 'sym_010', name: 'Biohazard',  category: IMAGE_CATEGORIES.SYMBOLS,    emoji: '☣️' },
  { id: 'sym_011', name: 'Atom',       category: IMAGE_CATEGORIES.SYMBOLS,    emoji: '⚛️' },
  { id: 'sym_012', name: 'Recycle',    category: IMAGE_CATEGORIES.SYMBOLS,    emoji: '♻️' },
  { id: 'sym_013', name: 'Music',      category: IMAGE_CATEGORIES.SYMBOLS,    emoji: '🎵' },
  { id: 'sym_014', name: 'Gem Star',   category: IMAGE_CATEGORIES.SYMBOLS,    emoji: '✨' },
  { id: 'sym_015', name: 'Target',     category: IMAGE_CATEGORIES.SYMBOLS,    emoji: '🎯' },

  // --- TOOLS (15) ---
  { id: 'tol_001', name: 'Hammer',     category: IMAGE_CATEGORIES.TOOLS,      emoji: '🔨' },
  { id: 'tol_002', name: 'Wrench',     category: IMAGE_CATEGORIES.TOOLS,      emoji: '🔧' },
  { id: 'tol_003', name: 'Screwdriver',category: IMAGE_CATEGORIES.TOOLS,      emoji: '🪛' },
  { id: 'tol_004', name: 'Saw',        category: IMAGE_CATEGORIES.TOOLS,      emoji: '🪚' },
  { id: 'tol_005', name: 'Axe',        category: IMAGE_CATEGORIES.TOOLS,      emoji: '🪓' },
  { id: 'tol_006', name: 'Knife',      category: IMAGE_CATEGORIES.TOOLS,      emoji: '🔪' },
  { id: 'tol_007', name: 'Scissors',   category: IMAGE_CATEGORIES.TOOLS,      emoji: '✂️' },
  { id: 'tol_008', name: 'Ruler',      category: IMAGE_CATEGORIES.TOOLS,      emoji: '📏' },
  { id: 'tol_009', name: 'Paintbrush', category: IMAGE_CATEGORIES.TOOLS,      emoji: '🎨' },
  { id: 'tol_010', name: 'Pencil',     category: IMAGE_CATEGORIES.TOOLS,      emoji: '✏️' },
  { id: 'tol_011', name: 'Magnet Wand',category: IMAGE_CATEGORIES.TOOLS,      emoji: '🪄' },
  { id: 'tol_012', name: 'Broom',      category: IMAGE_CATEGORIES.TOOLS,      emoji: '🧹' },
  { id: 'tol_013', name: 'Plunger',    category: IMAGE_CATEGORIES.TOOLS,      emoji: '🪠' },
  { id: 'tol_014', name: 'Bucket',     category: IMAGE_CATEGORIES.TOOLS,      emoji: '🪣' },
  { id: 'tol_015', name: 'Ladder',     category: IMAGE_CATEGORIES.TOOLS,      emoji: '🪜' },
];

// Helper: get image by ID
const getImageById = (id) => IMAGE_LIBRARY.find((img) => img.id === id);

// Helper: get N random images from pool, excluding given IDs
const getRandomImages = (count, excludeIds = []) => {
  const pool = IMAGE_LIBRARY.filter((img) => !excludeIds.includes(img.id));
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

// Helper: get N random images for a cue (6 options), guaranteed to include the correctId if provided
const getCueImageOptions = (count = 6, correctId = null, globalExcludeIds = []) => {
  let pool = IMAGE_LIBRARY.filter((img) => !globalExcludeIds.includes(img.id));
  if (correctId) {
    pool = pool.filter((img) => img.id !== correctId);
  }
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const options = shuffled.slice(0, count - (correctId ? 1 : 0));
  if (correctId) {
    const correct = getImageById(correctId);
    if (correct) options.push(correct);
  }
  return options.sort(() => Math.random() - 0.5);
};

// Helper: get decoy images (excludes correct sequence images)
const getDecoyImages = (count, correctImageIds = []) => {
  const pool = IMAGE_LIBRARY.filter((img) => !correctImageIds.includes(img.id));
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

// Helper: build shuffled 4x4 login grid (correct + decoys)
const buildLoginGrid = (correctImageIds = []) => {
  const correct = correctImageIds.map(getImageById).filter(Boolean);
  const needed = 16 - correct.length;
  const decoys = getDecoyImages(needed, correctImageIds);
  const grid = [...correct, ...decoys];
  return grid.sort(() => Math.random() - 0.5);
};

module.exports = IMAGE_LIBRARY;
module.exports.IMAGE_CATEGORIES = IMAGE_CATEGORIES;
module.exports.getImageById = getImageById;
module.exports.getRandomImages = getRandomImages;
module.exports.getCueImageOptions = getCueImageOptions;
module.exports.getDecoyImages = getDecoyImages;
module.exports.buildLoginGrid = buildLoginGrid;
