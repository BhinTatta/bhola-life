import Image from "next/image";
import styles from "./page.module.css";
import BholaText from "./components/bhola-text/BholaText";

export default function Home() {
  return (
    <div className={styles.page}>
      <BholaText />
    </div>
  );
}
