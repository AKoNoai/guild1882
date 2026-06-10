const axios = require('axios');
const cheerio = require('cheerio');

// Find AJAX endpoints in the JS file
axios.get('https://thangtinshop.com/niceshop/js/thoitiet.js').then(r => {
  const content = r.data;
  // Search for URL patterns
  const urlMatches = content.match(/url\s*[:=]\s*["'`][^"'`]+["'`]/gi) || [];
  const postMatches = content.match(/\.post\s*\(\s*["'`][^"'`]+["'`]/gi) || [];
  const getMatches = content.match(/\.get\s*\(\s*["'`][^"'`]+["'`]/gi) || [];
  const ajaxMatches = content.match(/ajax\s*\(\s*\{[^}]{0,200}/gi) || [];
  const fetchMatches = content.match(/fetch\s*\(\s*["'`][^"'`]+["'`]/gi) || [];

  console.log('URL patterns:', urlMatches.slice(0, 20));
  console.log('POST calls:', postMatches.slice(0, 20));
  console.log('GET calls:', getMatches.slice(0, 20));
  console.log('FETCH calls:', fetchMatches.slice(0, 20));
  console.log('AJAX calls:', ajaxMatches.slice(0, 20));
});
