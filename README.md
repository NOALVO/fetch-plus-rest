# fetch-rest
The easiest and best way to create a REST API Client Library.

> 🆘 **Help** this project by conttributing to its documentation or developing its roadmap.

## Features

Setup
- [x] Multi-level endpoints
- [x] Parent path inheritance
- [x] Endpoints configuration file powered by [enx](https://github.com/NOALVO/enx)

Middlewares
- [x] Automatic **✨ authorization headers** setup (Basic credentials and Bearer token) - per endpoint and per endpoint group
- [x] Supports credentials stored in localStorage, sessionStorage, cookies or custom storage
- [x] Custom middleware support (a.k.a. **✨interceptors**) powered by [fetch-plus](https://github.com/alexwilson/fetch-plus)

Utilities
- [x] Easy querystring serialization with `query` property
- [x] HTTP verbs shorthand methods
- [x] CRUD and BREAD shorthand methods

Infrastructure
- [x] Cross-browser & Node Fetch API (powered by [cross-fetch](https://github.com/lquixada/cross-fetch))
- [x] Custom fetch library

*Not checked features are in roadmap.