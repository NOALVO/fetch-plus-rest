const fetchRest = require('../index');

const FETCH = async (...args) => {
  console.log('args', args);
};

const FetchSafe = async (...args) => {
  if (args.length) return FETCH(args[0], args[1]);
}

const apis = fetchRest.load({
  useEnx: true,
  debug: false,
  // fetch: FetchSafe,
});

// console.log(apis)

async function main() {
  const posts1 = await (await apis.singleEndpoint()).json();
  // const posts2 = await (await apis.api.singleEndpoint()).json();
  // const posts3 = await (await apis.api.fullEndpoint()).json();
  const posts4 = await (await apis.api.endpointGroup.posts2.post()).json();

  // try {
  // let posts5 = await apis.api.endpointGroup.posts3();
  // posts5 = await posts5.json();
  // } catch (e) {
  //   console.log('TEPEGUEI')
  // }

  console.log(posts4)
}

main();