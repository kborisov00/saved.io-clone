/**
 * Module Dependencies
 */
const sassMiddleware 	= require('node-sass-middleware'),
expressSession 			= require('express-session'),
expressLayouts 			= require('express-ejs-layouts'),
cookieParser 			= require('cookie-parser'),
createError 			= require('http-errors'),
mongoose 				= require('mongoose'),
passport 				= require('passport'),
favicon 				= require('serve-favicon'),
express 				= require('express'),
logger 					= require('morgan'),
dotenv 					= require('dotenv').config(),
flash 					= require('connect-flash'),
isUrl 					= require('is-url'),
path 					= require('path');


// initialize application
const app = express();

// connect to the database
mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false});

// configuration
app.set('views', path.join(__dirname, 'views'));								// set views folder
app.set('view engine', 'ejs');													// set view engine
app.use(expressLayouts);														// enable ejs layouts
app.use(sassMiddleware({														// use sass middleware to compile/decompile scss files
	src: path.join(__dirname, 'assets'),
	dest: path.join(__dirname, 'assets', 'public'),
	indentedSyntax: false,
	outputStyle: 'compressed',
}));
app.use(express.json());														// json parser
app.use(cookieParser());														// cookie parser
app.use(express.urlencoded({ extended: false }));								// form data parser
app.use(expressSession({														// express session config
	secret: process.env.SESSION_SECRET,
	resave: true,
	saveUninitialized: true
}));
app.use(favicon(path.join(__dirname, 'assets', 'public', 'favicon.ico')));		// favicon path
app.use(passport.initialize());													// initialize passport
app.use(passport.session());													// initialize passport session
app.use(flash());																// flash messages engine
app.use(express.static(path.join(__dirname, 'assets', 'public')));						// set static folder
app.use(logger('dev'));															// set server logger
require('./config/passport')(passport);											// passport config

// set global variables
app.use((req, res, next) => {
	res.locals.successMsg = req.flash('successMsg');
	res.locals.errorMsg = req.flash('errorMsg');
	res.locals.stylesheetUrl = '/stylesheets/style.css';
	res.locals.path = req.originalUrl.slice(1);
	res.locals.query = req.query;
	res.locals.user = req.user;
	next();
});

// routers
app.use('/', require('./routes/index'));	
app.use('/bookmark', require('./routes/bookmark'));

// handle params
app.use((req, res, next) => {
	const param = req.originalUrl.slice(1);

	if (isUrl(param)) {
		if (!req.user) {
			req.flash('errorMsg', 'Please login to create a bookmark');
			res.redirect(`/login?param=${param}`);
		} else {
			res.redirect(`/bookmark?param=${param}`);
		}
	} else {
		res.status(404).render('404', {
			title: 'Page Not found'
		});
	}
});

module.exports = app;
