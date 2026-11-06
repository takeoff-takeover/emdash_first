import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getGooglePlaceReviews } from '../src/utils/google-places.ts';

test('Places API New request, attribution, and unavailable states', async () => {
 const originalFetch = globalThis.fetch;
 const originalWarn = console.warn;
 const warnings = [];
 console.warn = message => warnings.push(message);
 try {
  let calls = 0;
  globalThis.fetch = async (url, options) => {
   calls++;
   assert.equal(url, 'https://places.googleapis.com/v1/places/ChIJ-example?languageCode=ja');
   assert.equal(options.headers['X-Goog-Api-Key'], 'test-secret');
   assert.equal(options.headers['X-Goog-FieldMask'], 'rating,userRatingCount,reviews');
   assert.equal(options.cache, 'no-store');
   return Response.json({ rating: 3.8, userRatingCount: 12, reviews: [
    { rating: 2, text: { text: '低評価の実際の投稿' }, authorAttribution: { displayName: '投稿者名', uri: 'https://www.google.com/maps/contrib/123' }, relativePublishTimeDescription: '1週間前' },
    { rating: 5, text: { text: '短文' }, authorAttribution: { displayName: '別の投稿者', uri: 'javascript:alert(1)' } },
   ] });
  };
  assert.equal(await getGooglePlaceReviews({ placeId: 'ChIJ-example' }), null);
  assert.equal(await getGooglePlaceReviews({ apiKey: 'test-secret' }), null);
  assert.equal(calls, 0);
  const result = await getGooglePlaceReviews({ placeId: ' ChIJ-example ', apiKey: 'test-secret' });
  assert.equal(result.rating, 3.8);
  assert.equal(result.user_ratings_total, 12);
  assert.deepEqual(result.reviews.map(review => review.rating), [2, 5]);
  assert.equal(result.reviews[0].author_name, '投稿者名');
  assert.equal(result.reviews[0].author_url, 'https://www.google.com/maps/contrib/123');
  assert.equal(result.reviews[1].author_url, undefined);
  for (const status of [403, 429, 500]) {
   globalThis.fetch = async () => new Response('', { status });
   assert.equal(await getGooglePlaceReviews({ placeId: 'id', apiKey: 'test-secret' }), null);
  }
  globalThis.fetch = async () => { throw new Error('test-secret'); };
  assert.equal(await getGooglePlaceReviews({ placeId: 'id', apiKey: 'test-secret' }), null);
  assert.ok(warnings.every(message => !message.includes('test-secret')));
  for (const data of [{}, { rating: 6, userRatingCount: 1 }, { rating: 4, userRatingCount: -1 }]) {
   globalThis.fetch = async () => Response.json(data);
   assert.equal(await getGooglePlaceReviews({ placeId: 'id', apiKey: 'test-secret' }), null);
  }
  globalThis.fetch = async () => Response.json({ rating: 4, userRatingCount: 1 });
  assert.deepEqual((await getGooglePlaceReviews({ placeId: 'id', apiKey: 'test-secret' })).reviews, []);
 } finally {
  globalThis.fetch = originalFetch;
  console.warn = originalWarn;
 }
});
