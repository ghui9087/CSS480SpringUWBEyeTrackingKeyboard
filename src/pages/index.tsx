import React, { useEffect, useState } from "react";
import styles from './page.module.css';

declare global {
  interface Window {
    GazeCloudAPI: any;
  }
}

const QWERTY = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'Backspace'],
  ['Caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'Enter'],
  ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm'],
  ['Space']
];

const COOLDOWN = 1000;

const BlinkingCursor = () => {
  return <span className={styles.blinkingCursor}></span>;
};

const Home = () => {
  const [gazePosition, setGazePosition] = useState({ x: 0, y: 0 });
  const [eyeTrackingStarted, setEyeTrackingStarted] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [canType, setCanType] = useState(false);
  const [currentHoveredKey, setCurrentHoveredKey] = useState<string | null>(null);
  const [hoverStartTime, setHoverStartTime] = useState<number | null>(null);
  const [isShiftActive, setIsShiftActive] = useState(false);
  const [isCapsActive, setIsCapsActive] = useState(false);
  const [keyboardLayout, setKeyboardLayout] = useState(QWERTY);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://api.gazerecorder.com/GazeCloudAPI.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (!window.GazeCloudAPI) {
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

  useEffect(() => {
    if (eyeTrackingStarted) {
      window.GazeCloudAPI.OnCalibrationComplete = () => setCanType(true);
      window.GazeCloudAPI.OnCamDenied = () => console.log("Camera access denied");
      window.GazeCloudAPI.OnError = (msg: any) => console.log("Error:", msg);
      window.GazeCloudAPI.OnResult = (GazeData: any) => setGazePosition({ x: GazeData.docX, y: GazeData.docY });
    }
  }, [eyeTrackingStarted]);

  useEffect(() => {
    const checkGazeOnKeys = () => {
      keyboardLayout.flat().forEach(key => {
        const keyElement = document.getElementById(`key-${key}`);
        if (keyElement) {
          const keyRect = keyElement.getBoundingClientRect();
          const gazeRadius = 20;
          const isGazeInsideKey =
            gazePosition.x + gazeRadius >= keyRect.left &&
            gazePosition.x - gazeRadius <= keyRect.right &&
            gazePosition.y + gazeRadius >= keyRect.top &&
            gazePosition.y - gazeRadius <= keyRect.bottom;

          if (isGazeInsideKey) {
            if (currentHoveredKey !== key) {
              setCurrentHoveredKey(key);
              setHoverStartTime(Date.now());
            } else if (hoverStartTime && Date.now() - hoverStartTime >= COOLDOWN) {
              handleKeyPress(key);
              setHoverStartTime(Date.now());
              keyElement.style.backgroundColor = "darkgray";
              setTimeout(() => {
                keyElement.style.backgroundColor = "lightgray";
              }, 500);
            }
          } else if (currentHoveredKey === key) {
            setCurrentHoveredKey(null);
            setHoverStartTime(null);
          }
        }
      });
    };

    if (canType) {
      checkGazeOnKeys();
    }
  }, [gazePosition, canType, currentHoveredKey, hoverStartTime]);

  const startEyeTracking = () => {
    window.GazeCloudAPI?.StartEyeTracking();
    setEyeTrackingStarted(true);
  };

  const stopEyeTracking = () => {
    window.GazeCloudAPI?.StopEyeTracking();
    setEyeTrackingStarted(false);
    setCanType(false);
  };

  const handleKeyPress = (key: string) => {
    if (key === 'Shift') {
      toggleShift();
    } else if (key === 'Backspace') {
      setTypedText(prev => prev.slice(0, -1));
    } else if (key === 'Space') {
      setTypedText(prev => prev + ' ');
    } else if (key === 'Enter') {
    } else if (key === 'Caps') {
      toggleCaps();
    } else {
      setTypedText(prev => prev + key);
      if (isShiftActive) toggleShift();
    }
  };

  const toggleShift = () => {
    setIsShiftActive(prev => !prev);
    setKeyboardLayout(prevLayout =>
      prevLayout.map(row =>
        row.map(k => (k !== 'Shift' && k !== 'Backspace' && k !== 'Space' && k !== 'Caps' && k !== 'Enter' ? toggleCase(k) : k))
      )
    );
  };

  const toggleCaps = () => {
    setIsCapsActive(prev => !prev);
    setKeyboardLayout(prevLayout =>
      prevLayout.map(row =>
        row.map(k => (k !== 'Shift' && k !== 'Backspace' && k !== 'Space' && k !== 'Caps' && k !== 'Enter' ? toggleCase(k) : k))
      )
    );
  };

  const toggleCase = (char: string) => (char.toLowerCase() === char ? char.toUpperCase() : char.toLowerCase());

  return (
    <main className={styles.container}>
      <button className={styles.startTracking} onClick={startEyeTracking}>Start Eye Tracking</button>
      <br />
      <div className={styles.typedText}>
        <p>Typed Text:</p>{typedText}<BlinkingCursor />
      </div>
      <div className={styles.innerContainer}>
        <div>
          {keyboardLayout.map((row, rowIndex) => (
            <div key={rowIndex} style={{ display: "flex", justifyContent: rowIndex === 3 ? 'center' : 'flex-start' }}>
              {row.map((key, keyIndex) => (
                <div
                  key={keyIndex}
                  id={`key-${key}`}
                  className={`${styles.keys} ${key === 'Shift' || key === 'Enter' || key === 'Backspace' ? styles.backspaceKey : ''} ${key === 'Space' ? styles.spaceKey : ''}`}
                >
                  {key !== 'Space' && key}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      {eyeTrackingStarted && (
        <div
          className={styles.gaze}
          style={{
            left: gazePosition.x,
            top: gazePosition.y,
          }}
        ></div>
      )}
    </main>
  );
};

export default Home;
