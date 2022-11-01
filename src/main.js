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

  const service = results[0]

  const localeDateArgs = ['de-DE', {dateStyle: "short"}]
  const localeTimeArgs = ['de-DE', {timeStyle: "short"}]

  const title = service.series_name || service.name
  const location = locationOverride[service.id] || 'H32'
  const date = parseElvantoDate(service.date).toLocaleDateString(...localeDateArgs)
  const times = service.service_times?.service_time?.map(({starts}) => parseElvantoDate(starts).toLocaleTimeString(...localeTimeArgs))
  const time = times.length && times.join(' & ') || parseElvantoDate(service.date).toLocaleTimeString(...localeTimeArgs)
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