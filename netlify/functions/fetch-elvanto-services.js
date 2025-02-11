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
    service_types: [
      '1a82f168-be13-4eac-b6b3-ecf87e647123', // Zentralkirchen-Gottesdienst
      '9a6e81fe-4a96-4b46-b86d-912a01931327', // Lokalkirche UNITED
      '8efcb423-57ce-4c0b-bac0-38f89719cfcd', // Livestream-Gottesdienst
      'dea808d1-7f61-4a1b-95f4-0477d1fc5966', // Schwalbe Arena-Gottesdienst
      '529243e4-0795-478e-9535-79a3f8107d5b', // LK-Gottesdienst Marienheide
      'a3b84ea2-7f95-4fe4-857d-2526121fdd7b', // LK-Gottesdienst Bergneustadt
      'd213e1a5-2a68-49a4-ba6e-9ef7f2434cae', // LK-Gottesdienst Bernberg
      '07e6f587-2156-4e39-913f-0dff8045b622', // LK-Gottesdienst Wiehl
      '0868c60d-aaaf-4a0d-8648-84d9c1ee71bb', // LK-Gottesdienst Oberberg West
      'c5ee2e2a-ae43-4f1a-8a00-7f36794a2030', // LK-Gottesdienst Windhagen
      'b3c4348f-ecb1-4fc5-8ef2-0b826db110ca' // LK-Gottesdienst Lohmar

    ],
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
        'access-control-allow-origin': '*',
        'Content-Type': 'application/json',
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
