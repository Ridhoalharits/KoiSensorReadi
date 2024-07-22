const express = require("express");
const { Pool } = require("pg");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(cors());
const pool = new Pool({
  connectionString:
    "postgres://default:xnqLSI9kFY8a@ep-ancient-cake-a1sq6ks9-pooler.ap-southeast-1.aws.neon.tech:5432/verceldb?sslmode=require",
});
app.post("/", (req, res) => {
  res.send("standby");
});

app.post("/push", (req, res) => {
  res.send("ready");
});

async function savetodb() {
  const client = await pool.connect();
  //fetching
  const apiUrl =
    "https://ta-capstone-22597-default-rtdb.asia-southeast1.firebasedatabase.app/UsersData.json";

  // Make GET request to Qubitro API
  const response = await fetch(apiUrl).then((respon) => respon.json());
  // .then(({ data }) => data);
  const sensorData = response.cSFGHidGb4gzLBalujMaowdFDGG2.Sensors;

  const values = [
    sensorData.Amonia,
    sensorData.AmoniaPercentage,
    sensorData.Suhu,
    sensorData.SuhuPercentage,
    sensorData.Tds,
    sensorData.TdsPercentage,
    sensorData.ph,
    sensorData.phPercentage,
    sensorData.turbidity,
    sensorData.turbidityPercentage,
  ];

  console.log(values);

  const query = `
        INSERT INTO sensor_readings (amonia, amonia_percentage, suhu, suhu_percentage, tds,tds_percentage,ph,ph_percentage, turbidity, turbidity_percentage)
        VALUES ($1, $2, $3, $4, $5,$6, $7, $8, $9, $10 )
      `;

  const result = await client.query(query, values);
  console.log("data berhasil di push : ", values);
  client.release();

  return result;
}
setInterval(() => {
  savetodb();
}, 10000);

async function getAllData() {
  try {
    const client = await pool.connect();
    const query = "SELECT * FROM sensor_readings";

    const result = await client.query(query);

    const historicalData = result.rows;

    client.release();

    return historicalData;
  } catch (error) {
    console.error("Error fetching data", error);
    throw error;
  }
}

app.get("/ambil", async (req, res) => {
  try {
    // Fetch historical weather data from PostgreSQL
    const historicalData = await getAllData();

    // Send the historical weather data as JSON response
    res.json(historicalData);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Start the Express server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
