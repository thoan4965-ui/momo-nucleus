/* qa-score.js — Scoring FAQ local (IDF weights, pure logic, no DOM).
   Dung boi: js/chat.js (client) + tools/test-threshold.js (calibration).
   Nguyen ly: tu cang hiem trong kho (df thap) => trong so cang cao => cau hoi pho thong tu bi de xuong. */
(function (root) {
  'use strict';

  function normalizeText(text) {
    return text.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s]/g, '');
  }

  // Nguong duoc calibrate bang tools/test-threshold.js — chay lai test khi sua kho.
  // T=60: OUT_max=36 (test set), IN_min=120 → bien an toan 2 phia. Uu tien precision
  // (false-positive tra loi sai te hon miss -> model tra loi dung nhung cham hon).
  var THRESHOLD = 60;

  var index = null;

  function buildIndex(db) {
    var df = {};
    db.forEach(function (item) {
      var seen = {};
      normalizeText(item.q).split(/\s+/).forEach(function (w) {
        if (w.length < 2 || seen[w]) return;
        seen[w] = 1;
        df[w] = (df[w] || 0) + 1;
      });
    });
    index = { df: df, size: db.length };
    return index;
  }

  function wordWeight(w) {
    var d = index.df[w] || 0;
    if (d <= 5) return 30;   // hiem / dac trung
    if (d <= 20) return 15;  // trung binh
    return 3;                // pho thong (xuat hien khap noi)
  }

  function scoreOne(normQuery, item) {
    var normQ = normalizeText(item.q);
    var score = 0;
    if (normQ.indexOf(normQuery) !== -1 || normQuery.indexOf(normQ) !== -1) score += 100;
    var qWords = normQ.split(/\s+/);
    normQuery.split(/\s+/).forEach(function (w) {
      if (w.length < 2) return;
      if (qWords.indexOf(w) !== -1) score += wordWeight(w);
    });
    return score;
  }

  function findLocalAnswer(db, query) {
    if (!index) buildIndex(db);
    var normQuery = normalizeText(query);
    var best = null, bestScore = 0;
    db.forEach(function (item) {
      var s = scoreOne(normQuery, item);
      if (s > bestScore) { bestScore = s; best = item; }
    });
    if (bestScore >= THRESHOLD) {
      return { text: best.a, score: bestScore, q: best.q };
    }
    return null;
  }

  root.QAScore = {
    normalizeText: normalizeText,
    buildIndex: buildIndex,
    findLocalAnswer: findLocalAnswer,
    scoreOne: scoreOne,
    wordWeight: wordWeight,
    THRESHOLD: THRESHOLD
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
