import React, { useEffect, useState } from "react";


declare global {
  interface Window {
    GazeCloudAPI: any; 
  }
}

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

  const plotGaze = (GazeData: any) => {
    setGazePosition({ x: GazeData.docX, y: GazeData.docY });
  };

  useEffect(() => {
    if (eyeTrackingStarted) {
      window.GazeCloudAPI.OnCalibrationComplete = () => {
        console.log("Gaze Calibration Complete");
      };

      window.GazeCloudAPI.OnCamDenied = () => {
        console.log("Camera access denied");
      };

      window.GazeCloudAPI.OnError = (msg: any) => {
        console.log("Error:", msg);
      };

      window.GazeCloudAPI.OnResult = plotGaze;
    }
  }, [eyeTrackingStarted]);

  useEffect(() => {
    const checkButtonPress = () => {
      const buttonElement = document.getElementById("pressButton");
      if (buttonElement) {
        const buttonRect = buttonElement.getBoundingClientRect();
        const isGazeInsideButton =
          gazePosition.x >= buttonRect.left &&
          gazePosition.x <= buttonRect.right &&
          gazePosition.y >= buttonRect.top &&
          gazePosition.y <= buttonRect.bottom;

        setButtonPressed(isGazeInsideButton);
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
