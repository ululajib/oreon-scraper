<big><h1 align="center">oreon-scraper</h1></big>


<p align="center">
  <a href="https://github.com/ululajib/oreon-scraper/blob/master/LICENSE">
    LICENSE
  </a>
</p>

lib scraper with extended utilities

## ( still developing )

## Usage

```js

import Oreon from "oreon-scraper"

const options = {
  host: 'api.ipify.org',
  uri: 'https://api.ipify.org',
  userAgent: '',
}
const oreon = Oreon(options)
const url = 'https://api.ipify.org?format=json'

return oreon.request({url})
  .then((response) => {
    console.log(response);
  })
  .catch((err) => {
    throw new Error(err)
  })

```

For more usage information, check tests directory.

## License

MIT © [Ulul Ajib](http://github.com/ululajib)
Reference form [http-scraper](https://github.com/raabbajam/http-scraper)
