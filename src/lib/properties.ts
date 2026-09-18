import { supabase } from "@/lib/supabase";

export type ListingType = "sale" | "rent";
export type PropertyStatus = "available" | "pending" | "sold" | "leased" | "rented" | "unavailable";

export type PropertySearchFilters = {
  listingType?: string;
  location?: string;
  propertyType?: string;
  minPrice?: number | null;
  maxPrice?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  status?: string;
  sort?: "newest" | "price-low" | "price-high";
};

export type DbProperty = {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  price: number | string;
  currency: string | null;
  property_type: string | null;
  listing_type: ListingType | null;
  location: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  toilets: number | null;
  property_size: number | null;
  year_built: number | null;
  status: PropertyStatus | null;
  featured: boolean | null;
  published: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  property_images?: Array<{ image_url: string; display_order: number }> | null;
  property_amenities?: Array<{ name: string }> | null;
};

export type Property = {
  id: number;
  slug: string;
  title: string;
  description: string;
  price: string;
  priceValue: number;
  currency: string;
  property_type: string;
  listing_type: ListingType;
  location: string;
  address: string;
  city: string;
  state: string;
  bedrooms: number;
  bathrooms: number;
  toilets: number;
  property_size: number;
  size: string;
  year_built: number | null;
  status: string;
  featured: boolean;
  published: boolean;
  image: string;
  gallery: string[];
  features: string[];
  type: string;
};

const fallbackImage =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80";

function formatPrice(value: number, currency: string, listingType: ListingType) {
  const formatted = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);

  return listingType === "rent" ? `${formatted} / year` : formatted;
}

function normalizeProperty(record: DbProperty): Property {
  const priceValue = Number(record.price ?? 0);
  const currency = record.currency ?? "NGN";
  const listingType = record.listing_type ?? "sale";
  const propertyType = record.property_type ?? "Apartment";
  const location = record.location ?? [record.city, record.state].filter(Boolean).join(", ") ?? "Nigeria";
  const gallery = (record.property_images ?? [])
    .slice()
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
    .map((item) => item.image_url)
    .filter(Boolean);

  const features = (record.property_amenities ?? [])
    .map((item) => item.name)
    .filter(Boolean);

  const propertySize = Number(record.property_size ?? 0);

  return {
    id: Number(record.id),
    slug: record.slug,
    title: record.title,
    description: record.description ?? "A premium property opportunity in Nigeria.",
    price: formatPrice(priceValue, currency, listingType),
    priceValue,
    currency,
    property_type: propertyType,
    listing_type: listingType,
    location,
    address: record.address ?? location,
    city: record.city ?? "Nigeria",
    state: record.state ?? "Nigeria",
    bedrooms: Number(record.bedrooms ?? 0),
    bathrooms: Number(record.bathrooms ?? 0),
    toilets: Number(record.toilets ?? 0),
    property_size: propertySize,
    size: propertySize ? `${propertySize.toLocaleString()} sq ft` : "N/A",
    year_built: record.year_built ?? null,
    status: record.listing_type === "sale" ? "For Sale" : "For Rent",
    featured: Boolean(record.featured),
    published: Boolean(record.published),
    image: gallery[0] ?? fallbackImage,
    gallery: gallery.length ? gallery : [fallbackImage],
    features: features.length ? features : ["Secure location", "Modern finish", "Good access"],
    type: propertyType,
  };
}

async function fetchProperties({
  limit,
  listingType,
  featured,
  filters,
}: {
  limit?: number;
  listingType?: ListingType;
  featured?: boolean;
  filters?: PropertySearchFilters;
} = {}) {
  if (!supabase) {
    return [];
  }

  try {
    let query = supabase
      .from("properties")
      .select("*, property_images(image_url, display_order), property_amenities(name)")
      .eq("published", true)
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false });

    const activeFilters = filters ?? {};

    if (listingType) {
      query = query.eq("listing_type", listingType);
    }

    if (activeFilters.listingType && activeFilters.listingType !== "all") {
      query = query.eq("listing_type", activeFilters.listingType);
    }

    if (activeFilters.location) {
      const term = activeFilters.location.trim();
      if (term) {
        query = query.or(`location.ilike.%${term}%,city.ilike.%${term}%,state.ilike.%${term}%`);
      }
    }

    if (activeFilters.propertyType && activeFilters.propertyType !== "all") {
      query = query.eq("property_type", activeFilters.propertyType);
    }

    if (activeFilters.status && activeFilters.status !== "all") {
      query = query.eq("status", activeFilters.status);
    }

    if (typeof activeFilters.minPrice === "number" && Number.isFinite(activeFilters.minPrice)) {
      query = query.gte("price", activeFilters.minPrice);
    }

    if (typeof activeFilters.maxPrice === "number" && Number.isFinite(activeFilters.maxPrice)) {
      query = query.lte("price", activeFilters.maxPrice);
    }

    if (typeof activeFilters.bedrooms === "number" && Number.isFinite(activeFilters.bedrooms)) {
      query = query.gte("bedrooms", activeFilters.bedrooms);
    }

    if (typeof activeFilters.bathrooms === "number" && Number.isFinite(activeFilters.bathrooms)) {
      query = query.gte("bathrooms", activeFilters.bathrooms);
    }

    if (featured !== undefined) {
      query = query.eq("featured", featured);
    }

    if (activeFilters.sort === "price-low") {
      query = query.order("price", { ascending: true });
    } else if (activeFilters.sort === "price-high") {
      query = query.order("price", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return (data ?? []).map(normalizeProperty);
  } catch (error) {
    console.error("Failed to load properties from Supabase", error);
    return [];
  }
}

export async function getProperties(filters?: PropertySearchFilters): Promise<Property[]> {
  return fetchProperties({ filters });
}

export async function getFeaturedProperties(limit = 3): Promise<Property[]> {
  return fetchProperties({ featured: true, limit });
}

export async function getLatestProperties(limit = 3): Promise<Property[]> {
  return fetchProperties({ limit });
}

export async function getPropertiesByListingType(
  listingType: ListingType,
  filters?: Omit<PropertySearchFilters, "listingType">,
): Promise<Property[]> {
  return fetchProperties({ listingType, filters });
}

export async function searchProperties(filters: PropertySearchFilters = {}): Promise<Property[]> {
  return fetchProperties({ filters });
}

export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  if (!supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("properties")
      .select("*, property_images(image_url, display_order), property_amenities(name)")
      .eq("published", true)
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? normalizeProperty(data as DbProperty) : null;
  } catch (error) {
    console.error("Failed to find property by slug", error);
    return null;
  }
}

export async function getSimilarProperties(slug: string, limit = 3): Promise<Property[]> {
  const related = await getProperties();
  return related.filter((property) => property.slug !== slug).slice(0, limit);
}

export const propertyTypes = [
  "Apartment",
  "Duplex",
  "Villa",
  "Townhouse",
  "Office",
  "Land",
] as const;
