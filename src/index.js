const {exec} = require('child_process')
const Promise = require('bluebird')
const prototypes = {
  request,
  setUpRequest,
}
function Oreon(options = {}) {
  const properties = initialize(options);
  return Object.assign(Object.create(prototypes), properties);
}

module.exports = Oreon

function initialize(options = {}) {
  const {
    userAgent = '',
    delay = 0,
    type = 'unknown',
    capture = false,
    capturePath = '.',
  } = options;

  const initialProperties = {
    type,
    capture,
    capturePath,
    delay,
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
        err = parseError(err);
        if(err.error != 56) reject(err)
      }
      let output = '';
      try {
        output = parserResponse(res, options.cookie, options.url);
      } catch (e) {
        reject(e);
      }
      resolve(output)
    })
  })
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

function parseError(err) {
  let out = err.message.match(/curl:+.+/g);
  if(out) {
    try {
      let code = out[0].match(/curl:+\s\(\d+\)/g);
      code = code[0].match(/\d+/g);
      code = code[0];
      let message = out[0].replace(/curl:+\s\(\d+\)/g, '');
      return {error: code, message: message};
    } catch (e) {
      return {error: 1, message: out[0]};
    }
  }
  return err;
}

function parserResponse(res, cookie_obj, req_url) {
  let location = res.match(/Location:\ +.+/g);
  if(location) req_url = location[location.length - 1].replace('Location: ', '');
  res = res.split('\r\n\r\n');
  let headers, body = [];
  res.forEach((item) => {
    if(/HTTP/.test(item.substring(0,4))) headers = item;
    else body.push(item);
  });
  body = str_clean(array_clean(body).join('\n'));
  const status = Number(headers.split('\r\n')[0].split(' ')[1]);
  let headers_obj = headers_to_object(headers);
  if(cookie_obj) {
    cookie_obj = append(cookie_to_object(cookie_obj), cookie_to_object(get_cookie(headers_obj)))
  } else cookie_obj = cookie_to_object(get_cookie(headers_obj));
  let cookie = obj_to_cookie(cookie_obj);

  return {
    headers,
    headers_obj,
    status,
    cookie,
    cookie_obj,
    body,
    requestUrl: req_url
  };
}

function str_clean(str) {
  return str.replace(/\s\s+/g, '');
}

function obj_to_cookie(cookie) {
  let output = '';
  for (var key in cookie) {
    if (cookie.hasOwnProperty(key)) {
      output += `${key}=${cookie[key]}; `;
    }
  }
  return output;
}

function array_clean(arr) {
  output = [];
  arr.forEach((item, index) => {
    if(item) output.push(item);
  });
  return output;
}

function headers_to_object(str) {
  str = str.split('\r\n');
  str = str.splice(1, str.length);
  let output = {};
  str.forEach((item) => {
    let index = item.indexOf(': ');
    let key = item.substr(0,index);
    let value = item.substr(index+2);
    if(typeof output[key] != 'undefined') {
      if(key.toLowerCase() == 'set-cookie') {
        output[key] = output[key] + '; ' + value ;
      } else {
        output[key] = output[key] + value ;
      }
    } else output[key] = value;
  })
  return output;
}

function cookie_to_object(str) {
  str = str.split(';');
  let output = {};
  str.forEach((item) => {
    let index = item.indexOf('=');
    let key = item.substr(0, index).trim();
    let value = item.substr(index+1).trim();
    if(key) output[key] = value;
  })
  return output;
}

function get_cookie(headers) {
  let cookie = (headers['Set-Cookie']) ? headers['Set-Cookie'] : '';
  if(cookie) return cookie;
  else return '';
}
