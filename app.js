const express = require('express');
const bodyParser = require('body-parser');
const Promise = require('bluebird');
const sqlite = require('sqlite');

const app = express();
const dbPromise = sqlite.open('./database.db', { Promise });

app.set('view engine', 'ejs');
const urlencodedParser = bodyParser.urlencoded({ extended: false });

console.log(dbPromise);

// Route for '/' to enable index
app.get('/', async (req, res, next) => {
  try {
    const db = await dbPromise;
    const [user, vscExt] = await Promise.all([
      // db.all('INSERT INTO vsc_ext_table (record_id, user_id, vsc_ext_url) VALUES (3, 3, "value");'),
      db.all('SELECT * FROM user_table'),
      db.all('SELECT * FROM vsc_ext_table'),
    ]);
    console.log('test', user, vscExt);
    res.render('index', { user, vscExt });
  } catch (err) {
    next(err);
  }
});

// Route for login.html to confirm login success
app.post('/login.html', urlencodedParser, async (req, res, next) => {
  // Cache email address and password
  const logInAcct = req.body.account;
  const logInPass = req.body.pass;
  try {
    const db = await dbPromise;
    // Query all user accounts from database, cache in userArray
    const userArray = await Promise.all(db.all('SELECT * FROM user_table'));
    // Loop through accounts to confirm if user/pass combination is available
    userArray.forEach((user) => {
      if (user.email === logInAcct && user.hash_pass === logInPass) {
        // If combination found, render extList page
        res.render('extList', { user });
      }
    });
    res.render('index', { userArray });
  } catch (err) {
    next(err);
  }
});

// Route for login.html to confirm login success
app.post('/register.html', urlencodedParser, async (req, res, next) => {
  // Cache all inputs
  const firstName = req.body.firstname;
  const lastName = req.body.lastname;
  const email = req.body.email;
  const pass = req.body.pass;
  try {
    const db = await dbPromise;
    // Query all user accounts from database, cache in userArray
    const userInput = await Promise.all(db.all(`INSERT INTO user_table (first_name, last_name, email, hash_pass) VALUES ('${firstName}', '${lastName}', '${email}', '${pass}');`));
    const user = await Promise.all(db.all(`SELECT * FROM user_table WHERE email='${email}';`));
    console.log(user);
    res.render('extList', { user });
  } catch (err) {
    next(err);
  }
});

app.listen(3000, () => {
  console.log('Server Started on Port 3000');
});
