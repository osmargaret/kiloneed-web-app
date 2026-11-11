/**
 * Tenant / Deployment-Level Marketplace Configuration
 * 
 * IMPORTANT: In accordance with platform architecture, the country is configured
 * at the deployment/tenant level and is NEVER exposed as a filter to buyers.
 * Each national deployment operates independently with its own currency, states,
 * cities, price ranges, delivery options, and payment methods.
 */

export interface StateRegion {
  id: string;
  name: string;
  cities: string[];
}

export interface PriceRangeOption {
  id: string;
  label: string;
  min?: number;
  max?: number;
}

export interface DeliveryOption {
  id: "Pickup" | "Local Delivery" | "Nationwide Delivery";
  label: string;
}

export interface TenantCountryConfig {
  code: string;
  name: string;
  currency: {
    code: string;
    symbol: string;
    locale: string;
    format: (amount: number) => string;
  };
  states: StateRegion[];
  priceRanges: PriceRangeOption[];
  deliveryOptions: DeliveryOption[];
  paymentMethods: {
    id: string;
    name: string;
    description: string;
  }[];
}

// Nigeria Country Deployment Configuration (Default)
export const nigeriaDeploymentConfig: TenantCountryConfig = {
  code: "NG",
  name: "Nigeria",
  currency: {
    code: "NGN",
    symbol: "₦",
    locale: "en-NG",
    format: (amount: number) => "₦" + amount.toLocaleString("en-NG"),
  },
  states: [
    {
      id: "lagos",
      name: "Lagos",
      cities: [
        "Ikeja",
        "Lekki",
        "Victoria Island",
        "Ikoyi",
        "Yaba",
        "Surulere",
        "Maryland",
        "Ajah",
        "Festac",
        "Oshodi",
        "Ikorodu",
        "Alimosho",
      ],
    },
    {
      id: "abuja",
      name: "Abuja (FCT)",
      cities: [
        "Garki",
        "Wuse",
        "Maitama",
        "Asokoro",
        "Gwarinpa",
        "Jabi",
        "Utako",
        "Kubwa",
        "Apo",
        "Lugbe",
      ],
    },
    {
      id: "rivers",
      name: "Rivers",
      cities: [
        "Port Harcourt",
        "Obio-Akpor",
        "Eleme",
        "Bonny",
        "Oyigbo",
      ],
    },
    {
      id: "oyo",
      name: "Oyo",
      cities: [
        "Ibadan (Bodija)",
        "Ibadan (Dugbe)",
        "Ibadan (Ring Road)",
        "Ogbomoso",
        "Oyo Town",
      ],
    },
    {
      id: "kano",
      name: "Kano",
      cities: [
        "Kano Municipal",
        "Nassarawa",
        "Fagge",
        "Tarauni",
        "Dala",
      ],
    },
    {
      id: "enugu",
      name: "Enugu",
      cities: [
        "Enugu North",
        "Enugu South",
        "Independence Layout",
        "Nsukka",
      ],
    },
    {
      id: "delta",
      name: "Delta",
      cities: [
        "Warri",
        "Asaba",
        "Sapele",
        "Ughelli",
      ],
    },
    {
      id: "ogun",
      name: "Ogun",
      cities: [
        "Abeokuta",
        "Sagamu",
        "Ijebu Ode",
        "Ota",
      ],
    },
    {
      id: "kaduna",
      name: "Kaduna",
      cities: [
        "Kaduna North",
        "Kaduna South",
        "Zaria",
        "Kafanchan",
      ],
    },
    {
      id: "anambra",
      name: "Anambra",
      cities: [
        "Awka",
        "Onitsha",
        "Nnewi",
      ],
    },
    {
      id: "edo",
      name: "Edo",
      cities: [
        "Benin City",
        "GRA Benin",
        "Ekpoma",
        "Auchi",
      ],
    },
  ],
  priceRanges: [
    { id: "under-5k", label: "Under ₦5,000", max: 5000 },
    { id: "5k-20k", label: "₦5,000 – ₦20,000", min: 5000, max: 20000 },
    { id: "20k-100k", label: "₦20,000 – ₦100,000", min: 20000, max: 100000 },
    { id: "100k-500k", label: "₦100,000 – ₦500,000", min: 100000, max: 500000 },
    { id: "500k-2m", label: "₦500,000 – ₦2,000,000", min: 500000, max: 2000000 },
    { id: "above-2m", label: "Above ₦2,000,000", min: 2000000 },
  ],
  deliveryOptions: [
    { id: "Pickup", label: "Pickup" },
    { id: "Local Delivery", label: "Local Delivery" },
    { id: "Nationwide Delivery", label: "Nationwide Delivery" },
  ],
  paymentMethods: [
    { id: "bank_transfer", name: "Bank Transfer", description: "Direct instant bank transfer" },
    { id: "card", name: "Debit / Credit Card", description: "Visa, Mastercard, Verve via Paystack" },
    { id: "ussd", name: "USSD", description: "Dial bank USSD code" },
    { id: "cod", name: "Cash on Delivery", description: "Pay when item is inspected and received" },
  ],
};

// Deployment registry
const countryDeployments: Record<string, TenantCountryConfig> = {
  NG: nigeriaDeploymentConfig,
};

/**
 * Returns the country configuration for the active marketplace deployment.
 * Defaults to the configured deployment environment variable or "NG".
 */
export function getActiveMarketplaceConfig(): TenantCountryConfig {
  const envCode = (import.meta.env?.VITE_APP_COUNTRY as string | undefined)?.toUpperCase() || "NG";
  return countryDeployments[envCode] || nigeriaDeploymentConfig;
}

/**
 * Standard hierarchical Categories and Subcategories
 */
export interface CategoryDefinition {
  name: string;
  icon: string;
  subcategories: string[];
}

export const marketplaceCategories: CategoryDefinition[] = [
  {
    name: "Electronics",
    icon: "📱",
    subcategories: [
      "Phones & Tablets",
      "Laptops & Computers",
      "TV & Audio",
      "Cameras & Optics",
      "Video Games & Consoles",
      "Accessories & Gadgets",
    ],
  },
  {
    name: "Fashion",
    icon: "👗",
    subcategories: [
      "Men's Clothing",
      "Women's Clothing",
      "Shoes & Footwear",
      "Bags & Luggage",
      "Watches & Jewelry",
      "Kids & Baby Wear",
    ],
  },
  {
    name: "Vehicles",
    icon: "🚗",
    subcategories: [
      "Cars",
      "Motorcycles & Scooters",
      "Trucks & Trailers",
      "Auto Parts & Accessories",
      "Boats & Marine",
    ],
  },
  {
    name: "Home & Garden",
    icon: "🛋️",
    subcategories: [
      "Furniture",
      "Home Appliances",
      "Kitchenware",
      "Bedding & Linens",
      "Garden & Outdoor",
      "Home Decor",
    ],
  },
  {
    name: "Health & Beauty",
    icon: "✨",
    subcategories: [
      "Skincare",
      "Fragrances & Perfumes",
      "Makeup",
      "Hair Care",
      "Wellness & Fitness",
    ],
  },
  {
    name: "Sports & Leisure",
    icon: "⚽",
    subcategories: [
      "Gym & Fitness Equipment",
      "Outdoor & Camping",
      "Bicycles & Cycling",
      "Sports Gear & Balls",
    ],
  },
  {
    name: "Services",
    icon: "🛠️",
    subcategories: [
      "Freelance & Tech",
      "Home Repairs & Trades",
      "Photography & Video",
      "Events & Catering",
      "Tutoring & Lessons",
    ],
  },
  {
    name: "Food & Agriculture",
    icon: "🌾",
    subcategories: [
      "Fresh Produce",
      "Groceries & Provisions",
      "Livestock & Poultry",
      "Baking & Meals",
    ],
  },
  {
    name: "Real Estate & Property",
    icon: "🏢",
    subcategories: [
      "Apartments for Rent",
      "Houses for Sale",
      "Commercial Property",
      "Shortlet & Vacation Rentals",
      "Land & Plots",
    ],
  },
  {
    name: "Books & Stationery",
    icon: "📚",
    subcategories: [
      "Academic & Textbooks",
      "Novels & Fiction",
      "Self-Help & Business",
      "Office & School Supplies",
    ],
  },
];
