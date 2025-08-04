import { useState, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function App() {
  const [globalData, setGlobalData] = useState({});
  const [countriesData, setCountriesData] = useState([]);
  const [selectedCountryData, setSelectedCountryData] = useState({});
  const [selectedCountry, setSelectedCountry] = useState("Global");
  const [historicalData, setHistoricalData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then((res) => res.json())
      .then((data) => {
        setGlobalData(data);
        setSelectedCountryData(data);
      })
      .catch((err) => console.error(err));
  }, []);

  
  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/countries")
      .then((res) => res.json())
      .then((data) => setCountriesData(data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/historical/all?lastdays=all")
      .then((res) => res.json())
      .then((data) => setHistoricalData(data))
      .catch((err) => console.error(err));
  }, []);

  
  const handleCountryClick = (country) => {
    setSelectedCountry(country.country);
    setSelectedCountryData(country);

    fetch(`https://disease.sh/v3/covid-19/historical/${country.country}?lastdays=all`)
      .then((res) => res.json())
      .then((data) => {
        setHistoricalData(data.timeline || {});
      })
      .catch((err) => console.error(err));
  };

  
  const handleSearch = () => {
    const foundCountry = countriesData.find(
      (c) => c.country.toLowerCase() === searchTerm.toLowerCase()
    );
    if (foundCountry) {
      handleCountryClick(foundCountry);
    } else {
      alert("Country not found");
    }
  };

  return (
    <div className="covid-card">
      <div className="dashboard-container">
        <h1>Covid 19 Dashboard</h1>
        <p>
          Showing Data For: <strong>{selectedCountry}</strong>
        </p>
        <p>
          Last Updated:{" "}
          {selectedCountryData.updated
            ? new Date(selectedCountryData.updated).toLocaleDateString()
            : "Loading..."}
        </p>
      </div>

      <div className="info-container">
        <div className="cases-container">
          <h3>Total Cases</h3>
          <p>{selectedCountryData.cases?.toLocaleString() || "Loading..."}</p>
        </div>
        <div className="deaths-container">
          <h3>Total Deaths</h3>
          <p>{selectedCountryData.deaths?.toLocaleString() || "Loading..."}</p>
        </div>
        <div className="recovery-container">
          <h3>Total Recovery</h3>
          <p>{selectedCountryData.recovered?.toLocaleString() || "Loading..."}</p>
        </div>
      </div>

      <div className="search-container">
        <label htmlFor="country-search">Country Search</label>
        <input
          id="country-search"
          type="text"
          placeholder="Enter country"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      <div className="history-container">
        <h2>Cases Over Time</h2>
        {historicalData.cases ? (
          <p>
            {Object.keys(historicalData.cases).slice(-5).map((date) => (
              <span key={date}>
                {date}: {historicalData.cases[date].toLocaleString()} |{" "}
              </span>
            ))}
          </p>
        ) : (
          <p>Loading history...</p>
        )}
      </div>

      <div className="world-map">
        <h2>Interactive World Map</h2>
        <MapContainer
          center={[20, 0]}
          zoom={2}
          style={{ height: "400px", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          {countriesData.map((country) => (
            <CircleMarker
              key={country.country}
              center={[country.countryInfo.lat, country.countryInfo.long]}
              radius={Math.sqrt(country.cases) / 1000}
              fillOpacity={0.5}
              color="red"
              eventHandlers={{
                click: () => handleCountryClick(country),
              }}
            >
              <Tooltip direction="top">
                <div>
                  <strong>{country.country}</strong> <br />
                  Cases: {country.cases.toLocaleString()} <br />
                  Deaths: {country.deaths.toLocaleString()} <br />
                  Recovered: {country.recovered.toLocaleString()}
                </div>
              </Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      <div className="data-table">
        <h2>Country Data Table</h2>
        <p>| Country | Cases | Deaths | Recovered |</p>
        {countriesData
          .sort((a, b) => b.cases - a.cases)
          .slice(0, 10)
          .map((country) => (
            <p key={country.country}>
              | {country.country} | {country.cases.toLocaleString()} |{" "}
              {country.deaths.toLocaleString()} |{" "}
              {country.recovered.toLocaleString()} |
            </p>
          ))}
      </div>
    </div>
  );
}

export default App;
