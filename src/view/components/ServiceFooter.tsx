import styles from "./ServiceFooter.module.css";

// Same footer on every RexSoft service; the page shell pins it to the bottom.
export function ServiceFooter() {
  return (
    <footer className={styles.bar}>
      <p className={styles.inner}>© {new Date().getFullYear()} RexSoft</p>
    </footer>
  );
}
