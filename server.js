const express = require("express");
const dotenv = require('dotenv').config()
const axios = require("axios");
const redis = require("redis");
const {
  setupCache,
  buildStorage,
  canStale,
} = require("axios-cache-interceptor");



const app = express();
const port = 3000;


const client = redis.createClient({
  url:process.env.REDIS_URL
}); 

client.connect().then(()=>{console.log('connected!')})


const redisStorage = buildStorage({
  async find(key) {
    const result = await client.get(`axios-cache:${key}`);
    return JSON.parse(result);
  },

  async set(key, value) {
    await client.set(`axios-cache:${key}`, JSON.stringify(value), {
      PXAT: canStale(value) ? value.expiresAt : undefined,
    });
  },

  async remove(key) {
    await client.del(`axios-cache:${key}`);
  },
});

setupCache(axios, {
  storage: redisStorage,
});


app.get("/api/ditto", async (req, res) => {
  const result = await axios.get("https://pokeapi.co/api/v2/pokemon/ditto");
  res.status(200).json(result.data);
});

app.get("/api/pikachu", async (req, res) => {
  const result = await api.get("pikachu");
  res.status(200).json(result.data);
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
