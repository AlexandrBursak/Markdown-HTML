import styles from "./HomePage.module.css";

import { ConverterWidget } from "@/view/widgets/ConverterWidget";

export default function HomePage() {
  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#converter">Skip to converter</a>
      <nav className={styles.serviceNav} aria-label="RexSoft services">
        <a href="https://passgen.rexsoftproduction.com/">Password Generator</a>
        <a href="https://markdown-convertor.rexsoftproduction.com/" aria-current="page">Markdown to HTML</a>
      </nav>
      <header className={styles.header}>
        <h1>Markdown to HTML</h1>
        <p>Write Markdown, verify the safe preview, and copy the exact HTML.</p>
      </header>
      <main id="converter" className={styles.main}>
        <ConverterWidget />
      </main>
    </div>
  );
}
