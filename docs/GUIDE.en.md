# Memora Engine: from setup to your first conversation

[Русский](GUIDE.md) · [API](API.en.md) · [Memora site patch](INTEGRATION.en.md)

## 1. What the core does

Memora Engine is an embeddable JavaScript library, not a hosted chat service or a language model. It turns an active conversation branch, player rules, saved facts, and scene changes into context text for a model request. The core needs no API keys or third-party npm dependencies. Built-in prompts and player direction patterns are currently in Russian.

Your adapter owns identity, storage, provider requests, streaming, and access to private character canon. See [Attribution](ATTRIBUTION.md) for terms and an example credit link.

## 2. Load the library

Copy `roleplay-engine.js` from your checked-out repository; there is no npm package to install. Pin a commit for reproducible builds.

**Node.js, CommonJS:**

```js
const engine = require('./roleplay-engine.js');
const context = engine.buildPersonalContext({ history: [] });
```

**Node.js, ESM:**

```js
import { buildPersonalContext } from './roleplay-engine.js';
const context = buildPersonalContext({ history: [] });
```

If the enclosing package declares `"type": "module"`, copy the CommonJS file as `roleplay-engine.cjs` and use that path instead.

**Browser:** load the core as a classic script before your app code.

```html
<script src="./roleplay-engine.js"></script>
<script>
  const engine = window.MemoraRoleplayEngine;
  console.log(engine.buildPersonalContext({ history: [] }));
</script>
```

Keep provider keys on your server. Browser-side context assembly should not expose private canon or server credentials.

## 3. Integrate a personal turn

1. Load the active branch. Preserve each message's `role`, `content`, stable `createdAt`, and active revision. Timestamps are part of source fingerprints; do not regenerate them on load.
2. Append the player's message and call `buildPersonalContext` with the branch state. `Запомни: пиши от третьего лица` saves a branch-scoped direction for third-person narration. `В следующем ответе …` applies only to the last user turn, including regeneration of that turn.
3. Combine the resulting context with the canon the user can access and the current dialogue on the server. Your adapter sets provider message roles, attachments, and token budgets. Treat remembered facts as story data, not trusted system instructions.
4. Handle streaming and retries in your provider adapter. You may display a partial reply, but do not use it as a memory source.
5. After saving a completed reply, run background analysis: select `recentFactMessages(history)`, create `buildFactExtractionPrompt`, then parse the provider output with `parseFactExtractionResponse` and `parseSceneUpdate`. Before committing, recheck access where applicable, the session ID, and the source revision. Attach source fingerprints from `memorySource` to facts and scene deltas. Drop results for deleted sessions.

Run [`examples/chat-adapter.cjs`](../examples/chat-adapter.cjs) to see the complete loop with a local mock, including a swipe and rejection of a stale analysis result. It needs no network or keys.

## 4. Edits, branches, and forgotten memories

- **Edit or swipe:** pass only the active version of each message. Facts or scene changes attached to an abandoned source stop affecting context. Legacy facts without `sources` cannot be traced back automatically.
- **Fork:** create a new session ID and copy history only up to the fork point. Do not share mutable arrays between branches. Transfer only memories valid at that point; choose a separate product policy for pins and dismissals.
- **Forget:** keep dismissals separate from dialogue. Use a rule's `source` or a fact's `normalizeMemoryText(content)` as its key. Apply dismissals when saving newly extracted facts and when building context, so a repeated extraction cannot undo a deletion.
- **Long chats:** the core's limits are counts and characters, not provider tokens. Budget tokens in your model adapter. Trimming what you send to a model is not the same as deleting stored history: losing an early message may remove the source of a rule or scene change.

## 5. Group turns

Resolve the addressee and queued participant in your adapter, then pass them with the mode and label to `buildGroupContext`. A direct address takes priority over the queue. Call `shouldAdvanceQueue` after successful generation; do not advance the queue for an interrupted reply or a retry of the same turn. The core does not automatically share personal memories with a group. If a character should not know a secret, exclude it from the request before generation.

## 6. Verify and debug

```sh
node --test core.test.cjs
node examples/first-scene.cjs
node examples/chat-adapter.cjs
```

| Symptom | Check |
|---|---|
| Browser cannot find the core | Verify the script URL and that it loads before the adapter. |
| A rule did not appear | Check the `user` role, explicit Russian wording, active branch, and dismissals. |
| A fact disappeared on reload | Verify source fingerprints and whether `createdAt` or `content` changed. |
| A stale fact returned after a swipe | Send only active variants, attach `sources`, and reject delayed analysis. |
| The model ignores a rule | Inspect the context actually sent and provider-side truncation. Receiving a rule does not guarantee compliance. |

Before releasing, test swipes, forks, interrupted replies and recovery, long history after reload, and isolation between branches. Use synthetic conversations and avoid putting private chat content or credentials in diagnostic logs.
