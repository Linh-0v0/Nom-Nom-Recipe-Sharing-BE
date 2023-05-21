const { execSync } = require('child_process');

try {
  // Run node app.js to create user table and sample data
  execSync('node app.js');

  // Run main.sql to initialize other tables
  execSync('psql -U your_username -f main.sql');
} catch (error) {
  console.error('Release script failed:', error);
  process.exit(1);
}