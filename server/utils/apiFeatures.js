/**
 * APIFeatures
 *
 * A utility class that wraps a Mongoose query and applies:
 *   - Keyword search  (search)
 *   - Field filtering (filter)
 *   - Sorting         (sort)
 *   - Field selection (limitFields)
 *   - Pagination      (paginate)
 *
 * Usage inside a controller:
 *
 *   const features = new APIFeatures(Model.find(), req.query)
 *     .search(['name', 'description', 'tags'])
 *     .filter()
 *     .sort()
 *     .limitFields()
 *     .paginate();
 *
 *   const docs = await features.query;
 *   const total = await features.countQuery; // for pagination meta
 */

const { PAGINATION } = require('../config/constants');

class APIFeatures {
  /**
   * @param {mongoose.Query} query        - Base Mongoose query (e.g. Model.find())
   * @param {Object}         queryString  - req.query object
   */
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
    this._filterConditions = {}; // stored for countQuery
    this._model = query.model;   // used to build countQuery
  }

  // ─── Keyword Search ─────────────────────────────────────────────────────────
  /**
   * search(fields)
   *
   * If ?search=<term> is present, applies a case-insensitive regex search
   * across the provided fields using $or.
   *
   * Falls back to MongoDB text index ($text) when fields is omitted and the
   * collection has a text index.
   *
   * @param {string[]} [fields] - Array of field paths to search in
   */
  search(fields = []) {
    const keyword = this.queryString.search;

    if (keyword && keyword.trim()) {
      const escapedKeyword = keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      let searchCondition;

      if (fields.length > 0) {
        searchCondition = {
          $or: fields.map((field) => ({
            [field]: { $regex: escapedKeyword, $options: 'i' },
          })),
        };
      } else {
        // Use MongoDB full-text search if no fields provided
        searchCondition = { $text: { $search: keyword.trim() } };
      }

      this.query = this.query.find(searchCondition);
      this._filterConditions = { ...this._filterConditions, ...searchCondition };
    }

    return this;
  }

  // ─── Filtering ──────────────────────────────────────────────────────────────
  /**
   * filter()
   *
   * Strips reserved query params (page, limit, sort, fields, search) and
   * converts MongoDB comparison operators from their URL-safe form:
   *   ?price[gte]=100  →  { price: { $gte: 100 } }
   *
   * Also supports:
   *   ?isActive=true   →  { isActive: true }   (boolean coercion)
   *   ?category=beach,mountain  →  { category: { $in: ['beach','mountain'] } }
   */
  filter() {
    const reserved = ['page', 'limit', 'sort', 'fields', 'search'];
    const queryObj = { ...this.queryString };
    reserved.forEach((key) => delete queryObj[key]);

    // Convert operator suffixes to Mongo operators
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt|ne|in|nin|all)\b/g, '$$$1');

    let parsedQuery = JSON.parse(queryStr);

    // ── Coerce types ──────────────────────────────────────────────────────────
    parsedQuery = coerceQueryValues(parsedQuery);

    this.query = this.query.find(parsedQuery);
    this._filterConditions = { ...this._filterConditions, ...parsedQuery };

    return this;
  }

  // ─── Sorting ────────────────────────────────────────────────────────────────
  /**
   * sort()
   *
   * ?sort=price,-rating  →  .sort('price -rating')
   * Default: sort by createdAt descending.
   */
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  // ─── Field Limiting ─────────────────────────────────────────────────────────
  /**
   * limitFields()
   *
   * ?fields=name,price,rating  →  .select('name price rating')
   * Always excludes __v.
   */
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  // ─── Pagination ─────────────────────────────────────────────────────────────
  /**
   * paginate()
   *
   * ?page=2&limit=20
   * Returns this for chaining; sets this.paginationMeta for use after await.
   */
  paginate() {
    const page = Math.max(
      1,
      parseInt(this.queryString.page, 10) || PAGINATION.DEFAULT_PAGE
    );
    const limit = Math.min(
      PAGINATION.MAX_LIMIT,
      Math.max(1, parseInt(this.queryString.limit, 10) || PAGINATION.DEFAULT_LIMIT)
    );
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    this.paginationMeta = { page, limit, skip };

    // Build a count query with the same filter conditions
    if (this._model) {
      this.countQuery = this._model.countDocuments(this._filterConditions);
    }

    return this;
  }

  // ─── Populate ───────────────────────────────────────────────────────────────
  /**
   * populate(options)
   *
   * Thin wrapper around Mongoose's .populate() so it can be chained with the
   * rest of the APIFeatures pipeline.
   *
   * @param {string|Object|Array} options - Mongoose populate options
   */
  populate(options) {
    this.query = this.query.populate(options);
    return this;
  }

  // ─── Pagination Meta (async) ─────────────────────────────────────────────────
  /**
   * getPaginationMeta(total)
   *
   * Returns a pagination metadata object.
   *
   * @param {number} total - Total document count (from countQuery)
   */
  getPaginationMeta(total) {
    const { page, limit } = this.paginationMeta || {
      page: 1,
      limit: PAGINATION.DEFAULT_LIMIT,
    };
    const totalPages = Math.ceil(total / limit);

    return {
      total,
      totalPages,
      currentPage: page,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null,
    };
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Recursively coerce string values in a query object to their proper types:
 *   'true'/'false'  → Boolean
 *   numeric strings → Number
 *   comma-separated → { $in: [...] }
 */
function coerceQueryValues(obj) {
  if (obj === null || typeof obj !== 'object') return obj;

  const result = {};

  for (const [key, value] of Object.entries(obj)) {
    if (Array.isArray(value)) {
      result[key] = value.map(coercePrimitive);
    } else if (value !== null && typeof value === 'object') {
      result[key] = coerceQueryValues(value);
    } else if (typeof value === 'string' && value.includes(',')) {
      // comma-separated list → $in
      result[key] = { $in: value.split(',').map((v) => coercePrimitive(v.trim())) };
    } else {
      result[key] = coercePrimitive(value);
    }
  }

  return result;
}

function coercePrimitive(value) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null') return null;
  if (!isNaN(value) && value !== '' && value !== null) return Number(value);
  return value;
}

module.exports = APIFeatures;
