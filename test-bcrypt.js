// test-bcrypt.js
import bcrypt from 'bcryptjs';

// Plaintext password you want to test
const inputPassword = '00112233';

// Hashed password from your MongoDB (copy exactly as it appears)
const storedHash = '$2b$10$k18REziSiyqhV6GI89fh4e4Enju44xV3d2Y1X9fTExIsi8XNGzoV6';

// Compare the plaintext password with the hash
bcrypt.compare(inputPassword, storedHash)
  .then(isMatch => {
    console.log('✅ Password match:', isMatch); // Expect: true
  })
  .catch(err => {
    console.error('❌ Bcrypt error:', err);
  });
