// for a full working demo of Netlify Identity + Functions, see https://netlify-gotrue-in-react.netlify.com/

const axios = require('axios')

const formatDateToString = (date) => {
  let year = date.getFullYear()
  let month = ('0' + (date.getMonth() + 1)).slice(-2)
  let day = date.getDate()
  
  // date format YYYY-MM-DD
  return year + '-' + month + '-' + day
}

const handler = async (event) => {
  const url = 'https://api.elvanto.com/v1/services/getAll.json'
  const API_KEY = process.env.API_KEY
  
  const today = new Date()
  const formatToday = today.toISOString().split('T')[0]

  console.log(formatDateToString(new Date()))

  const params = {
    start: formatToday,
    page_size: 10,
    status: 'publish',
    service_types: ['1a82f168-be13-4eac-b6b3-ecf87e647123'],
    fields: ['series_name', 'service_times', 'picture']
  }
  const auth = {
    username: API_KEY,
    password: 'x'
  }

  try {
    const { data } = await axios.get(url, { params, auth })

    return {
      statusCode: 200,
      body: JSON.stringify(data),
      headers: {
        'access-control-allow-origin': '*'
      }
    }
  } catch (error) {
    // output to netlify function log
    console.log(error)
    const { status, statusText, headers, data } = error.response
    return {
      statusCode: status,
      // Could be a custom message or object i.e. JSON.stringify(err)
      body: JSON.stringify({ status, statusText, headers, data })
    }
  }
}

module.exports = { handler }
