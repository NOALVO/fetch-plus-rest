const FETCH = require('cross-fetch');
const { createClient } = require('fetch-plus');
const base64 = require('./base64');

const FetchSafe = async (...args) => {
  if (args.length) return FETCH(args[0], args[1]);
}

const cookieStorage = {
  getItem(key) {
    const value = document.cookie.match('(^|[^;]+)\\s*' + key + '\\s*=\\s*([^;]+)');
    return value ? value.pop() : null;
  }
};

function generateApiClient(object, Fetch, { parent, auth, path, debug } = {}) {
  const result = {};

  for (const key in object) {
    if (object.hasOwnProperty(key)) {
      const value = object[key];
      const isObject = typeof value == 'object';
      const isString = typeof value == 'string';
      const endpoint = isObject ? value : { url: value };

      let _auth = auth;
      let _path = path ? `${path}` : '';
      if (!_path.endsWith('/') && _path != '') _path = `${_path}/`;
      let _parent = parent ? `${parent}.${key}` : key;

      if (isObject) {
        if (value.$auth) _auth = value.$auth;
        if (value.$root) _path = `${_path}${value.$root}`;
      }

      if (_path == '') _path = undefined;

      if (isObject && !value.url) {
        // it is not an endpoint object but is an object
        result[key] = generateApiClient(value, Fetch, {
          parent: _parent,
          auth: _auth,
          path: _path,
          debug
        });

      } else if (
        (isObject && value.url)
        || (isString && value.indexOf('http') != -1 && key !== '$root')
      ) {
        // it is an endpoint or a valid URL
        result[key] = setFetchWrapper(endpoint, Fetch, {
          parent: _parent,
          auth: _auth,
          path: _path,
          debug
        });

      } else {
        // key is just a primitive value that is not an API URL
        result[key] = value;
      }
    }
  }

  return result;
}

function setFetchWrapper(endpoint, Fetch, { parent, auth, path, debug }) {
  if (debug) {
    console.log(`### [${parent}] `, { endpoint, auth, path });
  }

  const _auth = endpoint.$auth || auth;
  const _middlewares = endpoint.$middlewares;

  let url = (path || '') + endpoint.url;
  if (endpoint.url.startsWith('http')) {
    url = endpoint.url;
  }

  if (debug) {
    console.log(`final url: `, url);
  }

  const client = createClient(url, {
    fetch: Fetch
  }, _middlewares);

  if (_auth) {
    client.addMiddleware(getAuthMiddleware(_auth));
  }

  
  client.addMiddleware((request) => {
    if(!request.options) {
      console.log("PEGUEI VOCE")
    }
    return (response) => response
  });

  if (debug) {
    console.log(`--\n`);
  }

  let requestFunc = async (requestOptions = {}) => {
    return client.request(undefined, requestOptions);
  };

  requestFunc = bindMethods(requestFunc, client);
  return requestFunc;
}

function bindMethods(requestFunc, client) {
  requestFunc.get     = client.get;
  requestFunc.post    = client.post;
  requestFunc.patch   = client.patch;
  requestFunc.put     = client.put;
  requestFunc.del     = client.del;
  requestFunc.browse  = client.browse;
  requestFunc.read    = client.read;
  requestFunc.edit    = client.edit;
  requestFunc.replace = client.replace;
  requestFunc.add     = client.add;
  requestFunc.destroy = client.destroy;
  requestFunc.list    = client.list;
  requestFunc.update  = client.update;
  requestFunc.create  = client.create;
  return requestFunc;
}

function getAuthMiddleware(auth) {
  let header, user, password;

  if (auth.storage) {
    const storage = getStorage(auth.storage);
    user = auth.user ? getStorageItem(storage, auth.user) : null;
    password = auth.password ? getStorageItem(storage, auth.password) : null;
  } else {
    user = auth.user;
    password = auth.password;
  }

  if (user && password) {
    // Basic credentials
    const credentials = base64.encode(`${user}:${password}`);
    header = `Basic ${credentials}`;
  } else {
    // Bearer token
    header = `Bearer ${password}`;
  }

  return (request) => {
    request.options.headers.Authorization = header;
    return (response) => response;
  };
}

function getStorage(storage) {
  if (typeof storage === 'object') {
    return storage;
  }

  switch (storage) {
    case 'localStorage':
      return localStorage;
    case 'sessionStorage':
      return sessionStorage;
    case 'cookies':
      return cookieStorage;
    case 'custom':
      // TODO: 
      break;
  }
}

function getStorageItem(storage, key, type) {
  if (type === 'cookies') {
    const value = document.cookie.match('(^|[^;]+)\\s*' + key + '\\s*=\\s*([^;]+)');
    return value ? value.pop() : null;
  }
  if (storage && storage[key]) return storage[key];
  if (storage && storage.getItem) return storage.getItem(key);
  if (storage && storage.get) return storage.get(key);
}

function load({
  endpoints,
  useEnx = false,
  fetch = FetchSafe,
  enxOptions,
  debug = false
} = {}) {
  let _endpoints = endpoints;

  if (useEnx) {
    const _enxOptions = enxOptions || {};
    _enxOptions.debug = debug;
    _endpoints = require('@enx/env')(_enxOptions);
    if (debug) console.log('.\n.\n.\n');
  }

  const apis = generateApiClient(_endpoints, fetch, { debug });

  return apis;
}

module.exports = {
  load,
};
