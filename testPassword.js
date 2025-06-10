const bcrypt = require('bcryptjs');

const hashedPassword = '$2b$10$k18REziSiyqhV6GI89fh4e4Enju44xV3d2Y1X9fTExIsi8XNGzoV6';
const plainPassword = '00112233'; // Use the same password you typed in frontend

async function testPasswordMatch() {
  try {
    const match = await bcrypt.compare(plainPassword, hashedPassword);
    console.log('Manual compare result:', match); // true or false
  } catch (err) {
    console.error('Error comparing passwords:', err);
  }
}

testPasswordMatch();
