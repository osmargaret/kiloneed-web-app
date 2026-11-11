/**
 * Country, State, City (CSC) Data & Helpers for Kiloneed Global Platform
 * Starting with Nigeria, with complete support for all 36 States + FCT and major cities,
 * expandable globally to any country worldwide.
 */

export interface CSCLocation {
  country: string;
  state: string;
  city: string;
}

export interface CityData {
  name: string;
}

export interface StateData {
  name: string;
  code?: string;
  cities: string[];
}

export interface CountryData {
  name: string;
  code: string;
  flag: string;
  phoneCode: string;
  currency: {
    code: string;
    symbol: string;
  };
  states: StateData[];
}

export const COUNTRIES: CountryData[] = [
  {
    name: "Nigeria",
    code: "NG",
    flag: "🇳🇬",
    phoneCode: "+234",
    currency: { code: "NGN", symbol: "₦" },
    states: [
      {
        name: "Lagos",
        cities: [
          "Ikeja", "Lekki", "Victoria Island", "Ikoyi", "Yaba", "Surulere",
          "Maryland", "Ajah", "Festac", "Oshodi", "Ikorodu", "Alimosho",
          "Agege", "Apapa", "Epe", "Badagry", "Gbagada", "Magodo", "Ogba"
        ]
      },
      {
        name: "Abuja (FCT)",
        cities: [
          "Garki", "Wuse", "Maitama", "Asokoro", "Gwarinpa", "Jabi",
          "Utako", "Kubwa", "Apo", "Lugbe", "Bwari", "Kuje", "Kwali"
        ]
      },
      {
        name: "Rivers",
        cities: ["Port Harcourt", "Obio-Akpor", "Eleme", "Bonny", "Oyigbo", "Okrika", "Ahoada", "Degema"]
      },
      {
        name: "Oyo",
        cities: ["Ibadan", "Ogbomoso", "Oyo", "Iseyin", "Saki", "Eruwa"]
      },
      {
        name: "Kano",
        cities: ["Kano Municipal", "Fagge", "Dala", "Gwale", "Tarauni", "Nassarawa", "Bichi", "Wudil"]
      },
      {
        name: "Ogun",
        cities: ["Abeokuta", "Sagamu", "Ijebu Ode", "Ota", "Ilaro", "Mowe", "Ibafo"]
      },
      {
        name: "Enugu",
        cities: ["Enugu", "Nsukka", "Agbani", "Udi", "Oji River", "Awgu"]
      },
      {
        name: "Anambra",
        cities: ["Awka", "Onitsha", "Nnewi", "Ekwulobia", "Ihiala", "Ogbaru"]
      },
      {
        name: "Delta",
        cities: ["Warri", "Asaba", "Sapele", "Ughelli", "Agbor", "Effurun", "Oghara"]
      },
      {
        name: "Edo",
        cities: ["Benin City", "Uromi", "Auchi", "Ekpoma", "Irrua"]
      },
      {
        name: "Kaduna",
        cities: ["Kaduna", "Zaria", "Kafanchan", "Kagoro", "Saminaka"]
      },
      {
        name: "Abia",
        cities: ["Aba", "Umuahia", "Ohafia", "Arochukwu"]
      },
      {
        name: "Adamawa",
        cities: ["Yola", "Mubi", "Numan", "Jimeta"]
      },
      {
        name: "Akwa Ibom",
        cities: ["Uyo", "Eket", "Ikot Ekpene", "Oron"]
      },
      {
        name: "Bauchi",
        cities: ["Bauchi", "Azare", "Misau", "Jama'are"]
      },
      {
        name: "Bayelsa",
        cities: ["Yenagoa", "Brass", "Ogbia", "Sagbama"]
      },
      {
        name: "Benue",
        cities: ["Makurdi", "Gboko", "Otukpo", "Katsina-Ala"]
      },
      {
        name: "Borno",
        cities: ["Maiduguri", "Biu", "Bama", "Dikwa"]
      },
      {
        name: "Cross River",
        cities: ["Calabar", "Ikom", "Ogoja", "Ugep", "Obudu"]
      },
      {
        name: "Ebonyi",
        cities: ["Abakaliki", "Afikpo", "Onueke", "Ishielu"]
      },
      {
        name: "Ekiti",
        cities: ["Ado-Ekiti", "Ikere-Ekiti", "Ijero-Ekiti", "Oye-Ekiti"]
      },
      {
        name: "Gombe",
        cities: ["Gombe", "Kaltungo", "Billiri", "Bajoga"]
      },
      {
        name: "Imo",
        cities: ["Owerri", "Orlu", "Okigwe", "Mbaise", "Oguta"]
      },
      {
        name: "Jigawa",
        cities: ["Dutse", "Hadejia", "Gumel", "Kazaure", "Ringim"]
      },
      {
        name: "Katsina",
        cities: ["Katsina", "Daura", "Funtua", "Malumfashi"]
      },
      {
        name: "Kebbi",
        cities: ["Birnin Kebbi", "Argungu", "Yauri", "Zuru"]
      },
      {
        name: "Kogi",
        cities: ["Lokoja", "Okene", "Kabba", "Idah", "Anyigba"]
      },
      {
        name: "Kwara",
        cities: ["Ilorin", "Offa", "Omu-Aran", "Lafiagi"]
      },
      {
        name: "Nasarawa",
        cities: ["Lafia", "Keffi", "Akwanga", "Karu", "Mararaba"]
      },
      {
        name: "Niger",
        cities: ["Minna", "Bida", "Suleja", "Kontagora", "Mokwa"]
      },
      {
        name: "Ondo",
        cities: ["Akure", "Ondo Town", "Owo", "Ikare", "Ore"]
      },
      {
        name: "Osun",
        cities: ["Osogbo", "Ile-Ife", "Ilesa", "Ede", "Ikirun"]
      },
      {
        name: "Plateau",
        cities: ["Jos", "Bukuru", "Pankshin", "Shendam", "Barkin Ladi"]
      },
      {
        name: "Sokoto",
        cities: ["Sokoto", "Tambuwal", "Wurno", "Bodinga"]
      },
      {
        name: "Taraba",
        cities: ["Jalingo", "Wukari", "Bali", "Gembu"]
      },
      {
        name: "Yobe",
        cities: ["Damaturu", "Potiskum", "Gashua", "Nguru"]
      },
      {
        name: "Zamfara",
        cities: ["Gusau", "Kaura Namoda", "Talata Mafara", "Anka"]
      }
    ]
  },
  {
    name: "Ghana",
    code: "GH",
    flag: "🇬🇭",
    phoneCode: "+233",
    currency: { code: "GHS", symbol: "GH₵" },
    states: [
      { name: "Greater Accra", cities: ["Accra", "Tema", "Madina", "Kasoa"] },
      { name: "Ashanti", cities: ["Kumasi", "Obuasi", "Ejisu", "Mampong"] },
      { name: "Central", cities: ["Cape Coast", "Winneba", "Elmina", "Mfantseman"] },
      { name: "Eastern", cities: ["Koforidua", "Nkawkaw", "Akim Oda", "Nsawam"] },
      { name: "Western", cities: ["Sekondi-Takoradi", "Tarkwa", "Axim"] }
    ]
  },
  {
    name: "Kenya",
    code: "KE",
    flag: "🇰🇪",
    phoneCode: "+254",
    currency: { code: "KES", symbol: "KSh" },
    states: [
      { name: "Nairobi", cities: ["Nairobi Central", "Westlands", "Kilimani", "Karen", "Kasarani"] },
      { name: "Mombasa", cities: ["Mombasa Island", "Nyali", "Bamburi", "Likoni"] },
      { name: "Kisumu", cities: ["Kisumu Central", "Milimani", "Kondele"] },
      { name: "Nakuru", cities: ["Nakuru Town", "Naivasha", "Molo"] },
      { name: "Kiambu", cities: ["Thika", "Kiambu Town", "Ruiru", "Kikuyu"] }
    ]
  },
  {
    name: "South Africa",
    code: "ZA",
    flag: "🇿🇦",
    phoneCode: "+27",
    currency: { code: "ZAR", symbol: "R" },
    states: [
      { name: "Gauteng", cities: ["Johannesburg", "Pretoria", "Sandton", "Soweto", "Centurion"] },
      { name: "Western Cape", cities: ["Cape Town", "Stellenbosch", "George", "Paarl"] },
      { name: "KwaZulu-Natal", cities: ["Durban", "Pietermaritzburg", "Umhlanga", "Pinetown"] },
      { name: "Eastern Cape", cities: ["Gqeberha (Port Elizabeth)", "East London"] }
    ]
  },
  {
    name: "United Kingdom",
    code: "GB",
    flag: "🇬🇧",
    phoneCode: "+44",
    currency: { code: "GBP", symbol: "£" },
    states: [
      { name: "Greater London", cities: ["London", "Westminster", "Camden", "Greenwich", "Croydon"] },
      { name: "Greater Manchester", cities: ["Manchester", "Salford", "Bolton", "Stockport"] },
      { name: "West Midlands", cities: ["Birmingham", "Coventry", "Wolverhampton", "Solihull"] },
      { name: "West Yorkshire", cities: ["Leeds", "Bradford", "Wakefield", "Huddersfield"] },
      { name: "Scotland", cities: ["Edinburgh", "Glasgow", "Aberdeen", "Dundee"] }
    ]
  },
  {
    name: "United States",
    code: "US",
    flag: "🇺🇸",
    phoneCode: "+1",
    currency: { code: "USD", symbol: "$" },
    states: [
      { name: "California", cities: ["Los Angeles", "San Francisco", "San Diego", "San Jose", "Sacramento"] },
      { name: "New York", cities: ["New York City", "Buffalo", "Rochester", "Yonkers", "Syracuse"] },
      { name: "Texas", cities: ["Houston", "Austin", "Dallas", "San Antonio", "Fort Worth"] },
      { name: "Florida", cities: ["Miami", "Orlando", "Tampa", "Jacksonville", "Fort Lauderdale"] },
      { name: "Illinois", cities: ["Chicago", "Aurora", "Naperville", "Rockford"] },
      { name: "Georgia", cities: ["Atlanta", "Augusta", "Savannah", "Athens"] }
    ]
  },
  {
    name: "Canada",
    code: "CA",
    flag: "🇨🇦",
    phoneCode: "+1",
    currency: { code: "CAD", symbol: "CA$" },
    states: [
      { name: "Ontario", cities: ["Toronto", "Ottawa", "Mississauga", "Brampton", "Hamilton"] },
      { name: "Quebec", cities: ["Montreal", "Quebec City", "Laval", "Gatineau"] },
      { name: "British Columbia", cities: ["Vancouver", "Victoria", "Surrey", "Burnaby"] },
      { name: "Alberta", cities: ["Calgary", "Edmonton", "Red Deer"] }
    ]
  },
  {
    name: "United Arab Emirates",
    code: "AE",
    flag: "🇦🇪",
    phoneCode: "+971",
    currency: { code: "AED", symbol: "AED" },
    states: [
      { name: "Dubai", cities: ["Downtown Dubai", "Dubai Marina", "Deira", "Bur Dubai", "Jumeirah"] },
      { name: "Abu Dhabi", cities: ["Abu Dhabi City", "Al Ain", "Al Dhafra"] },
      { name: "Sharjah", cities: ["Sharjah City", "Khor Fakkan", "Kalba"] }
    ]
  }
];

export const DEFAULT_COUNTRY = "Nigeria";
export const DEFAULT_STATE = "Lagos";
export const DEFAULT_CITY = "Ikeja";

export const getCountries = () => COUNTRIES;

export const getCountryByNameOrCode = (nameOrCode: string): CountryData => {
  const match = COUNTRIES.find(
    (c) => c.name.toLowerCase() === nameOrCode.toLowerCase() || c.code.toLowerCase() === nameOrCode.toLowerCase()
  );
  return match || COUNTRIES[0]; // defaults to Nigeria
};

export const getStatesForCountry = (countryName: string): StateData[] => {
  const country = getCountryByNameOrCode(countryName);
  return country ? country.states : [];
};

export const getCitiesForState = (countryName: string, stateName: string): string[] => {
  const states = getStatesForCountry(countryName);
  const state = states.find((s) => s.name.toLowerCase() === stateName.toLowerCase());
  return state ? state.cities : [];
};

export const formatCSC = (city?: string, state?: string, country?: string): string => {
  const parts = [city, state, country].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : `${DEFAULT_CITY}, ${DEFAULT_STATE}, ${DEFAULT_COUNTRY}`;
};

