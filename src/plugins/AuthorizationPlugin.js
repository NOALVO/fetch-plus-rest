const deepmerge = require('deepmerge');
const base64Encode = require('../btoa');

const DEFAULT_STORAGE_KEYS = {
  user: 'user',
  password: 'password',
  token: 'accessToken',
};

function _getItem(storage, key) {
  switch (storage.toLowerCase()) {
    case 'local':
      return localStorage.getItem(key);
    case 'session':
      return sessionStorage.getItem(key);
    case 'cookie':
      const value = document.cookie
        .match('(^|[^;]+)\\s*' + key + '\\s*=\\s*([^;]+)');
      return value ? value.pop() : null;
    default:
      throw new Error('[FetchPlusRest AuthorizationPlugin] Storage not supported.');
  }
}

function _generateMiddleware(authPlugin) {
  return (clientRequest, endpointUrl, endpointOptions, fprInstance) => {
    // clientRequest is the fetch-plus request object
    // endpointsUrl is the url currently being requested
    // endpointsOptions is the $options object, if present, in the endpoint
    // fprInstance is the FetchPlusRest instance
    
    const { auth } = endpointOptions;
    let scheme = 'bearer';
    let value;

    if (auth.scheme) {
      scheme = auth.scheme.toLowerCase();
    }

    if (auth && typeof auth === 'string') {
      value = auth;
    } else {
      const storage = auth.storage || 'local';

      if (scheme === 'basic') {
        const storageKeyUser = auth.storageKeyUser || authPlugin.storageKeys.user;
        const storageKeyPassword = auth.storageKeyPassword || authPlugin.storageKeys.password;
        const user = _getItem(storage, storageKeyUser);
        const password = _getItem(storage, storageKeyPassword);
        value = base64Encode(`${user}:${password}`);
      } else if (scheme === 'bearer') {
        const storageKeyToken = auth.storageKeyToken || authPlugin.storageKeys.token;
        value = _getItem(storage, storageKeyToken);
      }
    }

    if (!value) throw new Error('[FetchPlusRest AuthorizationPlugin] Empty auth value.');

    scheme = scheme === 'basic' ? 'Basic' : 'Bearer';
    clientRequest.options.headers.Authorization = `${scheme} ${value}`;
    
    return (response) => response; // must be always returned
  }
}


class AuthorizationPlugin {
  static NAME() {  return 'auth' }; // mandatory

  constructor({ storageKeys = {} } = {}) {
    this.storageKeys = deepmerge(storageKeys, DEFAULT_STORAGE_KEYS);
  }

  async initialize(fprInstance = {}) {
    // fpr is the FetchPlusRest instance
  }

  get middlewares() {
    return [ _generateMiddleware(this) ];
  }

}

module.exports = AuthorizationPlugin;
