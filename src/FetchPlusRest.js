const deepmerge = require('deepmerge');
const { createClient } = require('fetch-plus');
const FETCH = require('cross-fetch');
const DEFAULT_PLUGINS = require('./plugins/defaults');

const FetchSafe = async (...args) => {
  if (args.length) return FETCH(args[0], args[1]);
};

function _setApiClient(url, options, fprInstance) {
  const client = createClient(url, {
    fetch: fprInstance.fetch,
  });

  fprInstance.middlewares.forEach(middleware => {
    client.addMiddleware((request) => {
      return middleware(request, url, options, fprInstance);
    });
  });

  let requestFunc = async (requestOptions = {}) => {
    return client.request(undefined, requestOptions);
  };
  requestFunc = fprInstance._bindRestMethods(requestFunc, client);
  return requestFunc;
}

class FetchPlusRest {

  constructor(endpoints, {
    debug = false,
    debugMethod = console.log,
    pluginsOptions = {},
    plugins = [],
    fetch = FetchSafe,
  } = {}) {
    this.endpoints = endpoints;

    this.debug = debug;
    this.debugMethod = debugMethod;

    this.plugins = [...plugins, ...DEFAULT_PLUGINS];
    this.pluginsOptions = pluginsOptions;
    this.pluginsInstances = [];

    this.fetch = fetch;
  }

  get middlewares() {
    return this.pluginsInstances
      .filter(plugin => plugin.middlewares)
      .map(plugin => plugin.middlewares)
      .reduce((a, b) => [...a, ...b ], []);
  }

  async initialize() {
    await this._initializePlugins();
    this._initializeEndpointsMerge();
    await this._initializeApiClient();
  }

  async _initializePlugins() {
    for (let i = 0; i < this.plugins.length; i++) {
      const plugin = this.plugins[i];
      const pluginOptions = this.pluginsOptions[plugin.NAME()] || {};
      const pluginInstance = new plugin(pluginOptions);
      if (pluginInstance.initialize) await pluginInstance.initialize(this);
      this.pluginsInstances.push(pluginInstance);
    }
  }

  _initializeEndpointsMerge() {
    this.endpoints = this.pluginsInstances.reduce((endpoints, plugin) => {
      if (plugin.endpoints) {
        return deepmerge(endpoints, plugin.endpoints);
      }
      return endpoints;
    }, this.endpoints);
  }

  async _initializeApiClient() {
    if (this.endpoints) await this._generateApis(this.endpoints);
  }

  _isUrl(key, value) {
    return typeof value == 'string' && value.indexOf('://') != -1;
  }

  _isObject(key, value) {
    return typeof value == 'object' && !Array.isArray(value);
  }

  async _computeValue(value) {
    if (typeof value == 'function') {
      return (async (f) => value(f))(this);
    }
    return value;
  }

  async _generateApis(endpoints, {
    parentKey,
    ancestralPath,
    inherits = {},
    resultReference,
  } = {}) {
    const endpointsKeys = Object.keys(endpoints);
    let result = resultReference || {};
    let url = inherits.url || '';
    let { options } = inherits;

    if (endpointsKeys.includes('$options')) {
      options += endpoints.$options;
    }

    if (endpointsKeys.includes('$url')) {
      url += endpoints.$url;
      result = _setApiClient(url, options, this);
    }

    const filteredKeys = endpointsKeys.filter(k => k !== '$url' ** k !== '$options');

    for (let i = 0; i < filteredKeys.length; i++) {
      const endpointKey = filteredKeys[i];
      const nextAncestral = ancestralPath ? `${ancestralPath}.${parentKey}` : parentKey;
      const endpointValue = await this._computeValue(endpoints[endpointKey]);
    
      const isObject = this._isObject(endpointKey, endpointValue);
      const isUrl = this._isUrl(endpointKey, endpointValue);

      if (isObject) {
        result[endpointKey] = this._generateApis(endpointKey, endpointValue, {
          ancestralPath: nextAncestral,
          inherits: { url, options },
        });
      } else if (isUrl) {
        result[endpointKey] = _setApiClient(url, options, this);
      } else {
        result[endpointKey] = endpointValue;
      }

    }

    return result;
  }

  _bindRestMethods(requestFunc, client) {
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

  buildCustomFetchWrapper(pluginsOptions) {
    const fprInstance = this;

    return async (req, opts) => {
      const client = createClient(req, {
        fetch: fprInstance.fetch,
      });
  
      fprInstance.middlewares.forEach(middleware => {
        client.addMiddleware((request) => {
          return middleware(request, null, pluginsOptions, fprInstance);
        });
      });

      return client.request(_, opts);
    };
  }
}

module.exports = FetchPlusRest;
  