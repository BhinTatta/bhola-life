"use client";
import React, { useEffect, useState } from "react";
import styles from "./BackgroundManager.module.scss";
import TwoFaceComponent from "../BackGround3D/TwoFace";
import FallingBackground from "../FallingBackground";
import AnaglyphEffectComponent from "../BackGround3D/AnaglyphEffectComponent";

const components = [
  <TwoFaceComponent key="twoface" />,
  <FallingBackground key="falling" />,
  <AnaglyphEffectComponent key="anaglyph" />,
];

const BackgroundManager: React.FC = () => {
  const [currentComponent, setCurrentComponent] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentComponent((prev) => (prev + 1) % components.length);
    }, 4000); // Switch every 3 seconds

    return () => clearInterval(intervalId); // Clean up on unmount
  }, []);

  return (
    <div className={styles.backgroundContainer}>
      {components[currentComponent]}
    </div>
  );
};

export default BackgroundManager;
