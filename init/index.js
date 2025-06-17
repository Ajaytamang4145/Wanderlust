const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then((res) => {
    console.log("Connected to database");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDb = async () => {
  await Listing.deleteMany({}); /* Delete the db if their is any data. */
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: "6794bfed90c5976b82daee3f",
  }));
  await Listing.insertMany(initData.data);
  console.log("data was initialized");
};

initDb();
