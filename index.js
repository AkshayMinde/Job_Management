const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const dotenv = require('dotenv');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const flash = require('connect-flash');
const app = express();
dotenv.config();

// 1. jobs



//  ! DB setup
mongoose
.connect(process.env.DB_URI)
.then(()=> {
    console.log('db connected');
})
.catch((error)=>{
    console.log(error);
});



// ! session setup
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,/*Autosave like feature */
    cookie: {
        httpOnly:true,
        // secure:true, /* only to be used while hosting or else code will not work on localhost as it is in HTTP and not in HTTPS */
        maxAge: 1000 * 60 * 60 * 24 * 2,/* for cookie expiry time period */
        
    }
  })
)


// ! passport setup
const User = require('./models/user');
app.use(passport.initialize());/* initializing passport module */
app.use(passport.session());/* starting the session of passport */
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// ! server setup
// flash setup
app.use(flash());
// serving static files
app.use(express.static(path.join(__dirname, 'public')));
// form data parsing
app.use(express.urlencoded({extended: true}));
// remove ejs extension
app.set('view engine', 'ejs');

app.use(methodOverride('_method'));


app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    next();
}
);



app.get('/', (req,res)=>{
    res.render('home');
})



/* Every api we made on different js files we export it there and import here */
const jobRoutes = require('./routes/jobs');
const notifRoutes = require('./routes/notifications');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const quesRoutes = require('./routes/questions');
// by app.use we use them in our projects
app.use(jobRoutes);
app.use(notifRoutes);
app.use(authRoutes);
app.use(usersRoutes);
app.use(quesRoutes);


const port = process.env.PORT || 3000;
app.listen(port, (req, res)=>{
    console.log(`Server is working`);
})
