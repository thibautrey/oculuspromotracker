const { get } = require("lodash");
const axios = require("axios");


const routes = {
  experiences: {
    get: ({page}={}) => ({
      url: `https://www.reddit.com/r/OculusStore/search.json?q=[Sale&restrict_sr=1${page!==0?`&after=${page}`:""}`
    }),
  },
};

const getUrl = ({ type, method, value }) =>
  `${get(routes[type][method](value), "url")}`;

const request = ({
  type,
  method = "GET",
  value,
  isSource = true,
  headers,
  url,
  ...options
}) =>
  axios({
    url: url || getUrl({ type, method, value }),
    method: method.toUpperCase(),
    timeout: 60 * 1000 * 1000,
    maxRedirects: 100,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    ...options,
  });

  const parseName = (name)=>{
    const result = name.match(/(\[Sale\])(\[(Rift|Quest|Rift-Quest-Cross-Buy)\])(.*)(\((.*)\/(.*)\))(.*)/);
    const date = new Date(result[8].replace("until", "").trim());
    return {
      device:result[3], 
      title: result[4].trim(), 
      price: result[6], 
      discount: result[7], 
      endDate: date,
      isExpired: date.getTime()<new Date().getTime()
    }
  }
module.exports = { request, parseName };


