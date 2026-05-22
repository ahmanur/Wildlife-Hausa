import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  DocumentData,
  QueryConstraint,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import { COLLECTIONS } from './collections';
import {
  MOCK_SAFARI_PACKAGES,
  MOCK_MEDIA_ITEMS,
  MOCK_MAP_LOCATIONS,
  MOCK_ADVENTURE_ACTIVITIES,
  MOCK_CONSERVATION_NOTES,
} from './mockData';

// ───────────────────────────────────────────────
// Timeout Helper
// ───────────────────────────────────────────────

function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 3000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Firestore operation timed out')), timeoutMs)
    ),
  ]);
}

// ───────────────────────────────────────────────
// Seeding Helper
// ───────────────────────────────────────────────

async function seedCollectionIfNeeded(collectionName: string): Promise<boolean> {
  const ref = collection(db, collectionName);
  const snapshot = await getDocs(query(ref, limit(1)));
  
  if (!snapshot.empty) {
    return false; // Already has data, no seeding needed
  }

  console.log(`Seeding empty collection: ${collectionName}`);
  let dataToSeed: any[] = [];
  if (collectionName === COLLECTIONS.SAFARI_PACKAGES) {
    dataToSeed = MOCK_SAFARI_PACKAGES;
  } else if (collectionName === COLLECTIONS.MEDIA_ITEMS) {
    dataToSeed = MOCK_MEDIA_ITEMS;
  } else if (collectionName === COLLECTIONS.MAP_LOCATIONS) {
    dataToSeed = MOCK_MAP_LOCATIONS;
  } else if (collectionName === COLLECTIONS.ADVENTURE_ACTIVITIES) {
    dataToSeed = MOCK_ADVENTURE_ACTIVITIES;
  } else if (collectionName === COLLECTIONS.CONSERVATION_NOTES) {
    dataToSeed = MOCK_CONSERVATION_NOTES;
  }

  if (dataToSeed.length === 0) {
    return false;
  }

  // Seed documents sequentially
  for (const item of dataToSeed) {
    await addDoc(ref, {
      ...item,
      createdAt: serverTimestamp(),
    });
  }
  return true;
}

// ───────────────────────────────────────────────
// LocalStorage caching helpers for offline demo persistence
// ───────────────────────────────────────────────

function getDefaultMockData(collectionName: string): any[] {
  let mockData: any[] = [];
  if (collectionName === COLLECTIONS.SAFARI_PACKAGES) {
    mockData = MOCK_SAFARI_PACKAGES;
  } else if (collectionName === COLLECTIONS.MEDIA_ITEMS) {
    mockData = MOCK_MEDIA_ITEMS;
  } else if (collectionName === COLLECTIONS.MAP_LOCATIONS) {
    mockData = MOCK_MAP_LOCATIONS;
  } else if (collectionName === COLLECTIONS.ADVENTURE_ACTIVITIES) {
    mockData = MOCK_ADVENTURE_ACTIVITIES;
  } else if (collectionName === COLLECTIONS.CONSERVATION_NOTES) {
    mockData = MOCK_CONSERVATION_NOTES;
  }
  return mockData.map((item, index) => ({
    id: item.id || `mock-${collectionName}-${index}`,
    ...item
  }));
}

function getLocalCache<T = any>(collectionName: string): (T & { id: string })[] {
  if (typeof window === 'undefined') {
    return getDefaultMockData(collectionName) as (T & { id: string })[];
  }
  const key = `wild_hausa_cache_${collectionName}`;
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return JSON.parse(stored) as (T & { id: string })[];
    } catch (e) {
      console.error(`Failed to parse cache for ${collectionName}`, e);
    }
  }
  const defaults = getDefaultMockData(collectionName);
  localStorage.setItem(key, JSON.stringify(defaults));
  return defaults as (T & { id: string })[];
}

function saveLocalCache(collectionName: string, data: any[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`wild_hausa_cache_${collectionName}`, JSON.stringify(data));
  }
}

// ───────────────────────────────────────────────
// Generic CRUD helpers
// ───────────────────────────────────────────────

/** Fetch all documents from a collection, with optional query constraints. */
export async function fetchCollection<T = DocumentData>(
  collectionName: string,
  ...constraints: QueryConstraint[]
): Promise<(T & { id: string })[]> {
  try {
    // Seed first if empty
    await withTimeout(seedCollectionIfNeeded(collectionName), 2000);
  } catch (err) {
    console.warn(`Seeding check failed or timed out for ${collectionName}:`, err);
  }

  try {
    const ref = collection(db, collectionName);
    const q = constraints.length > 0 ? query(ref, ...constraints) : ref;
    const snapshot = await withTimeout(getDocs(q), 3000);
    const rawDocs = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as T) }));
    // Deduplicate by title or id to prevent seeded + cached duplicates
    const seen = new Map<string, typeof rawDocs[0]>();
    for (const doc of rawDocs) {
      const key = (doc as any).title || (doc as any).slug || doc.id;
      if (!seen.has(key)) {
        seen.set(key, doc);
      }
    }
    const docs = Array.from(seen.values());
    // Update local cache
    saveLocalCache(collectionName, docs);
    return docs;
  } catch (err) {
    console.error(`Firestore fetch failed for collection ${collectionName}, falling back to localStorage cache:`, err);
    return getLocalCache<T>(collectionName);
  }
}

/** Fetch a single document by ID. */
export async function fetchDocument<T = DocumentData>(
  collectionName: string,
  documentId: string
): Promise<(T & { id: string }) | null> {
  try {
    const docRef = doc(db, collectionName, documentId);
    const snap = await withTimeout(getDoc(docRef), 3000);
    if (!snap.exists()) return null;
    const docData = { id: snap.id, ...(snap.data() as T) };
    return docData;
  } catch (err) {
    console.error(`Firestore fetchDocument failed for ${collectionName}/${documentId}, falling back to localStorage cache:`, err);
    const cache = getLocalCache<T>(collectionName);
    const found = cache.find(item => item.id === documentId);
    return found || null;
  }
}

/** Create a new document (auto-generated ID). */
export async function createDocument(
  collectionName: string,
  data: Record<string, unknown>
) {
  try {
    const ref = collection(db, collectionName);
    const docRef = await withTimeout(addDoc(ref, { ...data, createdAt: serverTimestamp() }), 3000);
    // Sync to cache
    const current = getLocalCache(collectionName);
    const newDoc = { id: docRef.id, ...data };
    saveLocalCache(collectionName, [newDoc, ...current]);
    return docRef;
  } catch (err) {
    console.error(`Firestore createDocument failed for ${collectionName}, simulating local success:`, err);
    const newId = `mock-new-doc-${Date.now()}`;
    const current = getLocalCache(collectionName);
    const newDoc = { id: newId, ...data };
    saveLocalCache(collectionName, [newDoc, ...current]);
    return { id: newId } as any;
  }
}

/** Update fields on an existing document. */
export async function updateDocument(
  collectionName: string,
  documentId: string,
  data: Record<string, unknown>
) {
  try {
    const docRef = doc(db, collectionName, documentId);
    const res = await withTimeout(setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true }), 3000);
    // Sync to cache
    const current = getLocalCache(collectionName);
    const exists = current.some(item => item.id === documentId);
    const updated = exists
      ? current.map(item => item.id === documentId ? { ...item, ...data } : item)
      : [...current, { id: documentId, ...data }];
    saveLocalCache(collectionName, updated);
    return res;
  } catch (err) {
    console.error(`Firestore updateDocument failed for ${collectionName}/${documentId}, simulating local success:`, err);
    const current = getLocalCache(collectionName);
    const exists = current.some(item => item.id === documentId);
    const updated = exists
      ? current.map(item => item.id === documentId ? { ...item, ...data } : item)
      : [...current, { id: documentId, ...data }];
    saveLocalCache(collectionName, updated);
    return { success: true, simulated: true } as any;
  }
}

/** Delete a document. */
export async function removeDocument(
  collectionName: string,
  documentId: string
) {
  try {
    const docRef = doc(db, collectionName, documentId);
    const res = await withTimeout(deleteDoc(docRef), 3000);
    // Sync to cache
    const current = getLocalCache(collectionName);
    const updated = current.filter(item => item.id !== documentId);
    saveLocalCache(collectionName, updated);
    return res;
  } catch (err) {
    console.error(`Firestore removeDocument failed for ${collectionName}/${documentId}, simulating local success:`, err);
    const current = getLocalCache(collectionName);
    const updated = current.filter(item => item.id !== documentId);
    saveLocalCache(collectionName, updated);
    return { success: true, simulated: true } as any;
  }
}

// ───────────────────────────────────────────────
// Domain-specific helpers
// ───────────────────────────────────────────────

/** Fetch all safari packages, ordered by creation date. */
export async function getSafariPackages() {
  return fetchCollection<any>(COLLECTIONS.SAFARI_PACKAGES, orderBy('createdAt', 'desc'));
}

/** Fetch a single safari package by its document ID. */
export async function getSafariPackage(id: string) {
  return fetchDocument<any>(COLLECTIONS.SAFARI_PACKAGES, id);
}

/** Fetch a single safari package by its slug. */
export async function getSafariPackageBySlug(slug: string) {
  // Ensure the collection is seeded first
  try {
    await withTimeout(seedCollectionIfNeeded(COLLECTIONS.SAFARI_PACKAGES), 2000);
  } catch (err) {
    console.error('Seeding check failed for safari packages:', err);
  }
  
  try {
    const ref = collection(db, COLLECTIONS.SAFARI_PACKAGES);
    const q = query(ref, where('slug', '==', slug));
    const snapshot = await withTimeout(getDocs(q), 3000);
    if (snapshot.empty) return null;
    
    const docs = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as any)
    }));

    docs.sort((a, b) => {
      const getTimestamp = (doc: any) => {
        if (!doc) return 0;
        const time = doc.updatedAt || doc.createdAt;
        if (!time) return 0;
        if (typeof time.toMillis === 'function') return time.toMillis();
        if (typeof time.toDate === 'function') return time.toDate().getTime();
        if (time.seconds !== undefined) return time.seconds * 1000;
        if (typeof time === 'string') return new Date(time).getTime();
        if (time instanceof Date) return time.getTime();
        return 0;
      };
      return getTimestamp(b) - getTimestamp(a);
    });

    return docs[0];
  } catch (err) {
    console.error(`Firestore getSafariPackageBySlug failed for ${slug}, falling back to localStorage cache:`, err);
    const current = getLocalCache(COLLECTIONS.SAFARI_PACKAGES);
    const found = current.find(p => p.slug === slug);
    return found || null;
  }
}

export async function getMapLocations() {
  return fetchCollection<any>(COLLECTIONS.MAP_LOCATIONS);
}

/** Fetch all media items (documentaries, field notes, etc.). */
export async function getMediaItems() {
  return fetchCollection<any>(COLLECTIONS.MEDIA_ITEMS, orderBy('createdAt', 'desc'));
}

/** Fetch all adventure activities. */
export async function getAdventureActivities() {
  return fetchCollection<any>(COLLECTIONS.ADVENTURE_ACTIVITIES, orderBy('order', 'asc'));
}

/** Fetch all conservation notes. */
export async function getConservationNotes() {
  return fetchCollection<any>(COLLECTIONS.CONSERVATION_NOTES, orderBy('order', 'asc'));
}

/** Submit a contact enquiry. */
export async function submitEnquiry(data: Record<string, unknown>) {
  return createDocument(COLLECTIONS.ENQUIRIES, data);
}

/** Fetch all enquiries. */
export async function getEnquiries() {
  return fetchCollection<any>(COLLECTIONS.ENQUIRIES, orderBy('createdAt', 'desc'));
}

// ───────────────────────────────────────────────
// Booking helpers
// ───────────────────────────────────────────────

/** Submit a safari booking request. */
export async function submitBooking(data: Record<string, unknown>) {
  return createDocument(COLLECTIONS.BOOKINGS, { ...data, status: 'pending' });
}

/** Fetch all bookings. */
export async function getBookings() {
  return fetchCollection<any>(COLLECTIONS.BOOKINGS, orderBy('createdAt', 'desc'));
}

/** Update booking status. */
export async function updateBookingStatus(id: string, status: string) {
  return updateDocument(COLLECTIONS.BOOKINGS, id, { status });
}

// ───────────────────────────────────────────────
// Newsletter helpers
// ───────────────────────────────────────────────

/** Subscribe an email to the newsletter. */
export async function subscribeNewsletter(email: string) {
  return createDocument(COLLECTIONS.NEWSLETTER_SUBSCRIBERS, { email, subscribedAt: new Date().toISOString() });
}

/** Fetch all newsletter subscribers. */
export async function getNewsletterSubscribers() {
  return fetchCollection<any>(COLLECTIONS.NEWSLETTER_SUBSCRIBERS, orderBy('createdAt', 'desc'));
}
// ───────────────────────────────────────────────
// CMS Pages Content
// ───────────────────────────────────────────────

/** Fetch About Page content */
export async function getAboutContent() {
  return fetchDocument<any>('settings', 'about');
}

/** Update About Page content */
export async function updateAboutContent(data: Record<string, unknown>) {
  return updateDocument('settings', 'about', data);
}

/** Fetch Services Page content */
export async function getServicesContent() {
  return fetchDocument<any>('settings', 'services');
}

/** Update Services Page content */
export async function updateServicesContent(data: Record<string, unknown>) {
  return updateDocument('settings', 'services', data);
}
