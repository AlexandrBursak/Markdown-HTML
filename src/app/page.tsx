import styles from "./HomePage.module.css";

export default function HomePage() {
  return (
    <div className={styles.page}>
      <a href="#main-content">Skip to content</a>
      <main id="main-content">
        <h1>Markdown to HTML</h1>
        <p>The converter foundation is ready.</p>
      </main>
    </div>
  );
}
