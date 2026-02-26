const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
// const newsRoutes = require('./routes/news.routes');


const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api', authRoutes, userRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to Oryza API');
});

module.exports = app;