if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const { error } = require("console");

const dbUrl = process.env.ATLASDB_URL;

const store = MongoStore.create({
   mongoUrl: dbUrl,
   crypto: {
    secret: process.env.SECRET,
   },
   touchAfter: 24 * 3600,
});

const sessionsOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

store.on("error", () => {
  console.log("Error in Mongo session Store", error);
});

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);


main()
  .then((res) => {
    console.log("Working");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
}

app.use(session(sessionsOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// app.get("/demouser", async (req, res) => {
//   let fakerUser = new User({
//     email: "student@gmail.com",
//     username: "ajay_tamang",
//   });

//   let regUser = await User.register(fakerUser, "helloworld");
//   res.send(regUser);
// });

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user; //it help to access the req.user(user is logged in or not) in navebar.ejs
  next();
});

// middleware which use listing.js in routes folder
app.use("/listings", listingRouter);

// middleware which use review.js in routes folder

app.use("/listings/:id/reviews", reviewRouter);

// middleware which use user.js in routes folder

app.use("/", userRouter);

// Custom express error

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found!"));
});

// custom Error handler

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something Went wrong!" } = err;
  res.status(statusCode).render("listings/error.ejs", { message });
  // res.status(statusCode).send(message);
});

app.listen(8080, () => {
  console.log("Server is listing to 8080 port");
});
