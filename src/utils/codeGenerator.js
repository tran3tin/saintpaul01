const pool = require("../config/database");

const SISTER_PREFIX = "NT";
const COMMUNITY_PREFIX = "CD";
const SISTER_SEQUENCE_LENGTH = 4;
const COMMUNITY_SEQUENCE_LENGTH = 3;

const fetchLatestCode = async (sql, params = []) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(sql, params);
    return rows[0]?.code || null;
  } finally {
    connection.release();
  }
};

const generateSisterCode = async () => {
  const year = new Date().getFullYear();
  const likePattern = `${SISTER_PREFIX}${year}%`;
  const lastCode = await fetchLatestCode(
    "SELECT code FROM sisters WHERE code LIKE ? ORDER BY code DESC LIMIT 1",
    [likePattern]
  );

  let nextSequence = 1;
  if (lastCode) {
    const sequencePart = lastCode.slice(-SISTER_SEQUENCE_LENGTH);
    const parsed = parseInt(sequencePart, 10);
    if (!Number.isNaN(parsed)) {
      nextSequence = parsed + 1;
    }
  }

  const padded = String(nextSequence).padStart(SISTER_SEQUENCE_LENGTH, "0");
  return `${SISTER_PREFIX}${year}${padded}`;
};

const generateCommunityCode = async () => {
  const likePattern = `${COMMUNITY_PREFIX}%`;
  const lastCode = await fetchLatestCode(
    "SELECT code FROM communities WHERE code LIKE ? ORDER BY code DESC LIMIT 1",
    [likePattern]
  );

  let nextSequence = 1;
  if (lastCode) {
    const sequencePart = lastCode.slice(COMMUNITY_PREFIX.length);
    const parsed = parseInt(sequencePart, 10);
    if (!Number.isNaN(parsed)) {
      nextSequence = parsed + 1;
    }
  }

  const padded = String(nextSequence).padStart(COMMUNITY_SEQUENCE_LENGTH, "0");
  return `${COMMUNITY_PREFIX}${padded}`;
};

module.exports = {
  generateSisterCode,
  generateCommunityCode,
};
