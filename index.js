require('dotenv').config();
const axios = require('axios');
const cron = require('node-cron');
const TelegramBot = require('node-telegram-bot-api');
const { saveFlightData } = require('./db');

// Configuración
const PRICE_THRESHOLD = 150; // umbral de precio para alerta

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Array con consultas de vuelos a hacer
const flightQueries = [
    { origin: 'EZE', destination: 'BCN', month: '09', year: '2025', triptype: 'RT', currencyCode: 'USD' },
    { origin: 'EZE', destination: 'BCN', month: '10', year: '2025', triptype: 'RT', currencyCode: 'USD' },
    { origin: 'EZE', destination: 'BCN', month: '11', year: '2025', triptype: 'RT', currencyCode: 'USD' },
    { origin: 'EZE', destination: 'BCN', month: '12', year: '2025', triptype: 'RT', currencyCode: 'USD' },
    { origin: 'EZE', destination: 'BCN', month: '01', year: '2026', triptype: 'RT', currencyCode: 'USD' },
    { origin: 'EZE', destination: 'BCN', month: '02', year: '2026', triptype: 'RT', currencyCode: 'USD' },
    { origin: 'EZE', destination: 'BCN', month: '03', year: '2026', triptype: 'RT', currencyCode: 'USD' },
    { origin: 'EZE', destination: 'BCN', month: '04', year: '2026', triptype: 'RT', currencyCode: 'USD' },
    { origin: 'EZE', destination: 'BCN', month: '05', year: '2026', triptype: 'RT', currencyCode: 'USD' },
    { origin: 'EZE', destination: 'BCN', month: '06', year: '2026', triptype: 'RT', currencyCode: 'USD' },
    { origin: 'EZE', destination: 'BCN', month: '07', year: '2026', triptype: 'RT', currencyCode: 'USD' },
    { origin: 'EZE', destination: 'BCN', month: '08', year: '2026', triptype: 'RT', currencyCode: 'USD' },

    { origin: 'EZE', destination: 'MAD', month: '09', year: '2025', triptype: 'RT', currencyCode: 'USD' },
    { origin: 'EZE', destination: 'MAD', month: '10', year: '2025', triptype: 'RT', currencyCode: 'USD' },
    { origin: 'EZE', destination: 'MAD', month: '11', year: '2025', triptype: 'RT', currencyCode: 'USD' },
    { origin: 'EZE', destination: 'MAD', month: '11', year: '2025', triptype: 'RT', currencyCode: 'USD' },
    { origin: 'EZE', destination: 'MAD', month: '12', year: '2025', triptype: 'RT', currencyCode: 'USD' },
    { origin: 'EZE', destination: 'MAD', month: '01', year: '2026', triptype: 'RT', currencyCode: 'USD' },
    { origin: 'EZE', destination: 'MAD', month: '02', year: '2026', triptype: 'RT', currencyCode: 'USD' },
    { origin: 'EZE', destination: 'MAD', month: '03', year: '2026', triptype: 'RT', currencyCode: 'USD' },
    { origin: 'EZE', destination: 'MAD', month: '04', year: '2026', triptype: 'RT', currencyCode: 'USD' },
    { origin: 'EZE', destination: 'MAD', month: '05', year: '2026', triptype: 'RT', currencyCode: 'USD' },
    { origin: 'EZE', destination: 'MAD', month: '06', year: '2026', triptype: 'RT', currencyCode: 'USD' },
    { origin: 'EZE', destination: 'MAD', month: '07', year: '2026', triptype: 'RT', currencyCode: 'USD' },
    { origin: 'EZE', destination: 'MAD', month: '08', year: '2026', triptype: 'RT', currencyCode: 'USD' },

    { origin: 'EZE', destination: 'CDG', month: '10', year: '2025', triptype: 'RT', currencyCode: 'USD' },
    { origin: 'EZE', destination: 'CDG', month: '11', year: '2025', triptype: 'RT', currencyCode: 'USD' },
    { origin: 'EZE', destination: 'CDG', month: '12', year: '2025', triptype: 'RT', currencyCode: 'USD' },
    { origin: 'EZE', destination: 'CDG', month: '01', year: '2026', triptype: 'RT', currencyCode: 'USD' },
    { origin: 'EZE', destination: 'CDG', month: '02', year: '2026', triptype: 'RT', currencyCode: 'USD' },
    { origin: 'EZE', destination: 'CDG', month: '03', year: '2026', triptype: 'RT', currencyCode: 'USD' },
    { origin: 'EZE', destination: 'CDG', month: '04', year: '2026', triptype: 'RT', currencyCode: 'USD' },
    { origin: 'EZE', destination: 'CDG', month: '05', year: '2026', triptype: 'RT', currencyCode: 'USD' },
    { origin: 'EZE', destination: 'CDG', month: '06', year: '2026', triptype: 'RT', currencyCode: 'USD' },
    { origin: 'EZE', destination: 'CDG', month: '07', year: '2026', triptype: 'RT', currencyCode: 'USD' },
    { origin: 'EZE', destination: 'CDG', month: '08', year: '2026', triptype: 'RT', currencyCode: 'USD' },  

    { origin: 'EZE', destination: 'BER', month: '10', year: '2025', triptype: 'RT', currencyCode: 'USD' },
    { origin: 'EZE', destination: 'BER', month: '11', year: '2025', triptype: 'RT', currencyCode: 'USD' },
    { origin: 'EZE', destination: 'BER', month: '12', year: '2025', triptype: 'RT', currencyCode: 'USD' },
    { origin: 'EZE', destination: 'BER', month: '01', year: '2026', triptype: 'RT', currencyCode: 'USD' },
    { origin: 'EZE', destination: 'BER', month: '02', year: '2026', triptype: 'RT', currencyCode: 'USD' },
    { origin: 'EZE', destination: 'BER', month: '03', year: '2026', triptype: 'RT', currencyCode: 'USD' },
    { origin: 'EZE', destination: 'BER', month: '04', year: '2026', triptype: 'RT', currencyCode: 'USD' },
    { origin: 'EZE', destination: 'BER', month: '05', year: '2026', triptype: 'RT', currencyCode: 'USD' },
    { origin: 'EZE', destination: 'BER', month: '06', year: '2026', triptype: 'RT', currencyCode: 'USD' },
    { origin: 'EZE', destination: 'BER', month: '07', year: '2026', triptype: 'RT', currencyCode: 'USD' },
     { origin: 'EZE', destination: 'BER', month: '08', year: '2026', triptype: 'RT', currencyCode: 'USD' },

  ];  

// Función para armar la URL con los parámetros
function buildApiUrl({ origin, destination, month, year, triptype, currencyCode }) {
  return `https://www.flylevel.com/nwe/flights/api/calendar/?triptype=${triptype}&origin=${origin}&destination=${destination}&month=${month}&year=${year}&currencyCode=${currencyCode}`;
}

// Función para consultar vuelos y enviar alertas
async function checkFlights() {
  for (const query of flightQueries) {
    const API_URL = buildApiUrl(query);
    try {
      const response = await axios.get(API_URL, {
        headers: {
           'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'Accept': 'application/json',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.flylevel.com/',
        }
      });

      const dayPrices = response.data?.data?.dayPrices || [];

      const validPrices = dayPrices
        .filter(entry => entry.price !== null)
        .map(entry => ({ date: entry.date, price: entry.price }));

      if (validPrices.length === 0) {
        console.warn(`No se encontraron precios válidos para ${query.origin} -> ${query.destination} ${query.month}/${query.year}.`);
        continue;
      }

      const minPriceEntry = validPrices.reduce((min, current) =>
        current.price < min.price ? current : min
      );

      console.log(`[${new Date().toISOString()}] Precio mínimo para ${query.origin} -> ${query.destination}: $${minPriceEntry.price} para la fecha ${minPriceEntry.date}`);

      saveFlightData(minPriceEntry.price, { ...minPriceEntry, ...query });

      if (minPriceEntry.price < PRICE_THRESHOLD) {
        const message = `✈️ ¡Oferta encontrada!\n${query.origin} -> ${query.destination}\nPrecio: $${minPriceEntry.price} USD\nFecha: ${minPriceEntry.date}`;
        await bot.sendMessage(CHAT_ID, message);
      }
    } catch (error) {
      console.error(`Error al consultar vuelos para ${query.origin} -> ${query.destination}:`, error.message);
    }
  }
}

// Cronjob para correr cada 2 minutos
cron.schedule('*/2 * * * *', checkFlights);

// Primera ejecución inmediata
checkFlights();
