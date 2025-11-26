const successResponse = (
  res,
  data = null,
  message = "Success",
  statusCode = 200
) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const errorResponse = (
  res,
  message = "Something went wrong",
  statusCode = 500,
  errors = null
) => {
  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

const paginationResponse = (
  res,
  data = [],
  page = 1,
  limit = 10,
  total = 0,
  message = "Success"
) => {
  const safeLimit = Math.max(Number(limit) || 10, 1);
  const safeTotal = Math.max(Number(total) || 0, 0);

  res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page: Math.max(Number(page) || 1, 1),
      limit: safeLimit,
      total: safeTotal,
      totalPages: Math.ceil(safeTotal / safeLimit) || 1,
    },
  });
};

module.exports = {
  successResponse,
  errorResponse,
  paginationResponse,
};
