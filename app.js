const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const listing = require("./models/listing.js");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapasync = require("./utils/wrapasync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema}=require("./schema.js")

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

app.get("/", (req, res) => {
  res.send("Hi, I am a root");
});

const validateListing= (req,res,next)=>{
    let {error}=listingSchema.validate(req.body);

    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",")
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
}

//index route
app.get("/listings", async (req, res) => {
  const alllistings = await listing.find({});
  res.render("./listings/index.ejs", { alllistings });
});

// new route
app.get("/listings/new", async (req, res) => {
  res.render("listings/new.ejs");
});

// show route

app.get(
  "/listings/:id",
  wrapasync(async (req, res) => {
    let { id } = req.params;
    const Listing = await listing.findById(id);
    res.render("listings/show.ejs", { Listing });
  })
);

// create route
app.post(
  "/listings",validateListing,
  wrapasync(async (req, res, next) => {
    let result=listingSchema.validate(req.body);
    console.log(result);
    if(result.error){
        throw new ExpressError(400,result.error);
    }
    const newListing = new listing(req.body.Listing);
    await newListing.save();
    res.redirect("/listings");
  })
);

//edit route
app.get(
  "/listing/:id/edit",
  wrapasync(async (req, res) => {
    let { id } = req.params;
    const Listing = await listing.findById(id);
    res.render("listings/edit.ejs", { Listing });
  })
);

// update route
app.put(
  "/listings/:id",validateListing,
  wrapasync(async (req, res) => {
    let { id } = req.params;
    await listing.findByIdAndUpdate(id, { ...req.body.Listing });
    res.redirect(`/listings/${id}`);
  })
);

// delete route
app.delete(
  "/listings/:id",
  wrapasync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
  })
);

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
  let { statusCode=500, message="Smething Went Wrong" } = err;
  res.status(statusCode).render("error.ejs",{ message })
//   res.status(statusCode).send(message);
});

app.listen(8080, () => {
  console.log("app is listening on port 8080");
});
