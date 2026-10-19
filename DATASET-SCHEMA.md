# BotPrint dataset schema — proposal aligned

## Raw events
- Session labels: `sessionId`, `userType` (Human/Bot), `botType` (None/FastBot/RandomBot/MimicBot/CoordinatedBot), `sessionSource`, `botId`, `coordinationGroupId`.
- Common fields: `eventType`, `timestamp`, `elapsedMs`, `idleMs`, `page`.
- Mouse trajectories: `x`, `y`, `dx`, `dy`, `speed`, `acceleration`.
- Clicks: `clickIntervalMs`, `clickCount`.
- Scroll: `scrollDelta`, `scrollSpeed`, `scrollCount`.
- Typing rhythm without text: `interKeyIntervalMs`, `typingCount`, `keyCategory`, `fieldType`.
- Session aggregates: `navigationCount`, `sessionDurationMs`, `totalMouseSamples`, `totalClicks`, `totalScrolls`, `totalTypingEvents`, `totalNavigations`.
- Other: `value`, `detail`.

## Event types to implement/collect
`session_start`, `session_end`, `mouse_move`, `click`, `scroll`, `typing`, `field_focus`, `form_submit`, `navigation`, `inactivity_sample`, `metadata_update`.

## Fingerprint features derived in Phase 02
Interaction timing; behavioural variance; action frequency; navigation similarity; typing rhythm; mouse movement consistency; swipe dynamics (touch-specific swipe needs extra work); session duration statistics; behavioural entropy; temporal interaction patterns; click frequency/intervals; scroll speed; idle periods; coordinated synchronisation.

Never store actual typed text, passwords, tokens, or form values. Generated bots use synthetic values, avoid sensitive fields, and do not submit forms automatically.
