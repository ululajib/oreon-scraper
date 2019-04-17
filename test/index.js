const test = require('tape');
const Oreon = require('../src/index');
const Promise = require('bluebird');

const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.100 Safari/537.36'

/**
* run test oreon-scraper function request
* return response exec url
*/
test('Oreon-scraper - request', (assert) => {
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

/**
* run test oreon-scraper function saveFile
*
*/
test.only('Oreon-scraper - saveFile', (assert) => {
  assert.plan(1)
  const options = {
    uri: 'https://google.com',
    capture: true,
    type: 'testSaveFile',
    capturePath: '.',
  }
  const oreon = Oreon(options)
  const html = '<a href="images/en/HdrFtr/banner_step1_2.jpg">';
  return Promise.resolve()
    .then(() => html)
    .tap(oreon.saveFile('test', {encoding: 'utf8', ext: 'html'}))
    .then((result) => assert.equal(result, html, 'return original result'))
    .catch(assert.end);
})
