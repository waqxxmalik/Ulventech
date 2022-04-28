require("dotenv").config();
var express = require("express"), 
app = express(),
bodyParser = require("body-parser"),		
mongoose    = require("mongoose"),
passport    = require("passport"),
LocalStrategy = require("passport-local"),
cookieParser = require("cookie-parser"),	
flash        = require("connect-flash"),
bcrypt =    require('bcryptjs'), 
User        = require("./models/user"),
session = require("express-session");
require('./config/passport')(passport);

 
mongoose.connect("mongodb+srv://waqasarif:treadstone@cluster0.fefb5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", { useUnifiedTopology: true }
             ,{ useNewUrlParser: true })
  .then(() => console.log(`Database connected`))
  .catch(err => console.log(`Database connection error: ${err.message}`));

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "public"));
app.use(cookieParser());
app.use(flash());
// PASSPORT CONFIGURATION
app.use(require("express-session")({
secret: "Once again Rusty wins cutest dog!",
resave: false,
saveUninitialized: false
}));


app.use(passport.initialize());
app.use(passport.session());



app.use(function(req, res, next){
res.locals.currentUser = req.user;
res.locals.success = req.flash('success');
res.locals.error = req.flash('error');
next();
});




app.get("/",  function(req, res){
  
  res.render("index");
});


app.get("/customer", isLoggedIn,  function(req, res){
  res.send("Hello World")
});


app.get("/admin", AdminAuthorization,   function(req, res){
  res.send("Hello World")
});


//Authention Starts from here//


app.get("/register", function(req, res){
res.render("register")
})


app.post('/register', (req, res) => {
  const { username, password} = req.body;
  let errors = [];

  if (!username ||  !password ) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      username,
      password
    });
  } else {
    User.findOne({ username: username}).then(user => {
      if (user) {
        errors.push({ msg: 'Username already exists' });
        res.render('register', {
          errors,
          username,
          password
        });
      } else {
        const newUser = new User({
          username,
          password
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
                res.redirect('/login');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});




app.get("/login", function(req, res) {
    res.render("login");
    req.flash("error", "You must have to Login First")
    });
   
  // Login
  app.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
}), function(req, res) {
});

app.get("/logout", function(req, res) {
req.logout();
res.redirect("/");
});



function isLoggedIn(req, res, next){
   if(req.isAuthenticated()){
    return next();
  } else {
  req.flash('error', 'You must be signed in to do that!');
  res.redirect('/login'); 
}
}




//Admin Auth 
function AdminAuthorization(req, res, next){
  if(req.isAuthenticated() && req.user.id === "6231eff0391b6cb57f445d49"){
      return next();
  } 
  res.send('You do not have permisiion to do that!');
}

app.listen(process.env.PORT || 3047, function(req, res){
	console.log("server started")
});