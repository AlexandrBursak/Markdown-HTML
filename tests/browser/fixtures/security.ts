export const unsafeMarkdownFixtures = [
  "<script>window.__executed = true</script>",
  '<img src="x" onerror="window.__executed = true">',
  "[unsafe](javascript:window.__executed=true)",
  "![unsafe](data:text/html,bad)",
  "<iframe srcdoc=\"<script>window.__executed=true</script>\"></iframe>",
] as const;
