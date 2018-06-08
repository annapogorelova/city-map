export default {
    appName: process.env.APP_NAME,
    defaultCityName: process.env.DEFAULT_CITY_NAME,
    apiUrl: process.env.API_URL,
    apiRequestTimeout: process.env.REQUEST_TIMEOUT,
    reCaptchaKey: process.env.RECAPTCHA_KEY,
    signInRouteName: process.env.SIGN_IN_ROUTE_NAME,
    locationTimeout: parseInt(process.env.LOCATION_TIMEOUT),
    defaultCitiesCount: parseInt(process.env.DEFAULT_CITIES_LIMIT)
};