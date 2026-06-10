const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();

let weatherCache = {
  data: null,
  timestamp: null
};

const filterCache = {}; // cache by "type-month" key
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

router.get('/scrape', async (req, res) => {
  try {
    if (weatherCache.data && weatherCache.timestamp && (Date.now() - weatherCache.timestamp < CACHE_DURATION)) {
      return res.json(weatherCache.data);
    }

    const response = await axios.get('https://thangtinshop.com/thoi-tiet', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const $ = cheerio.load(response.data);

    const weatherData = [];

    $('.forecast-threedays > div').each((index, element) => {
      const card = $(element).find('.card-weather');
      if (!card.length) return;

      const header = card.find('.card-header');
      const dateLabel = header.find('strong').text().trim(); // "Hôm nay", "Ngày mai", "Ngày kia"
      const dateValue = header.find('span').text().trim(); // "(10-06-2026)"

      const weathers = [];

      card.find('.card-body > div').each((i, el) => {
        const weatherDiv = $(el).hasClass('weather') ? $(el) : $(el).find('.weather');
        if (!weatherDiv.length) return;

        const iconClass = weatherDiv.find('i').attr('class');
        const weatherName = weatherDiv.find('strong').text().trim(); // "Sương mù:"
        const time = weatherDiv.find('span').text().trim(); // "21:47-23:47"

        const pokemons = {
          normal: [],
          advanced: []
        };

        const findedPokemon = $(el).find('.finded-pokemon');
        if (findedPokemon.length) {
          findedPokemon.find('.normal img').each((j, img) => {
            pokemons.normal.push($(img).attr('src'));
          });
          findedPokemon.find('.advanced img').each((j, img) => {
            pokemons.advanced.push($(img).attr('src'));
          });
        }

        weathers.push({
          iconClass,
          name: weatherName.replace(':', '').trim(),
          time,
          pokemons
        });
      });

      weatherData.push({
        label: dateLabel,
        date: dateValue,
        weathers
      });
    });

    weatherCache = {
      data: weatherData,
      timestamp: Date.now()
    };

    res.json(weatherData);
  } catch (error) {
    console.error('Error scraping weather:', error.message);
    res.status(500).json({ message: 'Lỗi khi cào dữ liệu thời tiết' });
  }
});

// GET /api/weather/filter?type=7&month=6
router.get('/filter', async (req, res) => {
  try {
    const { type = '7', month = new Date().getMonth() + 1 } = req.query;
    const cacheKey = `${type}-${month}`;

    if (filterCache[cacheKey] && (Date.now() - filterCache[cacheKey].timestamp < CACHE_DURATION)) {
      return res.json(filterCache[cacheKey].data);
    }

    const url = `https://thangtinshop.com/api/thoi-tiet/type?type=${type}&month=${month}`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://thangtinshop.com/thoi-tiet',
        'Origin': 'https://thangtinshop.com'
      }
    });

    filterCache[cacheKey] = {
      data: response.data,
      timestamp: Date.now()
    };

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching weather filter:', error.message);
    res.status(500).json({ message: 'Lỗi khi lấy dữ liệu lọc thời tiết' });
  }
});

module.exports = router;
