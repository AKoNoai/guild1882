import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (import.meta.env.PROD) {
    if (!envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1')) {
      return 'https://guild1882-backend.vercel.app';
    }
    return envUrl;
  }
  return envUrl || 'http://localhost:5000';
};
const BASE_URL = getApiUrl();

const MONTHS = [1,2,3,4,5,6,7,8,9,10,11,12];

const WEATHER_TYPES = [
  { value: 1, label: 'Mưa', icon: 'fa-solid fa-cloud-rain' },
  { value: 2, label: 'Mưa lớn', icon: 'fa-solid fa-cloud-showers-heavy' },
  { value: 3, label: 'Mưa giông', icon: 'fa-solid fa-cloud-bolt' },
  { value: 4, label: 'Tuyết', icon: 'fa-solid fa-snowflake' },
  { value: 5, label: 'Tuyết nhiều', icon: 'fa-regular fa-snowflake' },
  { value: 6, label: 'Bão tuyết', icon: 'fa-solid fa-wind' },
  { value: 7, label: 'Sương mù', icon: 'fa-solid fa-smog' },
  { value: 8, label: 'Bão cát', icon: 'fa-solid fa-tornado' },
  { value: 9, label: 'Trời đẹp', icon: 'fa-solid fa-cloud-sun' },
];

const getFreeIcon = (iconClass) => {
  if (!iconClass) return 'fa-solid fa-smog';
  const mapping = {
    'fal fa-cloud-rain': 'fa-solid fa-cloud-rain',
    'fal fa-cloud-showers-heavy': 'fa-solid fa-cloud-showers-heavy',
    'fal fa-thunderstorm': 'fa-solid fa-cloud-bolt',
    'fal fa-snowflake': 'fa-solid fa-snowflake',
    'fal fa-snowflakes': 'fa-regular fa-snowflake',
    'fal fa-snow-blowing': 'fa-solid fa-wind',
    'fal fa-fog': 'fa-solid fa-smog',
    'fal fa-tornado': 'fa-solid fa-tornado',
    'fal fa-sun-cloud': 'fa-solid fa-cloud-sun',
  };
  return mapping[iconClass] || iconClass.replace('fal ', 'fa-solid ');
};

const WeatherWidget = () => {
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedType, setSelectedType] = useState(7);
  const [filterData, setFilterData] = useState(null);
  const [filterLoading, setFilterLoading] = useState(false);

  // Fetch 3-day forecast
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/weather/scrape`);
        setWeatherData(response.data);
      } catch (err) {
        console.error('Lỗi khi tải thời tiết:', err);
        setError('Không thể lấy dữ liệu thời tiết.');
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, []);

  // Fetch filter data whenever month or type changes
  const fetchFilter = useCallback(async (type, month) => {
    setFilterLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/weather/filter?type=${type}&month=${month}`);
      setFilterData(response.data);
    } catch (err) {
      console.error('Lỗi khi lọc thời tiết:', err);
      setFilterData(null);
    } finally {
      setFilterLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFilter(selectedType, selectedMonth);
  }, [selectedType, selectedMonth, fetchFilter]);

  // Parse filter data into sorted list of {day, time}
  const filterEntries = filterData
    ? Object.entries(filterData)
        .map(([day, val]) => {
          const entry = Array.isArray(val) ? val[0] : (val[1] || val[Object.keys(val)[0]]);
          return { day: parseInt(day), time: entry?.time || '' };
        })
        .filter(e => e.time)
        .sort((a, b) => a.day - b.day)
    : [];

  const selectedWeatherType = WEATHER_TYPES.find(w => w.value === selectedType);

  return (
    <div className="weather-widget-container">

      {/* 3-day forecast */}
      {loading && (
        <div className="ww-loading">
          <div className="spinner" />
          <span>Đang tải thời tiết...</span>
        </div>
      )}
      {error && <div className="ww-error">{error}</div>}
      {!loading && !error && (
        <div className="forecast-threedays">
          {weatherData.map((day, idx) => (
            <div key={idx}>
              <div className="card-weather">
                <div className="card-header">
                  <strong>{day.label}</strong>
                  <span>{day.date}</span>
                </div>
                <div className="card-body weather-today">
                  {day.weathers.map((w, wIdx) => (
                    <div key={wIdx}>
                      <div className="weather">
                        <i className={getFreeIcon(w.iconClass)} />
                        <strong>{w.name}: </strong>
                        <span>{w.time}</span>
                      </div>
                      {w.pokemons && (w.pokemons.normal.length > 0 || w.pokemons.advanced.length > 0) && (
                        <>
                          <div className="safari">
                            <div className="safari-normal">Thường</div>
                            <div className="safari-advanced">Cao cấp</div>
                          </div>
                          <div className="finded-pokemon">
                            <div className="normal">
                              {w.pokemons.normal.map((imgSrc, imgIdx) => (
                                <img key={imgIdx} src={imgSrc} width="60" height="60" alt="pokemon" />
                              ))}
                            </div>
                            <div className="advanced">
                              {w.pokemons.advanced.map((imgSrc, imgIdx) => (
                                <img key={imgIdx} src={imgSrc} width="60" height="60" alt="pokemon" />
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Weather Filter Section */}
      <div className="weather-filter-section">
        <h3 className="weather-filter-title">🔍 Lựa chọn thời tiết bạn muốn xem</h3>

        {/* Month selector */}
        <div className="wf-row">
          {MONTHS.map(m => (
            <button
              key={m}
              className={`wf-chip wf-chip-month ${selectedMonth === m ? 'active' : ''}`}
              onClick={() => setSelectedMonth(m)}
            >
              Tháng {m}
            </button>
          ))}
        </div>

        {/* Weather type selector */}
        <div className="wf-row">
          {WEATHER_TYPES.map(w => (
            <button
              key={w.value}
              className={`wf-chip wf-chip-type ${selectedType === w.value ? 'active' : ''}`}
              onClick={() => setSelectedType(w.value)}
            >
              <i className={w.icon} /> {w.label}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="wf-results">
          {filterLoading && (
            <div className="ww-loading">
              <div className="spinner" /><span>Đang tải...</span>
            </div>
          )}
          {!filterLoading && filterEntries.length === 0 && (
            <div className="wf-empty">Không có dữ liệu thời tiết "{selectedWeatherType?.label}" trong tháng {selectedMonth}.</div>
          )}
          {!filterLoading && filterEntries.length > 0 && (
            <div className="wf-slots">
              {filterEntries.map((entry, idx) => (
                <div key={idx} className={`wf-slot wf-type-${selectedType}`}>
                  <i className={selectedWeatherType?.icon} />
                  <span>{entry.time} &nbsp;|&nbsp; Ngày {String(entry.day).padStart(2,'0')}-{String(selectedMonth).padStart(2,'0')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
