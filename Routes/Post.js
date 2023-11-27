const express = require("express");
const router = express.Router();
const PostModel = require("../models/posts")
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

router.post("/CreateEvents", upload.single("image"), (req, res) => {
  const imageFilePath = req.file ? req.file.path : null;

  if (imageFilePath) {
    try {
      const imageBuffer = fs.readFileSync(imageFilePath);
      const imageBase64 = `data:image/jpeg;base64,${imageBuffer.toString(
        "base64"
      )}`;

      const newEvent = new PostModel({
        eventName: req.body.eventName,
        creator: req.body.creator,
        location: req.body.location,
        description: req.body.description,
        participants: req.body.participants,
        date: req.body.date,
        image: imageBase64,
      });

      newEvent
        .save()
        .then((event) => res.json(event))
        .catch((err) => res.status(500).json(err));
    } catch (error) {
      console.error("Error reading and encoding image:", error);
      res.status(500).json({ error: "Error reading and encoding image" });
    }
  } else {
    res.status(400).json({ error: "No image file uploaded" });
  }
});

router.get("/Events", async (req, res) => {
  try {
    const posts = await PostModel.find({})
      .populate("creator", "name")
      .populate({
        path: "participants",
        select: "name",
      })
      .exec();

    // Convert posts with base64 image and format the date
    const postsWithBase64Image = posts.map((post) => {
      const postObj = post.toObject(); // Convert Mongoose document to plain object
      if (postObj.image && postObj.image.data) {
        postObj.image = postObj.image.data.toString("base64");
      }

      // Format the date as a readable string
      if (postObj.date instanceof Date) {
        postObj.date = postObj.date.toDateString(); // Example format: "Fri Sep 16 2023"
      }

      return postObj;
    });

    res.json(postsWithBase64Image);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/PostsByCreator/:creatorId", async (req, res) => {
  const creatorId = req.params.creatorId;
  try {
    const posts = await PostModel.find({ creator: creatorId })
      .populate("creator", "name")
      .populate({
        path: "participants",
        select: "name", 
      })
      .exec();

    const postsWithBase64Image = posts.map((post) => {
      const postObj = post.toObject();
      if (postObj.image && postObj.image.data) {
        postObj.image = postObj.image.data.toString("base64");
      }
      if (postObj.date instanceof Date) {
        postObj.date = postObj.date.toDateString(); // Example format: "Fri Sep 16 2023"
      }

      return postObj;
    });

    res.json(postsWithBase64Image);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/EventsByParticipant/:participantsId", async (req, res) => {
  const participantsId = req.params.participantsId;

  try {
    const posts = await PostModel.find({ participants: participantsId })
      .populate("creator", "name")
      .populate("participants", "name")
      .exec();
    const postsWithBase64Image = posts.map((post) => {
      const postObj = post.toObject();
      if (postObj.image && postObj.image.data) {
        postObj.image = postObj.image.data.toString("base64");
      }

      if (postObj.date instanceof Date) {
        postObj.date = postObj.date.toDateString();
      }

      return postObj;
    });

    res.json(postsWithBase64Image);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


router.delete("/deletePost/:id", (req, res) => {
  const id = req.params.id;
  PostModel.findByIdAndDelete({ _id: id })
    .then((posts) => res.json(posts))
    .catch((err) => res.json(err));
});

router.get("/getPost/:id", (req, res) => {
  const id = req.params.id;
  PostModel.findById({ _id: id })
    .then((posts) => res.json(posts))
    .catch((err) => res.json(err));
});

router.get("/SingleEvent/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const post = await PostModel.findById(id)
      .populate({
        path: "creator",
        select: "name",
      })
      .populate({
        path: "participants",
        select: "name image",
      })
      .exec();

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/editEvent/:id", upload.single("image"), (req, res) => {
    const id = req.params.id;

    const imageFilePath = req.file ? req.file.path : null;

    if (imageFilePath) {
      try {
        const imageBuffer = fs.readFileSync(imageFilePath);
        const imageBase64 = `data:image/jpeg;base64,${imageBuffer.toString(
          "base64"
        )}`;

        PostModel.findByIdAndUpdate(
          { _id: id },
          {
            eventName: req.body.eventName,
            creator: req.body.creator,
            location: req.body.location,
            description: req.body.description,
            participants: req.body.participants,
            image: imageBase64,
          },
          { new: true }
        )
          .then((updateEvent) => res.json(updateEvent))
          .catch((error) => res.status(500).json(error));
      } catch (error) {
        console.error("Error reading and encoding image:", error);
        res.status(500).json({ error: "Error reading and encoding image" });
      }
    } else {
      PostModel.findByIdAndUpdate(
          { _id: id },
          {
            eventName: req.body.eventName,
            creator: req.body.creator,
            location: req.body.location,
            description: req.body.description,
            participants: req.body.participants,
          },
          { new: true }
        )
          .then((updateEvent) => res.json(updateEvent))
          .catch((error) => res.status(500).json(error));
    }
});

module.exports = router;
