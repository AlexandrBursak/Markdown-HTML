import { FileText, KeyRound, Link as LinkIcon } from "lucide-react";

import { ThemeControl } from "./ThemeControl";

import styles from "./ServiceHeader.module.css";

// Same order and markup on every RexSoft service so the header never shifts.
const services = [
  { href: "https://passgen.rexsoftproduction.com/", label: "Password Generator", icon: KeyRound, current: false },
  { href: "https://markdown-convertor.rexsoftproduction.com/", label: "Markdown to HTML", icon: FileText, current: true },
  { href: "https://snap-link.rexsoftproduction.com/", label: "Snap Link", icon: LinkIcon, current: false },
] as const;

export function ServiceHeader() {
  return (
    <header className={styles.bar}>
      <div className={styles.inner}>
        <nav aria-label="RexSoft services">
          <ul className={styles.list}>
            {services.map(({ href, label, icon: Icon, current }) => (
              <li key={href}>
                <a className={styles.link} href={href} aria-current={current ? "page" : undefined}>
                  <Icon className={styles.icon} aria-hidden="true" />
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <ThemeControl />
      </div>
    </header>
  );
}
