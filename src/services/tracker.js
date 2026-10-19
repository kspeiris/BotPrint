import { sendEvent } from './api';

const makeId = () => `S-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
function sessionId() {
  let id = sessionStorage.getItem('botprint-session-id');
  if (!id) { id = makeId(); sessionStorage.setItem('botprint-session-id', id); }
  return id;
}

export function createTracker(meta = {}) {
  const botContext = window.BOTPRINT_TEST_CONTEXT || {};
  const context = { sessionId: meta.sessionId || botContext.sessionId || sessionId(), userType: botContext.userType || meta.userType || 'Human', botType: botContext.botType || meta.botType || 'None', sessionSource: botContext.sessionSource || meta.sessionSource || 'Manual', botId: botContext.botId || '', coordinationGroupId: botContext.coordinationGroupId || '' };
  const startedAt = Date.now();
  let lastEventAt = startedAt, lastMoveAt = 0, lastX = null, lastY = null, lastSpeed = 0, lastClickAt = 0, lastKeyAt = 0, lastScrollY = window.scrollY;
  const counts = { mouse: 0, clicks: 0, scrolls: 0, typing: 0, navigations: 0 };
  const emit = (eventType, extra = {}) => {
    const now = Date.now(); const event = { ...context, eventType, page: location.pathname, timestamp: now, elapsedMs: now - startedAt, idleMs: now - lastEventAt, sessionDurationMs: now - startedAt, ...extra };
    lastEventAt = now; sendEvent(event);
  };
  const mouse = e => {
    const now = Date.now(); if (now - lastMoveAt < 100) return;
    const dx = lastX == null ? 0 : e.clientX - lastX, dy = lastY == null ? 0 : e.clientY - lastY;
    const dt = lastMoveAt ? Math.max(1, now - lastMoveAt) : 1; const speed = Math.sqrt(dx*dx + dy*dy) / dt; const acceleration = (speed - lastSpeed) / dt;
    lastMoveAt = now; lastX = e.clientX; lastY = e.clientY; lastSpeed = speed; counts.mouse++;
    emit('mousemove', { x: Math.round(e.clientX), y: Math.round(e.clientY), dx: Math.round(dx), dy: Math.round(dy), speed, acceleration, totalMouseSamples: counts.mouse });
  };
  const click = e => {
    const now = Date.now(); counts.clicks++;
    emit('click', { x: Math.round(e.clientX), y: Math.round(e.clientY), value: e.target?.tagName || '', clickIntervalMs: lastClickAt ? now-lastClickAt : null, clickCount: counts.clicks, fieldType: e.target?.type || e.target?.tagName?.toLowerCase() || '' }); lastClickAt = now;
  };
  const scroll = () => {
    const now = Date.now(); const y = window.scrollY; const delta = y-lastScrollY; const dt = Math.max(1, now-(scroll.lastAt||now)); counts.scrolls++;
    emit('scroll', { x: Math.round(window.scrollX), y: Math.round(y), scrollDelta: delta, scrollSpeed: Math.abs(delta)/dt, scrollCount: counts.scrolls }); lastScrollY=y; scroll.lastAt=now;
  };
  const key = e => {
    if (!e.target?.matches?.('input:not([type=password]),textarea,[contenteditable="true"]')) return;
    const now=Date.now(); counts.typing++;
    emit('keypress', { interKeyIntervalMs: lastKeyAt ? now-lastKeyAt : null, typingCount: counts.typing, keyCategory: e.key==='Backspace'?'Backspace':e.key==='Enter'?'Enter':e.key.length===1?'character':'control', fieldType: e.target?.type || e.target?.tagName?.toLowerCase() }); lastKeyAt=now;
  };
  const field = e => emit('field_interaction', { fieldType: e.target?.type || e.target?.tagName?.toLowerCase() || '', value: e.type });
  const submit = e => { counts.navigations++; emit('form_submit', { value: 'demo-form', navigationCount: counts.navigations }); };
  const pop = () => { counts.navigations++; emit('navigation', { value: location.pathname, navigationCount: counts.navigations }); };
  window.addEventListener('mousemove', mouse, { passive: true }); window.addEventListener('click', click, { passive: true }); window.addEventListener('scroll', scroll, { passive: true }); window.addEventListener('keydown', key); window.addEventListener('focusin', field); window.addEventListener('change', field); window.addEventListener('submit', submit, true); window.addEventListener('popstate', pop);
  emit('session_start', { value: 'start' });
  return () => { window.removeEventListener('mousemove', mouse); window.removeEventListener('click', click); window.removeEventListener('scroll', scroll); window.removeEventListener('keydown', key); window.removeEventListener('focusin', field); window.removeEventListener('change', field); window.removeEventListener('submit', submit, true); window.removeEventListener('popstate', pop); emit('session_end', { value: 'end', totalMouseSamples: counts.mouse, totalClicks: counts.clicks, totalScrolls: counts.scrolls, totalTypingEvents: counts.typing, totalNavigations: counts.navigations, sessionDurationMs: Date.now()-startedAt }); };
}
