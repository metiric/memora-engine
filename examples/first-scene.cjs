const assert = require('node:assert/strict');
const engine = require('../roleplay-engine.js');

const player = { role: 'user', createdAt: 1, content: 'Запомни: пиши от третьего лица' };
const arrival = { role: 'assistant', createdAt: 2, content: 'Мира вошла в маяк с ключом.' };
const sources = [engine.memorySource(arrival)];
const state = {
  history: [player, arrival],
  autoFacts: [{ content: 'Ключ у Миры', tier: 'canon', category: 'world', confidence: 1, sources }],
  sceneJournal: [{ sources, update: { place: 'Маяк', present: ['Мира'] } }],
};

const initial = engine.buildPersonalContext(state);
assert.match(initial, /третьего лица/);
assert.match(initial, /Ключ у Миры/);
assert.match(initial, /Место: Маяк/);
console.log('Первый вариант:', initial);

const alternate = { ...arrival, content: 'Мира осталась дома.' };
const replay = engine.buildPersonalContext({ ...state, history: [player, alternate] });
assert.match(replay, /третьего лица/);
assert.doesNotMatch(replay, /Ключ у Миры|Маяк/);
console.log('\nПосле смены варианта:', replay);
