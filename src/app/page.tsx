import styles from "./HomePage.module.css";

import { ServiceFooter } from "@/view/components/ServiceFooter";
import { ServiceHeader } from "@/view/components/ServiceHeader";
import { ConverterWidget } from "@/view/widgets/ConverterWidget";

export default function HomePage() {
  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#converter">Skip to converter</a>
      <ServiceHeader />
      <main id="converter" className={styles.main}>
        <div className={styles.intro}>
          <h1>Markdown to HTML</h1>
          <p>Write Markdown, verify the safe preview, and copy the exact HTML.</p>
        </div>
        <ConverterWidget />
      </main>
      <ServiceFooter />
    </div>
  );
}
