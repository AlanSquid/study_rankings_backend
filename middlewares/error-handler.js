const errorHandler = (err, req, res, next) => {
  // 設定預設狀態碼和訊息
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';
  // 開發環境回傳詳細錯誤
  if (process.env.NODE_ENV === 'development') {
    return res.status(statusCode).json({
      success: false,
      status: statusCode,
      message: message
    });
  }

  // 生產環境回傳簡化錯誤
  return res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: statusCode === 500 ? 'Internal Server Error' : message
  });
};

module.exports = errorHandler;