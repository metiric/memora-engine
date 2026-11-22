const assert = require('node:assert/strict');
const engine = require('../roleplay-engine.js');

// Synthetic, single-branch demo. A real adapter owns authentication and storage.
const branch = {
  revision: 0,
  history: [{ role: 'user', content: 'Запомни: пиши от третьего лица', createdAt: 1 }],
  pinnedFacts: [], autoFacts: [], memoryDismissals: { rules: [], facts: [] }, sceneJournal: [],
};
const append = message => { branch.history.push(message); branch.revision++; };
const replaceLast = content => {
  branch.history[branch.history.length - 1] = { ...branch.history.at(-1), content };
  branch.revision++;
};

async function analyzeCompletedTurn(analyze) {
  const messages = engine.recentFactMessages(branch.history);
  if (messages.length < 2) return false;
  const revision = branch.revision;
  const sources = messages.map(engine.memorySource);
  const prompt = engine.buildFactExtractionPrompt({
    characterName: 'Мира', messages, includeScene: true,
    previousScene: engine.sceneSnapshot(branch.history, branch.sceneJournal),
  });
  const raw = await analyze(prompt);
  if (branch.revision !== revision) return false;
  branch.autoFacts.push(...engine.parseFactExtractionResponse(raw).map(fact => ({ ...fact, sources })));
  const update = engine.parseSceneUpdate(raw);
  if (Object.keys(update).length) branch.sceneJournal.push({ sources, update });
  return true;
}

async function main() {
  append({ role: 'user', content: 'Куда пошла Мира?', createdAt: 2 });
  const context = engine.buildPersonalContext(branch);
  const mockReply = async ({ context }) => {
    assert.match(context, /третьего лица/);
    return 'Мира вошла в маяк и положила ключ на стол.';
  };
  append({ role: 'assistant', content: await mockReply({ context }), createdAt: 3 });
  await analyzeCompletedTurn(async prompt => {
    assert.match(prompt, /Мира вошла в маяк/);
    return JSON.stringify({
      facts: [{ content: 'Ключ на столе', tier: 'canon', category: 'world', confidence: 1 }],
      scene: { place: 'Маяк', present: ['Мира'] },
    });
  });
  assert.match(engine.buildPersonalContext(branch), /Ключ на столе/);
  assert.match(engine.buildPersonalContext(branch), /Место: Маяк/);

  let finish;
  const pending = analyzeCompletedTurn(() => new Promise(resolve => { finish = resolve; }));
  replaceLast('Мира осталась дома.');
  finish(JSON.stringify({ scene: { place: 'Старый маяк' } }));
  assert.equal(await pending, false, 'ignore stale analysis after a swipe');
  const afterSwipe = engine.buildPersonalContext(branch);
  assert.doesNotMatch(afterSwipe, /Ключ на столе|Маяк/);
  assert.match(afterSwipe, /третьего лица/);
  console.log('PASS: context → mock reply → scene analysis → swipe → stale analysis rejected');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
