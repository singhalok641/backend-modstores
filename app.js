const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
const db = require('./config/database');
var cookieParser = require('cookie-parser'); 
var session = require('express-session');
var flash = require('connect-flash');
var MongoStore = require('connect-mongo')(session);
//const http = require('http');

// Connect To Database
mongoose.connect(db.database);

// On Connection
mongoose.Promise = global.Promise;
mongoose.connection.on('connected', () => {
  console.log('Connected to database '+db.database);
});

// On Error
mongoose.connection.on('error', (err) => {
  console.log('Database error: '+err);
});

const app = express();
const stores = require('./routes/stores');

// Port Number
const port = process.env.PORT || 8082;

// CORS Middleware
app.use(cors());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true, limit: '100mb'}));
app.use(cookieParser());
app.use(session({
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: false,
	store: new MongoStore({mongooseConnection: mongoose.connection}),
	cookie: { maxAge:180*60*1000}
}));
app.use(flash());

app.use(function(request, response, next) {
   request.session.cookie.maxAge = 180 * 60 * 1000; // 3 hours
   next();
});
app.use(function(request,response,next){
	response.locals.session = request.session;
	next();
})

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);

app.use('/stores', stores);

// Index Route
// app.get('/', (req, res) => {
//   res.send('Invalid Endpoint');
// });

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public/index.html'));
// });

// Start Server
app.listen(port, () => {
  console.log('Server started on port '+port);
});
