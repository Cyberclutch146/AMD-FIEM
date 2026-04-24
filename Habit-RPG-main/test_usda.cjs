const https = require('https');

https.get('https://api.nal.usda.gov/fdc/v1/foods/search?api_key=DEMO_KEY&query=apple&pageSize=1', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(JSON.stringify(JSON.parse(data).foods[0], null, 2));
  });
});
