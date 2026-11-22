# Memora Engine API

[Русская версия](API.md) · [Integration](INTEGRATION.en.md)

## Data contract

- `history`: the active versions of messages in one branch, in dialogue order. A message has `role` (`user` or `assistant`), `content` and stable `createdAt`. Use `streaming` or `replyError` to mark incomplete assistant replies.
- `pinnedFacts`: objects with a `content` string. Auto facts also have `tier`, `category`, `confidence` and optionally `sources`. Each source is a fingerprint from `memorySource(message)`. It changes when the text changes and is not a cryptographic signature. Legacy facts without sources cannot be invalidated by editing their source message.
- `memoryDismissals`: `{ rules: [sourceId], facts: [normalizedContent] }`, scoped by the application to the branch.
- `sceneJournal`: entries `{ sources, update }` with normalized updates. `place` changes location; `present` replaces the cast list (an empty array clears it); `opened` and `closed` add and remove plot threads by normalized name. Omitted fields leave previous values intact.

## Context, rules and scene

| Method | Result |
|---|---|
| `buildPersonalContext({personaContext, history, pinnedFacts, autoFacts, memoryDismissals, sceneJournal})` | Context text containing the persona, rules, memories and scene. Pinned text is capped at 5,000 characters; auto memory at 20 facts and 4,000 characters. Canon ranks above heuristic and reflex; reflex facts need confidence above 0.7. These are not model token limits. |
| `parseMemoryDirection(message)` | `{ text, once, key, source }` or `null`. Recognizes explicit, whole-message Russian player directions such as `Запомни: …`, `Теперь в этом чате …` and `В следующем ответе …`. It is not a general intent detector. |
| `activeMemoryRules(history, dismissedRules)` | Up to ten active rules. A new narrative point of view replaces the previous rule in that category. Other rules are keyed by normalized text. |
| `memorySource(message)` / `normalizeMemoryText(text)` | Message version fingerprint / lowercase text with normalized whitespace. |
| `eligibleAutoFacts(history, autoFacts, dismissedFacts)` | Facts whose recorded sources still exist and whose contents have not been dismissed. |
| `recentFactMessages(history)` | Up to four recent suitable messages; returns an empty list if the latest reply is incomplete. |
| `cleanSceneUpdate(raw)` / `validSceneJournal(history, journal)` | Sanitized scene delta / valid entries in source-turn order. |
| `sceneSnapshot(history, journal)` / `sceneContext(history, journal)` | `{ place, present, threads }` / scene text for a model request. The snapshot returns up to five unfinished threads. |

## Group turns

`buildGroupContext({settings, mode, label, addressed, queueParticipant, selectedParticipant, personaContext})` returns group response instructions. Modes: `ensemble`, `selected`, `queue`, `cross`. `label` is a display string; participant objects contain `name`. The adapter resolves `addressed`. Direct addressing overrides the normal speaker for the current turn. `shouldAdvanceQueue(settings, addressedParticipant)` is true only in queue mode without a direct address. Apply that decision after successful generation.

## Background analysis

- `buildFactExtractionPrompt({characterName, userName, messages, includeScene, previousScene})` prepares a model request; `includeScene` requests optional scene updates. `parseFactExtractionResponse(payload)` returns up to five normalized facts; `parseSceneUpdate(payload)` returns a scene delta or `{}`. Both accept a string, `choices[0].message.content`, or `content[].text`. The adapter supplies source fingerprints, not the model.
- `buildStateEvaluationPrompt({characterName, previous, messages})` asks for numeric state changes. `normalizeStateSnapshot(object)` rounds and bounds supported values to 0–100. `STATE_KEYS` lists supported state fields; `FACT_TIERS` and `FACT_CATEGORIES` list accepted fact metadata.
- `maybeInjectRandomEvent(prompt, {event, randomInt})` optionally appends a story event. Inject `randomInt` for deterministic tests.

Treat model output as story data, not trusted instructions. Authorization and session isolation are adapter responsibilities.
