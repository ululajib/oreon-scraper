const {exec} = require('child_process')
const Promise = require('bluebird')
const path = require('path');
const fs = Promise.promisifyAll(require('fs-extra'));
const utils = require('./utils')
const prototypes = {
  request,
  saveFile,
  saveHtml,
  saveJson,
  setUpRequest,
}
function Oreon(options = {}) {
  const properties = initialize(options);
  return Object.assign(Object.create(prototypes), properties);
}

module.exports = Oreon

function initialize(options = {}) {
  const {
    host = '',
    uri = '',
    userAgent = '',
    type = 'unknown',
    capture = false,
    capturePath = '.',
  } = options;

  const initialProperties = {
    type,
    uri,
    host,
    capture,
    capturePath,
    userAgent,
  };
  return initialProperties;
}

function request(options = {}) {
  if (!options.cookie) options.cookie = '';
  if (!options.url) options.url = '';
  const command = this.setUpRequest(options)

  return new Promise((resolve, reject) => {
    exec(command, {maxBuffer: 1024 * 5000}, (err, res) => {
      if (err) {
        err = utils.parserErrorExec(err);
        if(err.error != 56) reject(err)
      }
      let output = '';
      try {
        options.response = res
        output = utils.parserResponseExec(options);
      } catch (e) {
        reject(e);
      }
      resolve(output)
    })
  })
}

function saveHtml(name, currentUrl) {
  const ext = 'html';
  return this.saveFile(name, {currentUrl, ext});
}

function saveJson(name, currentUrl) {
  const ext = 'json';
  const transform = (text) => typeof text === 'object' ? JSON.stringify(text, null, 2) : text;
  return this.saveFile(name, {currentUrl, ext, transform});
}

function saveFile(name, options = {}) {
  const {
    currentUrl = this.uri,
    ext = 'html',
    encoding = 'utf8',
    convertAbsolute = false,
    transform,
  } = options;
  if (!this.capture) {
    return Promise.resolve();
  }
  const filepath = path.resolve(this.capturePath, 'capture', `${this.type}/${name}.${ext}`);
  return (text) => {
    text = transform ? transform(text) : text;
    return fs.outputFileAsync(filepath, text, encoding);
  }
}

function setUpRequest(options) {
  const { url = '' } = options;
  if(typeof options.redirect == 'undefined') options.redirect = true;
  else options.redirect = options.redirect;
  const referer = (options.referer)
  ? `-e '${options.referer};auto' `
  : `-e ';auto' `;
  const userAgent = (options.userAgent)
  ? `-A '${options.userAgent}' `
  : `-A '${this.userAgent}' `;
  const headers = (options.headers) ? objToHeaders(options.headers) : '';
  const headOnly = (options.headOnly) ? '-I ' : '';
  const post = (options.post) ? `-d '${objToPost(options.post)}' ` : '';
  const include = '-i ';
  const cookie = (options.cookie) ? `-H 'Cookie: ${options.cookie}' ` : '';
  const location = (options.redirect) ? '-L ' : '';
  const method = (options.method) ? `-X ${options.method} ` : '';
  const ipv6 = (options.ipv6) ? `-6 ` : '';
  let command = `curl -g `;
  command += `${ipv6+userAgent+headOnly+include+headers+cookie+location+post+referer+method}'${url}'`;
  return command;
}

function objToHeaders(headers) {
  let output = '';
  for (var key in headers) {
    if (headers.hasOwnProperty(key)) {
      output += `-H '${key.toLowerCase()}: ${headers[key]}' `;
    }
  }
  return output;
}

function objToPost(post) {
  if(typeof post == 'string') return post;
  let output = '';
  for (var key in post) {
    if (post.hasOwnProperty(key)) {
      output += `${urlEncode(key)}=${urlEncode(post[key])}&`;
    }
  }
  return output;
}
