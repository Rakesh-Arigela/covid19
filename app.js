const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
app.use(express.json());

const dbPath = path.join(__dirname, "covid19India.db");

let db = null;

const initializeDBServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB error:${e.message}`);
    process.exit(1);
  }
};

initializeDBServer();

const convertDBObjectToResponseObject = (dbObject) => {
  return {
    stateId: dbObject.state_id,
    stateName: dbObject.state_name,
    population: dbObject.population,
  };
};

const convertDistrictObjectToResponseObject = (districtObject) => {
  return {
    districtId: districtObject.district_id,
    districtName: districtObject.district_name,
    cases: districtObject.cases,
    stateId: districtObject.state_id,
    cured: districtObject.cured,
    active: districtObject.active,
    deaths: districtObject.deaths,
  };
};

app.get("/states/", async (request, response) => {
  const statesQuery = `
    SELECT * FROM state`;
  const states = await db.all(statesQuery);
  response.send(
    states.map((eachState) => convertDBObjectToResponseObject(eachState))
  );
});

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStateQuery = `
    SELECT * FROM state WHERE state_id=${stateId}`;
  const getState = await db.get(getStateQuery);
  response.send(convertDBObjectToResponseObject(getState));
});

app.post("/districts/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const newDistrict = `
    INSERT INTO district ( 
        district_name,state_id,cases,cured,active,deaths)
    VALUES
   ("${districtName}",${stateId},${cases},${cured},${active},${deaths})
        `;
  const createDistrictQueryResponse = await db.run(newDistrict);
  response.send("District Successfully Added");
});

module.exports = app;
