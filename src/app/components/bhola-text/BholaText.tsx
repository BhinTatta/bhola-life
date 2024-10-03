// components/BholaText.js
"use client";
import { useEffect, useState } from "react";

const fonts = [
  "Roboto, sans-serif",
  "Courier New, monospace",
  "Arial, sans-serif",
  "Comic Sans MS, cursive, sans-serif",
  "Impact, Charcoal, sans-serif",
  "Lucida Handwriting, cursive",
  "Trebuchet MS, sans-serif",
  "Lobster, cursive",
];

const colors = [
  "#FF5733", // Red-Orange
  "#33FF57", // Green
  "#3357FF", // Blue
  "#F1C40F", // Yellow
  "#8E44AD", // Purple
  "#E74C3C", // Bright Red
  "#3498DB", // Sky Blue
  "#1ABC9C", // Turquoise
  "#9B59B6", // Amethyst
  "#E67E22", // Carrot Orange
  "#F39C12", // Sunflower
  "#2ECC71", // Emerald
  "#2980B9", // Peter River
  "#D35400", // Pumpkin
];

const bholaTranslations = [
  "BHOLA", // English
  "भोला", // Hindi
  "ভোলা", // Bengali
  "భోలా", // Telugu
  "ಭೋಲಾ", // Kannada
  "ഭോലാ", // Malayalam
  "போலா", // Tamil
  "ભોલા", // Gujarati
  "ਭੋਲਾ", // Punjabi (Gurmukhi)
  "ଭୋଲା", // Odia
  "ভোলা", // Assamese
  "भोला", // Marathi
];

const BholaText = () => {
  const [color, setColor] = useState(colors[0]);
  const [font, setFont] = useState(fonts[0]);
  const [text, setText] = useState(bholaTranslations[0]);

  useEffect(() => {
    const intervalColor = setInterval(() => {
      setColor(colors[Math.floor(Math.random() * colors.length)]);
    }, 200); // Change color every 200ms

    const intervalFont = setInterval(() => {
      setFont(fonts[Math.floor(Math.random() * fonts.length)]);
    }, 1000); // Change font every 1000ms

    const intervalText = setInterval(() => {
      setText(
        bholaTranslations[Math.floor(Math.random() * bholaTranslations.length)]
      );
    }, 700); // Change text every 3000ms

    return () => {
      clearInterval(intervalColor);
      clearInterval(intervalFont);
      clearInterval(intervalText);
    };
  }, []);

  return (
    <div
      style={{
        color: color,
        fontFamily: font,
        fontSize: "15rem",
        fontWeight: "bold",
        textAlign: "center",
        height: "100vh",
        display: "flex",
        justifyContent: "end",
        alignItems: "end",
      }}
    >
      {text}
    </div>
  );
};

export default BholaText;
