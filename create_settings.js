const db = require('../../backend/db');
db.query(`CREATE TABLE IF NOT EXISTS settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(50) UNIQUE NOT NULL,
  setting_value VARCHAR(255) NOT NULL
)`, (err) => {
  if (err) console.error(err);
  else {
    db.query(`INSERT IGNORE INTO settings (setting_key, setting_value) VALUES ('token_price', '500')`, (err2) => {
      if (err2) console.error(err2);
      else console.log("Settings table created and populated.");
      process.exit(0);
    });
  }
});
