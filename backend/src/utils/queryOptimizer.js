const SAFE_IDENTIFIER = /^[a-zA-Z0-9_.]+$/;
const DEFAULT_LIMIT = 20;
const DEFAULT_PAGE = 1;
const ALLOWED_OPERATORS = new Set(["=", "!=", ">", ">=", "<", "<=", "LIKE"]);
const ALLOWED_JOIN_TYPES = new Set(["INNER", "LEFT", "RIGHT"]);

const sanitizeIdentifier = (identifier) => {
  if (typeof identifier !== "string" || !SAFE_IDENTIFIER.test(identifier)) {
    throw new Error(`Unsafe identifier detected: ${identifier}`);
  }
  return identifier;
};

const sanitizeOperator = (operator = "=") => {
  const normalized = String(operator).toUpperCase();
  if (!ALLOWED_OPERATORS.has(normalized)) {
    throw new Error(`Operator ${operator} is not allowed.`);
  }
  return normalized;
};

const buildWhereClause = (filters = {}) => {
  const clauses = [];
  const params = [];

  Object.entries(filters || {}).forEach(([field, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    const column = sanitizeIdentifier(field);

    if (Array.isArray(value) && value.length) {
      const placeholders = value.map(() => "?").join(", ");
      clauses.push(`${column} IN (${placeholders})`);
      params.push(...value);
      return;
    }

    if (typeof value === "object" && value !== null) {
      if (
        Object.prototype.hasOwnProperty.call(value, "between") &&
        Array.isArray(value.between) &&
        value.between.length === 2
      ) {
        clauses.push(`${column} BETWEEN ? AND ?`);
        params.push(value.between[0], value.between[1]);
        return;
      }

      if (
        Object.prototype.hasOwnProperty.call(value, "operator") &&
        Object.prototype.hasOwnProperty.call(value, "value")
      ) {
        const operator = sanitizeOperator(value.operator);
        clauses.push(`${column} ${operator} ?`);
        params.push(value.value);
        return;
      }
    }

    clauses.push(`${column} = ?`);
    params.push(value);
  });

  return {
    clause: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "",
    params,
  };
};

const buildPaginationQuery = (
  baseQuery,
  page = DEFAULT_PAGE,
  limit = DEFAULT_LIMIT
) => {
  const safeLimit =
    Number.isInteger(limit) && limit > 0 ? limit : DEFAULT_LIMIT;
  const safePage = Number.isInteger(page) && page > 0 ? page : DEFAULT_PAGE;
  const offset = (safePage - 1) * safeLimit;

  const query = `${baseQuery.trim()} LIMIT ? OFFSET ?`;
  return { query, params: [safeLimit, offset] };
};

const buildSortQuery = (baseQuery, sortBy, sortOrder = "ASC") => {
  if (!sortBy) {
    return baseQuery.trim();
  }

  const column = sanitizeIdentifier(sortBy);
  const direction = String(sortOrder).toUpperCase() === "DESC" ? "DESC" : "ASC";
  return `${baseQuery.trim()} ORDER BY ${column} ${direction}`;
};

const buildJoinQuery = (baseQuery, joins = []) => {
  if (!Array.isArray(joins) || !joins.length) {
    return baseQuery.trim();
  }

  const joinClauses = joins.map((join) => {
    const type = ALLOWED_JOIN_TYPES.has(String(join.type || "").toUpperCase())
      ? String(join.type).toUpperCase()
      : "INNER";

    const table = sanitizeIdentifier(join.table);
    const alias = join.alias ? ` ${sanitizeIdentifier(join.alias)}` : "";

    if (!join.on || !join.on.base || !join.on.target) {
      throw new Error(
        "Join definition requires on.base and on.target properties."
      );
    }

    const baseColumn = sanitizeIdentifier(join.on.base);
    const targetColumn = sanitizeIdentifier(join.on.target);

    return `${type} JOIN ${table}${alias} ON ${baseColumn} = ${targetColumn}`;
  });

  return `${baseQuery.trim()} ${joinClauses.join(" ")}`;
};

module.exports = {
  buildWhereClause,
  buildPaginationQuery,
  buildSortQuery,
  buildJoinQuery,
};
