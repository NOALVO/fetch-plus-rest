const Enx = require('@enx/env');

class EnxPlugin {
  static NAME() { return 'enx' };

  constructor(options = {}) {
    this.options = options;
    this._endpoints = {};
  }

  async initialize(fpr = {}) {
    if (!this.options.debug) this.options.debug = fpr.debug;

    let { endpointsKey } = fpr;
    if (!endpointsKey) endpointsKey = 'endpoints';

    const enx = Enx(this.options);
    this._endpoints = enx[endpointsKey];
  }

  get endpoints() {
    return this._endpoints;
  }
}

module.exports = EnxPlugin;
