const AuditLogModel = require("../models/AuditLogModel");

const ENV = process.env.NODE_ENV || "development";

const ERROR_TYPES = {
  VALIDATION: "validation",
  AUTHENTICATION: "authentication",
  AUTHORIZATION: "authorization",
  DATABASE: "database",
  SERVER: "server",
};

const formatErrorResponse = (error) => {
  const statusMap = {
    [ERROR_TYPES.VALIDATION]: 400,
    [ERROR_TYPES.AUTHENTICATION]: 401,
    [ERROR_TYPES.AUTHORIZATION]: 403,
    [ERROR_TYPES.DATABASE]: 500,
    [ERROR_TYPES.SERVER]: 500,
  };

  const status = statusMap[error.type] || error.status || 500;

  const payload = {
    message: error.message || "An unexpected error occurred",
  };

  if (error.details && error.type === ERROR_TYPES.VALIDATION) {
    payload.errors = error.details;
  }

  if (ENV !== "production" && error.stack) {
    payload.stack = error.stack;
  }

  return { status, payload };
};

const logError = (error) => {
  const logPayload = {
    type: error.type || "unknown",
    message: error.message,
    stack: error.stack,
  };
  // eslint-disable-next-line no-console
  console.error("Error captured:", logPayload);
};

const logAuditIfCritical = async (req, error) => {
  const criticalTypes = [
    ERROR_TYPES.AUTHORIZATION,
    ERROR_TYPES.SERVER,
    ERROR_TYPES.DATABASE,
  ];
  if (!criticalTypes.includes(error.type)) {
    return;
  }

  try {
    await AuditLogModel.create({
      user_id: req.user ? req.user.id : null,
      action: "error",
      table_name: "system",
      record_id: null,
      old_value: null,
      new_value: JSON.stringify({
        type: error.type,
        message: error.message,
        path: req.originalUrl,
      }),
      ip_address: req.ip,
    });
  } catch (auditError) {
    console.error("Failed to record audit log for error:", auditError.message);
  }
};

const classifyError = (error) => {
  const errObj = {
    message: error.message,
    stack: error.stack,
    ...error,
  };

  if (error.type) {
    return errObj;
  }

  if (error.name === "UnauthorizedError") {
    return { ...errObj, type: ERROR_TYPES.AUTHENTICATION };
  }

  if (error.name === "ValidationError") {
    return { ...errObj, type: ERROR_TYPES.VALIDATION };
  }

  if (error.code && error.code.startsWith("ER_")) {
    return { ...errObj, type: ERROR_TYPES.DATABASE };
  }

  return { ...errObj, type: ERROR_TYPES.SERVER };
};

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.type = ERROR_TYPES.SERVER;
  error.status = 404;
  next(error);
};

const errorHandler = async (err, req, res, next) => {
  const classifiedError = classifyError(err);
  logError(classifiedError);

  await logAuditIfCritical(req, classifiedError);

  const { status, payload } = formatErrorResponse(classifiedError);
  res.status(status).json(payload);

  next();
};

module.exports = {
  notFound,
  errorHandler,
};
