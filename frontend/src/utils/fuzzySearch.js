/**
 * High-performance Fuzzy Search with typo tolerance, accent folding, and weighted multi-field scoring.
 */

// Helper to normalize string for comparison
export function normalize(str) {
  if (!str || typeof str !== "string") return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics / accents
    .trim();
}

// Levenshtein distance calculation for typo tolerance
function levenshteinDistance(s1, s2) {
  const m = s1.length;
  const n = s2.length;
  if (m === 0) return n;
  if (n === 0) return m;

  // Single row memory optimization
  let row = Array.from({ length: n + 1 }, (_, i) => i);

  for (let i = 1; i <= m; i++) {
    const nextRow = [i];
    const c1 = s1[i - 1];

    for (let j = 1; j <= n; j++) {
      const c2 = s2[j - 1];
      const cost = c1 === c2 ? 0 : 1;
      nextRow[j] = Math.min(
        nextRow[j - 1] + 1,      // insertion
        row[j] + 1,              // deletion
        row[j - 1] + cost        // substitution
      );
    }
    row = nextRow;
  }

  return row[n];
}

// Score a single string target against search tokens
function scoreText(target, tokens) {
  if (!target) return 0;
  const normalizedTarget = normalize(target);
  if (!normalizedTarget) return 0;

  const targetWords = normalizedTarget.split(/\s+/);
  let totalScore = 0;

  for (const token of tokens) {
    if (!token) continue;
    let tokenBestScore = 0;

    // 1. Exact full match
    if (normalizedTarget === token) {
      tokenBestScore = Math.max(tokenBestScore, 100);
    }
    // 2. Contains entire substring
    else if (normalizedTarget.includes(token)) {
      tokenBestScore = Math.max(tokenBestScore, 80);
    }

    // 3. Word-by-word checks
    for (const word of targetWords) {
      if (word === token) {
        tokenBestScore = Math.max(tokenBestScore, 90);
      } else if (word.startsWith(token)) {
        tokenBestScore = Math.max(tokenBestScore, 75);
      } else if (token.length >= 3) {
        // Typo tolerance based on Levenshtein distance
        const maxDistance = token.length <= 4 ? 1 : token.length <= 8 ? 2 : 3;
        const dist = levenshteinDistance(token, word);
        if (dist <= maxDistance) {
          const matchPercent = 1 - dist / Math.max(token.length, word.length);
          tokenBestScore = Math.max(tokenBestScore, 40 * matchPercent);
        }
      }
    }

    if (tokenBestScore > 0) {
      totalScore += tokenBestScore;
    } else {
      // If token didn't match anywhere in this target, slight penalty
      totalScore -= 10;
    }
  }

  return Math.max(totalScore, 0);
}

/**
 * Fuzzy search motel listings by location (city, state, country, address), title, and category.
 * @param {Array} listings - Array of motel listing objects
 * @param {string} query - Search string from user
 * @param {number} threshold - Minimum score threshold (default 15)
 * @returns {Array} - Ranked and filtered listings
 */
export function fuzzySearchListings(listings, query, threshold = 15) {
  if (!Array.isArray(listings) || listings.length === 0) return [];
  if (!query || typeof query !== "string" || !query.trim()) return listings;

  const cleanQuery = normalize(query);
  const tokens = cleanQuery.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return listings;

  const scoredListings = [];

  for (const listing of listings) {
    let score = 0;

    // Fields with weighting multipliers
    const country = listing.location?.country?.name || "";
    const state = listing.location?.state?.name || "";
    const city = listing.location?.city?.name || "";
    const address = listing.location?.addressLineOne || "";
    const landmark = listing.location?.landMark || "";
    const title = listing.title || "";
    const category = listing.category || listing.houseType || "";
    const description = listing.description || "";

    // 1. Location matches (Weight: 3.5x for Country & City)
    score += scoreText(country, tokens) * 3.5;
    score += scoreText(city, tokens) * 3.5;
    score += scoreText(state, tokens) * 2.5;
    score += scoreText(address, tokens) * 2.0;
    score += scoreText(landmark, tokens) * 2.0;

    // 2. Title & Category matches (Weight: 3.0x for Title, 2.0x for Category)
    score += scoreText(title, tokens) * 3.0;
    score += scoreText(category, tokens) * 2.0;

    // 3. Description matches (Weight: 1.0x)
    score += scoreText(description, tokens) * 1.0;

    if (score >= threshold) {
      scoredListings.push({ listing, score });
    }
  }

  // Sort descending by relevance score
  scoredListings.sort((a, b) => b.score - a.score);

  return scoredListings.map((item) => item.listing);
}
