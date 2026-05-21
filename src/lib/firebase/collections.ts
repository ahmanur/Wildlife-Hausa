/**
 * Firestore Collection References
 * 
 * Central registry of all Firestore collection names used by the Wild Hausa platform.
 * Import these constants instead of hard-coding collection strings throughout the app.
 */

export const COLLECTIONS = {
  /** Safari expedition packages (name, duration, price, itinerary, etc.) */
  SAFARI_PACKAGES: 'safari_packages',

  /** Interactive map markers with coordinates and metadata */
  MAP_LOCATIONS: 'map_locations',

  /** Documentaries and other media items */
  MEDIA_ITEMS: 'media_items',

  /** Contact form enquiries submitted by visitors */
  ENQUIRIES: 'enquiries',

  /** Adventure park activities and events */
  ADVENTURE_ACTIVITIES: 'adventure_activities',

  /** Conservation field notes and classroom entries */
  CONSERVATION_NOTES: 'conservation_notes',

  /** Safari booking requests from visitors */
  BOOKINGS: 'bookings',

  /** Newsletter email subscribers */
  NEWSLETTER_SUBSCRIBERS: 'newsletter_subscribers',
} as const;
