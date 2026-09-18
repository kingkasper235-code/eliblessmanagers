import { createServerSupabaseClient } from "@/lib/supabase-server";

export type AdminPropertySummary = {
  id: number;
  title: string;
  slug: string;
  location: string | null;
  price: number | null;
  currency: string | null;
  property_type: string | null;
  listing_type: string | null;
  status: string | null;
  published: boolean | null;
  featured: boolean | null;
  created_at: string | null;
  image_url: string | null;
};

export async function getAdminDashboardStats() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      total: 0,
      published: 0,
      draft: 0,
      forSale: 0,
      forRent: 0,
      featured: 0,
      newEnquiries: 0,
      recent: [] as AdminPropertySummary[],
      error: "Supabase is not configured. Add your project URL and publishable key to continue.",
    };
  }

  const [propertiesResult, enquiriesResult] = await Promise.all([
    supabase
      .from("properties")
      .select("id, title, slug, location, price, currency, property_type, listing_type, status, published, featured, created_at, property_images(image_url, is_primary, display_order)")
      .order("created_at", { ascending: false }),
    supabase
      .from("enquiries")
      .select("id", { count: "exact" })
      .eq("status", "New"),
  ]);

  if (propertiesResult.error) {
    return {
      total: 0,
      published: 0,
      draft: 0,
      forSale: 0,
      forRent: 0,
      featured: 0,
      newEnquiries: 0,
      recent: [] as AdminPropertySummary[],
      error: propertiesResult.error.message,
    };
  }

  const properties = (propertiesResult.data ?? []).map((property) => {
    const images = Array.isArray(property.property_images) ? property.property_images : [];
    const primaryImage = images.find((image: { is_primary?: boolean }) => image.is_primary) ?? images[0] ?? null;

    return {
      ...property,
      image_url: primaryImage?.image_url ?? null,
    };
  });

  const stats = {
    total: properties.length,
    published: properties.filter((property) => property.published).length,
    draft: properties.filter((property) => !property.published).length,
    forSale: properties.filter((property) => property.listing_type === "sale").length,
    forRent: properties.filter((property) => property.listing_type === "rent").length,
    featured: properties.filter((property) => property.featured).length,
    newEnquiries: enquiriesResult.error ? 0 : enquiriesResult.count ?? 0,
    recent: properties.slice(0, 5),
    error: null as string | null,
  };

  return stats;
}

export async function getAdminPropertiesList({
  search = "",
  listingType = "all",
  published = "all",
  featured = "all",
  sort = "newest",
  page = 1,
  pageSize = 10,
}: {
  search?: string;
  listingType?: string;
  published?: string;
  featured?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
}) {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      items: [] as AdminPropertySummary[],
      total: 0,
      page: 1,
      pageSize,
      error: "Supabase is not configured. Add your project URL and publishable key to continue.",
    };
  }

  let query = supabase
    .from("properties")
    .select("id, title, slug, location, price, currency, property_type, listing_type, status, published, featured, created_at, property_images(image_url, is_primary, display_order)", {
      count: "exact",
    });

  if (search.trim()) {
    query = query.or(`title.ilike.%${search.trim()}%,location.ilike.%${search.trim()}%`);
  }

  if (listingType !== "all") {
    query = query.eq("listing_type", listingType);
  }

  if (published !== "all") {
    query = query.eq("published", published === "published");
  }

  if (featured !== "all") {
    query = query.eq("featured", featured === "featured");
  }

  const sortColumn =
    sort === "price-low" ? "price" : sort === "price-high" ? "price" : "created_at";
  const ascending = sort === "price-low";

  query = query.order(sortColumn, { ascending });

  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;
  query = query.range(start, end);

  const { data, error, count } = await query;

  if (error) {
    return {
      items: [] as AdminPropertySummary[],
      total: 0,
      page,
      pageSize,
      error: error.message,
    };
  }

  const items = ((data ?? []) as Array<Record<string, unknown>>).map((property) => {
    const images = Array.isArray(property.property_images) ? property.property_images : [];
    const primaryImage = images.find((image: { is_primary?: boolean }) => image.is_primary) ?? images[0] ?? null;

    return {
      ...(property as AdminPropertySummary),
      image_url: primaryImage?.image_url ?? null,
    };
  }) as AdminPropertySummary[];

  return {
    items,
    total: count ?? 0,
    page,
    pageSize,
    error: null,
  };
}

export async function getAdminPropertyById(propertyId: number) {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("properties")
    .select(
      "*, property_images(image_url, display_order), property_amenities(amenity)",
    )
    .eq("id", propertyId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}
