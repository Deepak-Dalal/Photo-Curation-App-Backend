const cors = require("cors");
const express = require("express");
require("dotenv").config();
const { createNewUser } = require("./controllers/usersController");
const { sequelize } = require("./models");
const {
  searchImages,
  saveImage,
  addTagsToPhoto,
  searchPhotosByTags,
  getSearchHistory,
} = require("./controllers/photosController");

const app = express();

app.use(cors());
app.use(express.json());

sequelize
  .authenticate()
  .then(() => {
    console.log("database connected.");
  })
  .catch((error) => {
    console.error("Unable to connect to database", error);
  });

app.post("/api/users", createNewUser);

app.get("/api/photos/search", searchImages);
app.post("/api/photos", saveImage);
app.post("/api/photos/:photoId/tags", addTagsToPhoto);
app.get("/api/photos/tag/search", searchPhotosByTags);
app.get("/api/search-history", getSearchHistory);

app.listen(3000, () => {
  console.log("server is listening on port 3000");
});
