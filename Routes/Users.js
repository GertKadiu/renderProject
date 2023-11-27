const express = require("express");
const router = express.Router();
const UserModel = require("../models/users");
const multer = require("multer");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage });

router.post("/CreateUser", upload.single("image"), (req, res) => {
  const imageFilePath = req.file ? req.file.path : null;

  if (imageFilePath) {
    try {
      const imageBuffer = fs.readFileSync(imageFilePath);
      const imageBase64 = `data:image/jpeg;base64,${imageBuffer.toString(
        "base64"
      )}`;

      const newUser = new UserModel({
        name: req.body.name,
        email: req.body.email,
        age: req.body.age,
        image: imageBase64,
      });

      newUser
        .save()
        .then((user) => res.json(user))
        .catch((err) => res.status(500).json(err));
    } catch (error) {
      console.error("Error reading and encoding image:", error);
      res.status(500).json({ error: "Error reading and encoding image" });
    }
  } else {
    res.status(400).json({ error: "No image file uploaded" });
  }
});

router.put("/updateUser/:id", upload.single("image"), (req, res) => {
  const id = req.params.id;

  const imageFilePath = req.file ? req.file.path : null;

  if (imageFilePath) {
    try {
      const imageBuffer = fs.readFileSync(imageFilePath);
      const imageBase64 = `data:image/jpeg;base64,${imageBuffer.toString(
        "base64"
      )}`;

      UserModel.findByIdAndUpdate(
        { _id: id },
        {
          name: req.body.name,
          email: req.body.email,
          age: req.body.age,
          image: imageBase64,
        },
        { new: true }
      )
        .then((updateUser) => res.json(updateUser))
        .catch((error) => res.status(500).json(err));
    } catch (error) {
      console.error("Error reading and encoding image:", error);
      res.status(500).json({ error: "Error reading and encoding image" });
    }
  } else {
    UserModel.findByIdAndUpdate(
      { _id: id },
      {
        name: req.body.name,
        email: req.body.email,
        age: req.body.age,
      },
      { new: true }
    )
      .then((updatedUser) => res.json(updatedUser))
      .catch((err) => res.status(500).json(err));
  }
});

router.get("/", (req, res) => {
  UserModel.find({})
    .then((users) => res.json(users))
    .catch((err) => res.json(err));
});

router.delete("/deleteUser/:id", (req, res) => {
  const id = req.params.id;
  UserModel.findByIdAndDelete({ _id: id })
    .then((users) => res.json(users))
    .catch((err) => res.json(err));
});

router.get("/getUser/:id", (req, res) => {
  const id = req.params.id;
  UserModel.findById({ _id: id })
    .then((users) => res.json(users))
    .catch((err) => res.json(err));
});

router.get("/SingleUser/:id", (req, res) => {
  const id = req.params.id;
  UserModel.findById({ _id: id })
    .then((users) => res.json(users))
    .catch((err) => res.json(err));
});

module.exports = router;
