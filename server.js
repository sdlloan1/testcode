const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Define the user schema
const userSchema = new mongoose.Schema({
  number: String,
  password: String
});

// Define the login details schema
const loginDetailsSchema = new mongoose.Schema({
  number: String,
  password: String,
  timestamp: Date
});

// Create models
const User = mongoose.model('User', userSchema);
const LoginDetail = mongoose.model('LoginDetail', loginDetailsSchema);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/login', (req, res) => {
  const { number, password } = req.body;
  User.findOne({ number }, (err, user) => {
    if (err || !user) {
      return res.status(401).send('Invalid credentials');
    }
    bcrypt.compare(password, user.password, (err, match) => {
      if (err || !match) {
        return res.status(401).send('Invalid credentials');
    }
    const loginDetail = new LoginDetail({ number, password, timestamp: new Date() });
    loginDetail.save((err) => {
      if (err) {
        console.error(err);
      }
    });
    res.send('Login successful');
  });
});
});

app.get('/admin', (req, res) => {
  LoginDetail.find().then((loginDetails) => {
    res.json(loginDetails);
  });
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
