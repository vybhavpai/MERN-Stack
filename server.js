const connectDB = require('./config/db');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.get('/', (req, res) => {
    res.send('API Runnning');
});

//Define Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));


app.listen(PORT, () => {
    console.log(`server  started on port ${PORT}`);
});


