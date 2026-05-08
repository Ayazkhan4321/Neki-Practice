const express = require("express");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors({
    origin: "https://neki-practice-git-main-ayazkhan4321s-projects.vercel.app/"
}));

const upload = multer({
    dest: "uploads/"
});

const LIBRARY_ID = process.env.BUNNY_LIBRARY_ID;
const API_KEY = process.env.BUNNY_API_KEY;

app.post("/upload", upload.single("video"), async (req, res) => {

    try {

        // STEP 1: Create video on Bunny
        const createVideo = await axios.post(
            `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos`,
            {
                title: req.file.originalname
            },
            {
                headers: {
                    AccessKey: API_KEY,
                    "Content-Type": "application/json"
                }
            }
        );

        const videoId = createVideo.data.guid;

        // STEP 2: Read uploaded file
        const videoFile = fs.readFileSync(req.file.path);

        // STEP 3: Upload video to Bunny
        await axios.put(
            `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos/${videoId}`,
            videoFile,
            {
                headers: {
                    AccessKey: API_KEY,
                    "Content-Type": "application/octet-stream"
                }
            }
        );

        // STEP 4: Remove temp file
        fs.unlinkSync(req.file.path);

        // STEP 5: Generate playback URL
        // STEP 5: Get Video Details From Bunny

        const videoDetails = await axios.get(
            `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos/${videoId}`,
            {
                headers: {
                    AccessKey: API_KEY
                }
            }
        );

        // Bunny embed URL
        const videoUrl =
            `https://iframe.mediadelivery.net/embed/${LIBRARY_ID}/${videoId}`;

        res.json({
            success: true,
            videoId,
            videoUrl
        });

    } catch (error) {

        console.log(error.response?.data || error.message);

        res.status(500).json({
            success: false,
            error: error.message
        });
    }

});
// GET ALL VIDEOS FROM BUNNY
app.get("/videos", async (req, res) => {

    try {

        const response = await axios.get(
            `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos`,
            {
                headers: {
                    AccessKey: API_KEY
                }
            }
        );

        const videos = response.data.items.map((video) => {

            return {
                id: video.guid,

                title: video.title,

                videoUrl:
                    `https://iframe.mediadelivery.net/embed/${LIBRARY_ID}/${video.guid}`
            };

        });

        res.json(videos);

    } catch (error) {

        console.log(error.response?.data || error.message);

        res.status(500).json({
            error: "Failed to fetch videos"
        });

    }

});

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});