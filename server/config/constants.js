// ─── Roles ────────────────────────────────────────────────────────────────────
const ROLES = {
  TOURIST: 'tourist',
  ADMIN: 'admin',
  AGENT: 'agent',
};

// ─── Trip Status ──────────────────────────────────────────────────────────────
const TRIP_STATUS = {
  DRAFT: 'draft',
  PLANNED: 'planned',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// ─── Booking Types ────────────────────────────────────────────────────────────
const BOOKING_TYPES = {
  ACCOMMODATION: 'accommodation',
  TRANSPORT: 'transport',
  ACTIVITY: 'activity',
  TOUR: 'tour',
};

// ─── Booking Status ───────────────────────────────────────────────────────────
const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
};

// ─── Payment Status ───────────────────────────────────────────────────────────
const PAYMENT_STATUS = {
  UNPAID: 'unpaid',
  PARTIAL: 'partial',
  PAID: 'paid',
  REFUNDED: 'refunded',
};

// ─── Activity Types ───────────────────────────────────────────────────────────
const ACTIVITY_TYPES = {
  SIGHTSEEING: 'sightseeing',
  TRANSPORT: 'transport',
  ACCOMMODATION: 'accommodation',
  FOOD: 'food',
  ACTIVITY: 'activity',
  REST: 'rest',
};

// ─── Destination Categories ───────────────────────────────────────────────────
const DESTINATION_CATEGORIES = [
  'beach',
  'mountain',
  'heritage',
  'wildlife',
  'adventure',
  'spiritual',
  'city',
];

// ─── Travel Styles ────────────────────────────────────────────────────────────
const TRAVEL_STYLES = ['solo', 'couple', 'family', 'group', 'backpacker'];

// ─── Interests ────────────────────────────────────────────────────────────────
const INTERESTS = [
  'adventure',
  'history',
  'nature',
  'food',
  'relaxation',
  'photography',
];

// ─── Expense Categories ───────────────────────────────────────────────────────
const EXPENSE_CATEGORIES = {
  TRANSPORT: 'transport',
  ACCOMMODATION: 'accommodation',
  FOOD: 'food',
  SIGHTSEEING: 'sightseeing',
  SHOPPING: 'shopping',
  MISC: 'misc',
};

// ─── Travel Types (for reviews) ───────────────────────────────────────────────
const TRAVEL_TYPES = ['solo', 'couple', 'family', 'group', 'business'];

// ─── Contact Message Status ───────────────────────────────────────────────────
const CONTACT_STATUS = {
  NEW: 'new',
  READ: 'read',
  REPLIED: 'replied',
};

// ─── Attraction Types ─────────────────────────────────────────────────────────
const ATTRACTION_TYPES = [
  'museum',
  'temple',
  'park',
  'beach',
  'market',
  'monument',
  'adventure',
  'restaurant',
  'hotel',
  'other',
];

// ─── JWT / Auth ───────────────────────────────────────────────────────────────
const JWT_EXPIRE = process.env.JWT_EXPIRE || '30d';
const JWT_COOKIE_EXPIRE = parseInt(process.env.JWT_COOKIE_EXPIRE, 10) || 30;

// ─── Pagination Defaults ──────────────────────────────────────────────────────
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

// ─── File Upload ──────────────────────────────────────────────────────────────
const UPLOAD = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5 MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
};

module.exports = {
  ROLES,
  TRIP_STATUS,
  BOOKING_TYPES,
  BOOKING_STATUS,
  PAYMENT_STATUS,
  ACTIVITY_TYPES,
  DESTINATION_CATEGORIES,
  TRAVEL_STYLES,
  INTERESTS,
  EXPENSE_CATEGORIES,
  TRAVEL_TYPES,
  CONTACT_STATUS,
  ATTRACTION_TYPES,
  JWT_EXPIRE,
  JWT_COOKIE_EXPIRE,
  PAGINATION,
  UPLOAD,
};
