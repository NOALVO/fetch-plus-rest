class HttpHeadersPlugin {
  static NAME() { return 'headers' };

  constructor() {

  }

  get middlewares() {
    return [
      (clientRequest, endpointUrl, endpointOptions, fprInstance) => {
        if (endpointOptions.headers) {
          for (const headerKey in endpointOptions.headers) {
            const headerValue = endpointOptions.headers[headerKey];
            clientRequest.options.headers[headerKey] = headerValue;
          }
        }
        return (response) => response;
      }
    ]
  }
}

module.exports = HttpHeadersPlugin;
