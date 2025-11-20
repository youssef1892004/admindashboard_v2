// hash.js
const bcrypt = require('bcrypt');

// كلمة المرور التي تريد تشفيرها
const password = 'adminpassword123'; // <-- غيرها لكلمة مرور قوية

const saltRounds = 10;

bcrypt.hash(password, saltRounds, function(err, hash) {
    if (err) {
        throw err;
    }
    console.log('BCRYPT HASH:');
    console.log(hash);
});
