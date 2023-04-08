/**
 * @param {HTMLDivElement} divContainer a div container where the content is rendered in
 * @param {Record<string, string>} locationOverride a map for location overrides: service.id -> Location Name
 */
export default async (divContainer, locationOverride = {'example-service-id-8abd-9a97580a8cd6': 'Forum FCBG'}) => {
  const {
    title,
    location,
    date,
    time
  } = await getDataFromService(locationOverride)

  if (!time) return `${title}`
  if (title === 'Lokalkirchen-Standorte') return divContainer.innerHTML = `<a href="https://www.kirchefueroberberg.de/lokalkirchen#standorten" class="text-black">${title}</a> | ${date}`
  
  divContainer.innerHTML = `${title} | ${location} | ${date} | ${time}`
}


/**
 * @param {Record<string, string>} locationOverride a map for location overrides: service.id -> Location Name
 * @returns {Promise<{title: string; location: string; date: string; time: string}}>}
 */
const getDataFromService = async (locationOverride) => {
  const fetchUpcomingServices = async () => {
    const { services } = await fetch('https://kfo-sunday-service.netlify.app/.netlify/functions/fetch-elvanto-services').then((response) => response.json())
    return services.service || []
  }
  const results = await fetchUpcomingServices()
  if (!results.length) return { title: 'Kein Gottesdienst geplant' }

  const service = isUpcomingLocalService(results[0])

  const localeDateArgs = ['de-DE', {dateStyle: "short"}]
  const localeTimeArgs = ['de-DE', {timeStyle: "short"}]

  const title = service.series_name || service.name
  const location = locationOverride[service.id] || 'H32'
  const date = parseElvantoDate(service.date).toLocaleDateString(...localeDateArgs)
  const times = service.service_times?.service_time?.reverse()?.map(({starts}) => parseElvantoDate(starts).toLocaleTimeString(...localeTimeArgs))
  const time = times && times.length && times.join(' & ') || parseElvantoDate(service.date).toLocaleTimeString(...localeTimeArgs)
  return {
    title,
    location,
    date,
    time
  }
}

/**
 * 
 * @param {string} dateString 
 * @returns {Date}
 */
const parseElvantoDate = (dateString) => {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const monthIndex = date.getMonth()
  const day = date.getDate()
  const hours = date.getHours()
  const minutes = date.getMinutes()

  return new Date(Date.UTC(year, monthIndex, day, hours, minutes))
}

const isUpcomingLocalService = (service) => {
  const localchurchServiceTypes = [
    '529243e4-0795-478e-9535-79a3f8107d5b', // LK-Gottesdienst Marienheide
    'a3b84ea2-7f95-4fe4-857d-2526121fdd7b', // LK-Gottesdienst Bergneustadt
    'd213e1a5-2a68-49a4-ba6e-9ef7f2434cae', // LK-Gottesdienst Bernberg
    '07e6f587-2156-4e39-913f-0dff8045b622', // LK-Gottesdienst Wiehl
    '0868c60d-aaaf-4a0d-8648-84d9c1ee71bb', // LK-Gottesdienst Oberberg West
    'c5ee2e2a-ae43-4f1a-8a00-7f36794a2030', // LK-Gottesdienst Windhagen
    'b3c4348f-ecb1-4fc5-8ef2-0b826db110ca' // LK-Gottesdienst Lohmar
  ]
  
  if (!localchurchServiceTypes.includes(service.service_type.id)) {
    return service
  }

  return {
    name: 'Lokalkirchen-Standorte',
    date: parseElvantoDate(service.date)
  }
}