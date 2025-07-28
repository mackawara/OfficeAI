
const axios = require('axios');

const authHeader = `Bearer ${process.env.CRON_TRIGGER_TOKEN}`;
const action = "sendFinalReminder";
const url = `${process.env.API_ENDPOINT_URL}/${process.env.ENDPOINT.replace(/^\/+/,'')}?action=${encodeURIComponent(action)}`;
axios
  .get(url, {
    headers: {
      Authorization: authHeader,
      'Client-Type': 'github-action',
      'Content-Type': 'application/json',
    },
  })
  .then((result) => {
    console.log({ result });
    console.log(`SUCCESS: Triggered ${url}`);
    process.exit(0);
  })
  .catch((error) => {
    console.log(`ERROR: Triggered ${url}`, error);
    process.exit(1);
  });