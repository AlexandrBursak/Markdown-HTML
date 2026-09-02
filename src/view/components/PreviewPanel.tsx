import styles from "./PreviewPanel.module.css";

interface PreviewPanelProps {
  html: string;
}

export function PreviewPanel({ html }: PreviewPanelProps) {
  return (
    <section aria-label="Preview">
      <h2>Preview</h2>
      <div className={styles.content} dangerouslySetInnerHTML={{ __html: html }} />
    </section>
  );
}
