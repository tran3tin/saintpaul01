const NodeCache = require("node-cache");

const cacheStore = new NodeCache({
  stdTTL: 0,
  checkperiod: 120,
  useClones: false,
});

const buildCacheKey = (req) => `GET:${req.originalUrl}`;

const cacheMiddleware = (durationSeconds = 60) => {
  const ttl =
    Number.isInteger(durationSeconds) && durationSeconds > 0
      ? durationSeconds
      : 60;

  return (req, res, next) => {
    if (req.method !== "GET") {
      return next();
    }

    const key = buildCacheKey(req);
    const cachedResponse = cacheStore.get(key);

    if (cachedResponse) {
      if (cachedResponse.type === "json") {
        return res.status(cachedResponse.status).json(cachedResponse.payload);
      }
      return res.status(cachedResponse.status).send(cachedResponse.payload);
    }

    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);

    const storeResponse = (payload, type) => {
      cacheStore.set(
        key,
        {
          status: res.statusCode || 200,
          payload,
          type,
        },
        ttl
      );
    };

    res.json = (body) => {
      storeResponse(body, "json");
      return originalJson(body);
    };

    res.send = (body) => {
      storeResponse(body, "send");
      return originalSend(body);
    };

    return next();
  };
};

const clearCache = (pattern) => {
  const keys = cacheStore.keys();

  if (!pattern) {
    cacheStore.del(keys);
    return;
  }

  const matcher = pattern instanceof RegExp ? pattern : null;
  const needle = matcher ? null : String(pattern);

  keys.forEach((key) => {
    const matched = matcher ? matcher.test(key) : key.includes(needle);
    if (matched) {
      cacheStore.del(key);
    }
  });
};

const escapeRegex = (value = "") =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const clearCacheForResource = (resource) => {
  if (!resource) {
    return;
  }

  const safeResource = escapeRegex(resource);
  const pattern = new RegExp(`GET:/api/${safeResource}`);
  clearCache(pattern);
};

module.exports = {
  cacheMiddleware,
  clearCache,
  clearCacheForResource,
};
