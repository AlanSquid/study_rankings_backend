const formatResponse = (data) => {
  if (!data) return { success: false, data: null };
  const { success, ...rest } = data;
  return { success, data: rest };
};

module.exports = { formatResponse };
