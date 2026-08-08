# Tracker — markdown-to-html

> Status of every task in the epic. `implement` updates `done` as it commits each task.
> States: `todo` · `in_progress` · `blocked` · `review` · `done`.

| # | Task | Layer | Owner | Estimate | Blocked by | Status |
|---|---|---|---|---|---|---|
| T1 | Establish the typed GFM parsing contract | domain | Frontend Lead | 6h | — | done |
| T2 | Implement canonical sanitization and deterministic serializers | domain | Frontend Lead | 8h | T1 | done |
| T3 | Add resilient latest-draft browser storage | infra | Frontend Lead | 5h | — | done |
| T4 | Add a typed dual-MIME clipboard adapter | infra | Frontend Lead | 4h | — | done |
| T5 | Define disabled-by-default outcome telemetry | infra | Frontend Lead | 3h | — | done |
| T6 | Coordinate revision-matched conversion state | app | Frontend Lead | 8h | T2, T3, T4, T5 | done |
| T7 | Build the semantic converter workspace | ui | Frontend Lead | 8h | T6 | done |
| T8 | Expose sanitization and retention notices | ui | Frontend Lead | 5h | T7 | done |
| T9 | Complete copy and clear interaction recovery | ui | Frontend Lead | 6h | T3, T4, T8 | done |
| T10 | Compose the server-rendered converter route | wiring | Frontend Lead | 4h | T7 | todo |
| T11 | Verify the complete browser workflow and accessibility | tests | Frontend Lead | 8h | T9, T10 | todo |
| T12 | Prove security and performance quality gates | tests | Frontend Lead | 8h | T2, T10 | todo |

**Total:** 12 tasks, ~9 person-days.
