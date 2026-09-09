// Department catalogue — used for automatic routing + officer assignment.
export interface Department {
  id: string;
  name: string;
  code: string;
  short: string;
  desc: string;
  color: string;      // hex accent
  emoji: string;
  slaDays: number;    // default target resolution days
  sample: string[];   // example service names
  keywords: string[]; // english + hinglish keywords for the classifier
  ic: string;         // icon key
}

export const DEPARTMENTS: Department[] = [
  {
    id: "roads",
    name: "Public Works Dept.",
    code: "PWD",
    short: "Roads & Potholes",
    desc: "Potholes, broken roads, footpaths, barricades, culverts.",
    color: "#22d3ee",
    emoji: "🛣️",
    slaDays: 2,
    ic: "roads",
    sample: ["Pothole repair", "Road resurfacing", "Footpath repair"],
    keywords: [
      "pothole", "road", "sadak", "unpaid", "crack", "asphalt", "tar", "lane", "highway",
      "roadblock", "barricade", "footpath", "pavement", "speed bump", "speeding",
      "potholes", "broken road", "road damage", "dip", "rut", "paving", "cement road",
      "gaddha", "sadak", "rasta", "gadi", "paver", "kulab", "jam",
    ],
  },
  {
    id: "sanitation",
    name: "Solid Waste Mgmt.",
    code: "SWM",
    short: "Garbage & Sanitation",
    desc: "Garbage overflow, waste collection, dumping, cleanliness.",
    color: "#a3e635",
    emoji: "🗑️",
    slaDays: 1,
    ic: "trash",
    sample: ["Bin overflow", "Sweeping", "Illegal dumping"],
    keywords: [
      "garbage", "trash", "waste", "litter", "bin", "dump", "dumping", "gutter",
      "kacha", "kachra", "kooda", "driveway", "smell", "stink", "foul", "sanitation",
      "clean", "sweep", "drains", "refuse", "debris", "overflow", "sewage waste",
      "kachra", "kuda", "civic waste", "swachh", "kooda", "kuppai",
    ],
  },
  {
    id: "streetlights",
    name: "Electrical Dept.",
    code: "ELEC",
    short: "Streetlights",
    desc: "Streetlights, poles, public lighting, transformers, wires.",
    color: "#fbbf24",
    emoji: "💡",
    slaDays: 2,
    ic: "bulb",
    sample: ["Streetlight repair", "Light pole", "Transformer fault"],
    keywords: [
      "streetlight", "street light", "light", "lamp", "lamp post", "pole", "dark",
      "electric", "power", "transformer", "wire", "fuse", "bulb", "night", "blackout",
      "bijli", "lighting", "grower", "poles", "electricity", "current", "shock",
      "bijli", "light nahi", "andhari", "bulb kharab", "wiring",
    ],
  },
  {
    id: "water",
    name: "Water Board",
    code: "WS",
    short: "Water Supply",
    desc: "Water supply, leaks, quality, tankers, standposts.",
    color: "#38bdf8",
    emoji: "💧",
    slaDays: 2,
    ic: "water",
    sample: ["Water supply", "Leak repair", "Tanker request"],
    keywords: [
      "water", "paani", "leak", "supply", "tanker", "tap", "pipeline", "drinking",
      "contamination", "no water", "pressure", "standpost", "quality", "overflow",
      "paani", "neeru", "niro", "thanne", "jal", "piped", "water scarcity",
      "paani nahi", "colony", "handpump", "borewell",
    ],
  },
  {
    id: "drainage",
    name: "Sewerage Board",
    code: "Sewerage",
    short: "Drainage & Sewage",
    desc: "Open drains, sewage overflow, manholes, clogging.",
    color: "#818cf8",
    emoji: "🌊",
    slaDays: 2,
    ic: "drain",
    sample: ["Drain cleaning", "Sewage overflow", "Manhole cover"],
    keywords: [
      "drain", "sewer", "sewage", "manhole", "overflow", "clog", "blocked", "cover",
      "gutter", "stagnant", "flood", "waterlogging", "drainage", "naali", "septic",
      "nalla", "underground", "sewage", "stink drain", "open drain",
      "naali", "gulli", "pani bhar", "choked",
    ],
  },
  {
    id: "parks",
    name: "Horticulture Dept.",
    code: "HORT",
    short: "Parks & Trees",
    desc: "Parks, gardens, trees, benches, fountains, lawns.",
    color: "#34d399",
    emoji: "🌳",
    slaDays: 3,
    ic: "tree",
    sample: ["Park upkeep", "Tree pruning", "Bench repair"],
    keywords: [
      "park", "garden", "tree", "bench", "lawn", "grass", "fountain", "playground",
      "branch", "fallen tree", "plant", "plantation", "shade", "children", "swing",
      "garden", "peepal", "neem", "horticulture", "park light", "parking park",
      "baradari", "garden", "udyan", "tree gir", "kaccha park",
    ],
  },
  {
    id: "traffic",
    name: "Traffic Police",
    code: "Traffic",
    short: "Traffic & Parking",
    desc: "Traffic signals, parking, congestion, signage, violations.",
    color: "#fb7185",
    emoji: "🚦",
    slaDays: 3,
    ic: "traffic",
    sample: ["Signal repair", "Parking enforcement", "Congestion"],
    keywords: [
      "traffic", "junction", "signal", "signal light", "parking", "congestion", "jam",
      "violation", "wrong parking", "no parking", "sign", "speed", "vehicle", "accident",
      "road block", "choked road", "traffic signal", "rash driving", "cars",
      "traffic", "gadi", "jum", "parking nahi", "signal",
    ],
  },
  {
    id: "animals",
    name: "Veterinary Dept.",
    code: "VET",
    short: "Stray Animals",
    desc: "Stray cattle, injured animals, animal waste, nuisance.",
    color: "#c084fc",
    emoji: "🐄",
    slaDays: 3,
    ic: "beast",
    sample: ["Stray cattle", "Injured animal", "Street dogs"],
    keywords: [
      "stray", "cattle", "cow", "dog", "monkey", "animal", "injured", "dead", "puppy",
      "bull", "goat", "pests", "nuisance", "bark", "carcass", "poison", "trap",
      "gaay", "kutta", "bandar", "janwar", "stray dog", "stray cattle", "pigs",
      "gaya", "kutta", "bandar", "sucker", "jantu",
    ],
  },
];

export const getDept = (id: string) => DEPARTMENTS.find((d) => d.id === id)!;
export const DEPT_META: Record<string, { ic: string; color: string }> = Object.fromEntries(
  DEPARTMENTS.map((d) => [d.id, { ic: d.ic, color: d.color }])
);

export const defaultDept = getDept("roads");
