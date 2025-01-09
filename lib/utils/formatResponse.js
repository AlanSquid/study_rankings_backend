const formatResponse = (data) => {
  if (!data) return { success: false, message: 'No data' };
  return { success: data.success, ...data };
};

module.exports = { formatResponse };
