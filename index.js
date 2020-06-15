const FetchPlusRest = require('./src/FetchPlusRest');

async function initialize(endpoints, options) {
  const fetchPlusRest = new FetchPlusRest(endpoints, options);
  await fetchPlusRest.initialize();
  return fetchPlusRest;
}

module.exports = {
  FetchPlusRest,
  initialize,
};
