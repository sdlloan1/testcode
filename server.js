const express = require('express');
const app = express();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://your-supabase-instance.supabase.co';
const supabaseKey = 'your-supabase-key';
const supabaseSecret = 'your-supabase-secret';

const supabase = createClient(supabaseUrl, supabaseKey, supabaseSecret);

// Define the user schema
const userSchema = {
  number: '',
  password: '',
};

// Define the login details schema
const loginDetailsSchema = {
  number: '',
  password: '',
  timestamp: '',
};

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/login', async (req, res) => {
  const { number, password } = req.body;
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('number', number);

  if (error || !data || data.length === 0) {
    return res.status(401).send('Invalid credentials');
  }

  const user = data[0];
  if (user.password !== password) {
    return res.status(401).send('Invalid credentials');
  }

  const loginDetail = {
    number,
    password,
    timestamp: new Date(),
  };

  const { data: loginData, error: loginError } = await supabase
    .from('login_details')
    .insert([loginDetail]);

  if (loginError) {
    console.error(loginError);
  }

  res.send('Login successful');
});

app.get('/admin', async (req, res) => {
  const { data, error } = await supabase
    .from('login_details')
    .select('*');

  if (error) {
    console.error(error);
  }

  res.json(data);
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
