module.exports = function(api) {
  api.cache(true); // Cho phép caching để cải thiện hiệu suất
  return {
    presets: ['babel-preset-expo'], // Sử dụng preset của Expo
  };
};
