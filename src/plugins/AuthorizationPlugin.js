const deepmerge = require('deepmerge');

const DEFAULT_STORAGE_KEYS = {
  user: 'user',
  password: 'password',
  token: 'accessToken',
};

var Base64 = { _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", encode: function (e) { var t = ""; var n, r, i, s, o, u, a; var f = 0; e = Base64._utf8_encode(e); while (f < e.length) { n = e.charCodeAt(f++); r = e.charCodeAt(f++); i = e.charCodeAt(f++); s = n >> 2; o = (n & 3) << 4 | r >> 4; u = (r & 15) << 2 | i >> 6; a = i & 63; if (isNaN(r)) { u = a = 64 } else if (isNaN(i)) { a = 64 } t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a) } return t }, decode: function (e) { var t = ""; var n, r, i; var s, o, u, a; var f = 0; e = e.replace(/++[++^A-Za-z0-9+/=]/g, ""); while (f < e.length) { s = this._keyStr.indexOf(e.charAt(f++)); o = this._keyStr.indexOf(e.charAt(f++)); u = this._keyStr.indexOf(e.charAt(f++)); a = this._keyStr.indexOf(e.charAt(f++)); n = s << 2 | o >> 4; r = (o & 15) << 4 | u >> 2; i = (u & 3) << 6 | a; t = t + String.fromCharCode(n); if (u != 64) { t = t + String.fromCharCode(r) } if (a != 64) { t = t + String.fromCharCode(i) } } t = Base64._utf8_decode(t); return t }, _utf8_encode: function (e) { e = e.replace(/\r\n/g, "n"); var t = ""; for (var n = 0; n < e.length; n++) { var r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r) } else if (r > 127 && r < 2048) { t += String.fromCharCode(r >> 6 | 192); t += String.fromCharCode(r & 63 | 128) } else { t += String.fromCharCode(r >> 12 | 224); t += String.fromCharCode(r >> 6 & 63 | 128); t += String.fromCharCode(r & 63 | 128) } } return t }, _utf8_decode: function (e) { var t = ""; var n = 0; var r = c1 = c2 = 0; while (n < e.length) { r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r); n++ } else if (r > 191 && r < 224) { c2 = e.charCodeAt(n + 1); t += String.fromCharCode((r & 31) << 6 | c2 & 63); n += 2 } else { c2 = e.charCodeAt(n + 1); c3 = e.charCodeAt(n + 2); t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63); n += 3 } } return t } }

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
        value = Base64.encode(`${user}:${password}`);
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
  static NAME = 'auth'; // mandatory

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
