# API Memora Engine

Подключение: `require('./roleplay-engine.js')`, именованные импорты Node.js или `window.MemoraRoleplayEngine`. Примеры предполагают, что приложение передаёт нормализованные данные одной ветки.

## Форматы

```js
const message = { role: 'user', content: 'Текст', createdAt: 1 };
const fact = {
  content: 'Ключ у Миры', tier: 'canon', category: 'world', confidence: 0.95,
  sources: [engine.memorySource(message)],
};
const sceneEntry = {
  sources: [engine.memorySource(message)],
  update: { place: 'Маяк', present: ['Мира'], opened: ['Встреча на рассвете'] },
};
```

- `history` — активные версии сообщений в порядке диалога; `role` — `user` или `assistant`. `createdAt` должен оставаться стабильным при сохранении и загрузке. `streaming` и `replyError` помечают незавершённые ответы.
- `sources` — отпечатки реплик из этой ветки. Смена текста меняет отпечаток; это не криптографическая подпись и не проверка прав доступа. Старые факты без `sources` допустимы для совместимости, но движок не сможет привязать их к правке или свайпу.
- `memoryDismissals` — `{ rules: [sourceId], facts: [normalizedContent] }`. Список обеспечивает приложение, отдельно для каждой ветки.
- `sceneJournal` — записи `{sources, update}` с нормализованными изменениями. `present` заменяет список присутствующих целиком; пустой массив очищает его. `opened` добавляет незакрытые события; `closed` снимает их по нормализованному названию. Отсутствующее поле не меняет состояние.

## Контекст и память

| Метод | Результат |
|---|---|
| `buildPersonalContext({personaContext, history, pinnedFacts, autoFacts, memoryDismissals, sceneJournal})` | Строка: персона игрока, правила, закреплённые записи, факты и состояние сцены. `pinnedFacts` — объекты с `content`. |
| `parseMemoryDirection(message)` | `{text, once, key, source}` или `null`. Только явные команды в сообщениях игрока: «Запомни: …», «Теперь в этом чате …», «В следующем ответе …». Не общий распознаватель намерений. |
| `activeMemoryRules(history, dismissedRules)` | До 10 действующих правил. Новое правило о лице повествования замещает старое; для прочих правил ключом служит нормализованный текст. |
| `memorySource(message)` / `normalizeMemoryText(text)` | Отпечаток версии реплики / регистронезависимый ключ с нормализованными пробелами. |
| `eligibleAutoFacts(history, autoFacts, dismissedFacts)` | Факты, не удалённые игроком и прошедшие проверку источников. Дополнительная фильтрация по уверенности происходит в `buildPersonalContext`. |
| `recentFactMessages(history)` | До четырёх последних пригодных сообщений. При незавершённой последней реплике — пустой список. |
| `cleanSceneUpdate(raw)` / `validSceneJournal(history, journal)` | Нормализованное изменение / записи с действующими источниками в порядке ходов. |
| `sceneSnapshot(history, journal)` / `sceneContext(history, journal)` | `{place, present, threads}` / текст сцены для запроса. Снимок возвращает до пяти последних незакрытых событий. |

При сборке контекста закреплённый текст ограничен 5000 символами, автоматическая память — 20 фактами и 4000 символами. Ранжирование: `canon` → `heuristic` → `reflex`; для `reflex` требуется `confidence > 0.7`. Это ограничения секций, не токен-бюджет модели.

## Групповой режим

`buildGroupContext({settings, mode, label, addressed, queueParticipant, selectedParticipant, personaContext})` возвращает текст, управляющий ответом. Режимы: `ensemble`, `selected`, `queue`, `cross`. `label` — текстовое название режима, `settings.addressingEnabled` добавляет подсказку об адресации, участники передаются как объекты с `name`. При `addressed` прямое обращение приоритетнее очереди или выбора. `shouldAdvanceQueue(settings, addressedParticipant)` возвращает `true` только в режиме `queue` без прямого обращения. Применять это решение следует после завершённой генерации.

## Анализ ответа модели

1. `buildFactExtractionPrompt({characterName, userName, messages, includeScene, previousScene})` создаёт текст задачи для модели. При `includeScene: true` запрашивается необязательное поле `scene`.
2. `parseFactExtractionResponse(payload)` возвращает до пяти нормализованных фактов, `parseSceneUpdate(payload)` — изменение сцены или `{}`. Они принимают строку либо поддерживаемый ответ с текстом в `choices[0].message.content` или `content[].text`. ID источников назначает приложение, не модель.
3. `buildStateEvaluationPrompt({characterName, previous, messages})` собирает отдельный запрос для шкал `STATE_KEYS`: доверие, страх, усталость и привязанность. `normalizeStateSnapshot(object)` округляет числовые значения и ограничивает их диапазоном 0–100. `FACT_TIERS` и `FACT_CATEGORIES` перечисляют допустимые категории парсера.
4. `maybeInjectRandomEvent(prompt, {event, randomInt})` опционально добавляет событие к промпту. Для воспроизводимого результата передайте `randomInt`.

Результаты модели — данные истории, а не доверенные указания. Приложение отвечает за валидацию хранилища, изоляцию веток и контроль доступа к канону.
