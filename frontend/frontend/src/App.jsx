import { useEffect, useState } from "react";
import axios from "axios";

function Reel({ videoUrl, title }) {

  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        position: "relative",
        background: "black"
      }}
    >

      <iframe
        src={videoUrl}
        width="100%"
        height="100%"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
        allowFullScreen
        style={{
          border: "none"
        }}
      />

      {/* Overlay */}
      <div
        style={{
          position: "absolute",
          bottom: "80px",
          left: "20px",
          color: "white",
          zIndex: 10
        }}
      >
        <h2>@ayaz</h2>
        <p>{title}</p>
      </div>

    </div>
  );
}

function App() {

  const [video, setVideo] = useState(null);

  const [loading, setLoading] = useState(false);

  const [reels, setReels] = useState([]);

  // FETCH ALL VIDEOS
  const fetchVideos = async () => {

    try {

      const res = await axios.get(
        "http://localhost:5000/videos"
      );

      setReels(res.data);

    } catch (error) {

      console.log(error);

    }

  };

  // LOAD VIDEOS WHEN APP STARTS
  useEffect(() => {

    fetchVideos();

  }, []);

  // UPLOAD VIDEO
  const uploadVideo = async () => {

    if (!video) {
      alert("Select video");
      return;
    }

    try {

      setLoading(true);

      const formData = new FormData();

      formData.append("video", video);

      await axios.post(
        "http://localhost:5000/upload",
        formData
      );

      // REFRESH FEED
      fetchVideos();

      alert("Upload Success");

    } catch (error) {

      console.log(error);

      alert("Upload Failed");

    } finally {

      setLoading(false);

    }

  };

  return (
    <div
      style={{
        background: "black",
        minHeight: "100vh"
      }}
    >

      {/* Upload UI */}
      <div
        style={{
          position: "fixed",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 999,
          display: "flex",
          gap: "10px",
          background: "rgba(0,0,0,0.7)",
          padding: "10px",
          borderRadius: "10px"
        }}
      >

        <input
          type="file"
          accept="video/*"
          onChange={(e) => setVideo(e.target.files[0])}
        />

        <button
          onClick={uploadVideo}
          style={{
            padding: "10px 20px",
            borderRadius: "10px",
            border: "none",
            cursor: "pointer"
          }}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>

      </div>

      {/* REELS FEED */}
      <div
        style={{
          overflowY: "scroll",
          height: "100vh",
          scrollSnapType: "y mandatory"
        }}
      >

        {reels.map((reel) => (
          <Reel
            key={reel.id}
            videoUrl={reel.videoUrl}
            title={reel.title}
          />
        ))}

      </div>

    </div>
  );
}

export default App;