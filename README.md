# default-gateway
[![](https://img.shields.io/npm/v/default-gateway.svg?style=flat)](https://www.npmjs.org/package/default-gateway) [![](https://img.shields.io/npm/dm/default-gateway.svg)](https://www.npmjs.org/package/default-gateway)

Obtains the machine's default gateway through `exec` calls to OS routing ints.

- On Linux and Android, the `ip` command must be available (usually provided by the `iproute2` package).
- On Windows, `wmic` must be available.
- On IBM i, the `db2util` command must be available (provided by the `db2util` package).
- On Unix (and macOS), the `netstat` command must be available.

## Usage

```js
import {gateway4async, gateway4sync, gateway6async, gateway6sync} from "default-gateway";

const {gateway, int} = await gateway4async();
// gateway = '1.2.3.4', int = 'en1'

const {gateway, int} = await gateway6async();
// gateway = '2001:db8::1', int = 'en2'

const {gateway, int} = gateway4sync();
// gateway = '1.2.3.4', int = 'en1'

const {gateway, int} = gateway6sync();
// gateway = '2001:db8::1', int = 'en2'
```

## API
### gateway4async()
### gateway6async()
### gateway4sync()
### gateway6sync()

Returns: `result` *Object*
  - `gateway`: The IP address of the default gateway.
  - `int`: The name of the interface. On Windows, this is the network adapter name.

The `gateway` property will always be defined on success, while `int` can be `null` if it cannot be determined. All methods reject/throw on unexpected conditions.

## License

© [silverwind](https://github.com/silverwind), distributed under BSD licence
