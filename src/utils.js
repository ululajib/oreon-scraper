 module.exports = {
  parserErrorExec,
  parserResponseExec,
}

function parserErrorExec(err) {
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

function parserResponseExec(options) {
  let {response, url, cookie} = options;
  const location = response.match(/Location:\ +.+/g);
  const requestUrl = (location) ? getValLocation(location) :  url;
  let headers, body = [], cookieObj;
  response = response.split('\r\n\r\n');

  response.forEach((resp) => {
    if (/HTTP/.test(resp.substring(0, 4))) {
      headers = resp;
    } else {
      body.push(resp);
    }
  })

  body = getParserCleanBody(body);
  headersObj = getParserHeaders(headers);

  if (cookie) {
    cookieObj = getCookieObj(cookie, headersObj);
  } else {
    cookieObj = CookieToObject(getCookie(headersObj));
  }

  cookie = objToCookieStr(cookieObj);

  const status = Number(headers.split('\r\n')[0].split(' ')[1]);

  return Object.assign({}, {
    headers,
    headersObj,
    requestUrl,
    status,
    cookie,
    cookieObj,
    body,
  })
}

function getCookieObj(cookie, headersObj) {
  return append(CookieToObject(cookie), CookieToObject(getCookie(headersObj)));
}

function objToCookieStr(cookie) {
  let output = '';
  for (var key in cookie) {
    if (cookie.hasOwnProperty(key)) {
      output += `${key}=${cookie[key]}; `;
    }
  }
  return output;
}

function CookieToObject(str) {
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

function getCookie(headers) {
  let cookie = (headers['Set-Cookie']) ? headers['Set-Cookie'] : '';
  if(cookie) return cookie;
  else return '';
}

function getParserHeaders(str) {
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

function getParserCleanBody(body) {
  let output = [];
  body.map((item) => {
    if (item) output.push(item);
  })
  return output.join('\n').replace(/\s\s+/g, '');
}

function getValLocation(location) {
  return location[location.length - 1].replace('Location: ', '');
}

function append(obj, new_obj) {
  let output = {};
  for (let key in new_obj) {
    if (new_obj.hasOwnProperty(key)) {
      if(Array.isArray(new_obj[key])) {
        append(obj[key] , new_obj[key])
      } else if(typeof new_obj[key] == 'object') {
        if(obj[key]) {
          append(obj[key], new_obj[key]);
        } else {
          obj[key] = {};
          append(obj[key], new_obj[key]);
        }
      } else {
        obj[key] = new_obj[key];
      }
    }
  }
  return obj;
}
