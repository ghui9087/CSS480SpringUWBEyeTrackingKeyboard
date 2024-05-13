import React, { useEffect, useState } from "react";

export default function Home() {
  const [gazePosition, setGazePosition] = useState({ x: 0, y: 0 });
  const [eyeTrackingStarted, setEyeTrackingStarted] = useState(false);
  const [buttonPressed, setButtonPressed] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://api.gazerecorder.com/GazeCloudAPI.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.GazeCloudAPI) {
        console.log("GazeCloudAPI loaded successfully");
      } else {
        console.error("GazeCloudAPI is not available.");
      }
    };

    script.onerror = () => {
      console.error("Failed to load GazeCloudAPI script.");
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const startEyeTracking = () => {
    if (window.GazeCloudAPI) {
      window.GazeCloudAPI.StartEyeTracking();
      setEyeTrackingStarted(true);
    } else {
      console.error("GazeCloudAPI is not available.");
    }
  };

  const stopEyeTracking = () => {
    if (window.GazeCloudAPI) {
      window.GazeCloudAPI.StopEyeTracking();
      setEyeTrackingStarted(false);
    } else {
      console.error("GazeCloudAPI is not available.");
    }
  };

  useEffect(() => {
    if (eyeTrackingStarted) {
      window.GazeCloudAPI.OnCalibrationComplete = function () {
        console.log("Gaze Calibration Complete");
      };

      window.GazeCloudAPI.OnCamDenied = function () {
        console.log("Camera access denied");
      };

      window.GazeCloudAPI.OnError = function (msg) {
        console.log("Error:", msg);
      };

      function PlotGaze(GazeData) {
        setGazePosition({ x: GazeData.docX, y: GazeData.docY });
      }
      window.GazeCloudAPI.OnResult = PlotGaze;
    }
  }, [eyeTrackingStarted]);

  useEffect(() => {
    // Check if the gaze stays within the button area for more than 1 second
    const checkButtonPress = () => {
      const buttonElement = document.getElementById("pressButton");
      const buttonRect = buttonElement.getBoundingClientRect();
      const isGazeInsideButton =
        gazePosition.x >= buttonRect.left &&
        gazePosition.x <= buttonRect.right &&
        gazePosition.y >= buttonRect.top &&
        gazePosition.y <= buttonRect.bottom;

      if (isGazeInsideButton) {
        setButtonPressed(true);
      } else {
        setButtonPressed(false);
      }
    };

    checkButtonPress();

    return () => {};
  }, [gazePosition]);

  return (
    <main>
      <button onClick={startEyeTracking}>Start Eye Tracking</button>{" "}
      <br />
      <button onClick={stopEyeTracking}>Stop Eye Tracking</button>
      <div
        id="pressButton"
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: "1000px",
          height: "500px",
          backgroundColor: buttonPressed ? "green" : "blue",
          borderRadius: "10px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        Button
      </div>
      {eyeTrackingStarted && (
        <div
          style={{
            position: "absolute",
            left: gazePosition.x,
            top: gazePosition.y,
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            backgroundColor: "rgba(255, 0, 0, 0.5)",
            transform: "translate(-50%, -50%)",
          }}
        ></div>
      )}
    </main>
  );
}
