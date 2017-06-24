# default-gateway
[![](https://img.shields.io/npm/v/default-gateway.svg?style=flat)](https://www.npmjs.org/package/default-gateway) [![](https://img.shields.io/npm/dm/default-gateway.svg)](https://www.npmjs.org/package/default-gateway) [![](https://api.travis-ci.org/silverwind/default-gateway.svg?style=flat)](https://travis-ci.org/silverwind/default-gateway)
> Get the default network gateway, cross-platform.

Obtains the network gatway through `exec` calls to the OS routing interaces. Supports Linux, macOS and Windows.

## Installation
```console
$ npm install --save default-gateway
```
## Example
```js
const defaultGateway = require("default-gateway");
defaultGateway.v4().then(result => {
  // result is {gateway: '1.2.3.4', interface: 'en1'}
});
defaultGateway.v6().then(result => {
  // result is {gateway: '2001:d8::1', interface: 'en2'}
});
```

## API
### default-gateway.v4()

Returns: A promise that resolves to a object containing the IPv4 `gateway` and `interface`. If it succeeds, `gateway` will always be defined, while `interface` can be absent. Rejects when the gatway cannot be determined.

### default-gateway.v6()

Returns: A promise that resolves to a object containing the IPv6 `gateway` and `interface`. If it succeeds, `gateway` will always be defined, while `interface` can be absent. Rejects when the gatway cannot be determined.

© [silverwind](https://github.com/silverwind), distributed under BSD licence
