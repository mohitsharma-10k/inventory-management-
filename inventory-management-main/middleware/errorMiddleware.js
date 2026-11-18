const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};
const errorHandler = (error, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = error.message || "Server Error";
  if (error.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource ID";
  }
  if (error.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(error.errors).map(item => item.message).join(", ");
  }
  if (error.code === 11000) {
    statusCode = 409;
    message = `Duplicate value for: ${Object.keys(error.keyValue).join(", ")}`;
  }
  res.status(statusCode).json({ success: false, message });
};
module.exports = { notFound, errorHandler };