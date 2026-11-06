// Server-side Google Places API (New). Never replace Google data with sample reviews.
export interface GoogleReviewItem {
 author_name: string;
 author_avatar: string;
 author_url?: string;
 relative_time_description: string;
 rating: number;
 text: string;
}

export interface GooglePlaceReviewsData {
 rating: number;
 user_ratings_total: number;
 reviews: GoogleReviewItem[];
 place_id: string;
}

interface PlaceDetails {
 rating?: number;
 userRatingCount?: number;
 reviews?: Array<{
  authorAttribution?: { displayName?: string; uri?: string };
  relativePublishTimeDescription?: string;
  rating?: number;
  text?: { text?: string };
 }>;
}

function googleMapsAuthorUrl(value?: string): string | undefined {
 if (!value) return undefined;
 try {
  const url = new URL(value);
  return url.protocol === 'https:' && (url.hostname === 'www.google.com' || url.hostname === 'maps.google.com')
   ? url.href : undefined;
 } catch {
  return undefined;
 }
}

export async function getGooglePlaceReviews(options: {
 placeId?: string | null;
 apiKey?: string | null;
}): Promise<GooglePlaceReviewsData | null> {
 const placeId = options.placeId?.trim();
 const apiKey = options.apiKey?.trim();
 if (!apiKey || !placeId) return null;

 try {
  const response = await fetch(
   `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=ja`,
   {
    headers: {
     'X-Goog-Api-Key': apiKey,
     'X-Goog-FieldMask': 'rating,userRatingCount,reviews',
    },
    signal: AbortSignal.timeout(5000),
    cache: 'no-store',
   },
  );
  if (!response.ok) {
   console.warn(`[GooglePlaces] Place Details (New) failed: HTTP ${response.status}`);
   return null;
  }

  const data = await response.json() as PlaceDetails;
  if (typeof data.rating !== 'number' || !Number.isFinite(data.rating) || data.rating < 1 || data.rating > 5 ||
   typeof data.userRatingCount !== 'number' || !Number.isInteger(data.userRatingCount) || data.userRatingCount < 0) {
   return null;
  }

  return {
   rating: data.rating,
   user_ratings_total: data.userRatingCount,
   place_id: placeId,
   // Preserve Google's relevance order and author attribution at every star rating.
   reviews: (data.reviews || [])
    .filter(review => review.authorAttribution?.displayName && review.text?.text &&
     Number.isInteger(review.rating) && review.rating! >= 1 && review.rating! <= 5)
    .map(review => ({
     author_name: review.authorAttribution!.displayName!,
     author_avatar: Array.from(review.authorAttribution!.displayName!)[0],
     author_url: googleMapsAuthorUrl(review.authorAttribution?.uri),
     relative_time_description: review.relativePublishTimeDescription || '',
     rating: review.rating!,
     text: review.text!.text!,
    })),
  };
 } catch {
  // Do not log request URLs or errors that might contain credentials.
  console.warn('[GooglePlaces] Place Details (New) unavailable');
  return null;
 }
}
