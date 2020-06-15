class PluginExample {
  static NAME = 'pluginName'; // mandatory

  constructor(options) {
    // constructor will always be called with FetchPlusRest.pluginsOptions.pluginName;
  }

  // mandatory
  async initialize(fprInstance = {}) {
    // fpr is the FetchPlusRest instance
  }

  get endpoints() {
    // optional
    // return an endpoints object if you want to add some endpoints
  }

  get middlewares() {
    // optional
    // return an array as below if you want to add some middlewares

    return [
      (clientRequest, endpointUrl, endpointOptions, fprInstance) => {
        // clientRequest is the fetch-plus request object
        // endpointsUrl is the url currently being requested
        // endpointsOptions is the $options object, if present, in the endpoint
        // fprInstance is the FetchPlusRest instance

        return (response) => response; // must be always returned
      }
    ]
  }
}

// add plugin using one of methods below
const fprInstance = new FetchPlusRest(endpoints, {
  plugins: [ PluginExample ]
});

// or
await fprInstance.addPlugin(PluginExample); 
// need to be awaited because the entire class initialization must happen again
