const test = require('tape')
const Oreon = require('../src/index')

const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.100 Safari/537.36'

test.only('Oreon test - request', (assert) => {
  assert.plan(1)
  const options = {
    host: 'api.ipify.org',
    uri: 'https://api.ipify.org',
    userAgent,
  }
  const oreon = Oreon(options)
  const url = 'https://api.ipify.org?format=json'
  oreon.request({url})
    .then((data) => {
      console.log(data);
      assert.ok(Boolean(1), 'request ok!');
    })
    .catch(assert.end)
})
