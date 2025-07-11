const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS vuelos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT,
      price REAL,
      data TEXT
    )
  `);
});

function saveFlightData(price, data) {
  const timestamp = new Date().toISOString();
  const query = `
    INSERT INTO vuelos (timestamp, price, data)
    VALUES (?, ?, ?)
  `;
  db.run(query, [timestamp, price, JSON.stringify(data)], (err) => {
    if (err) {
      console.error('Error al guardar en DB:', err.message);
    }
  });
}

module.exports = { saveFlightData };
