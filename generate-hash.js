const bcrypt = require("bcryptjs");

// Change 'your_password_here' to the password you want to hash
const password = process.argv[2] || "admin123";
const saltRounds = 10;

const hash = bcrypt.hashSync(password, saltRounds);
console.log(`Password: ${password}`);
console.log(`Bcrypt hash: ${hash}`);
