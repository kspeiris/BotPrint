const STORAGE_KEY='botprint-events-v2';
const getQueryCollector=()=>{try{return new URL(location.href).searchParams.get('botprintCollector')||''}catch{return ''}};
export function getEvents(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]')}catch{return[]}}
export function saveEvent(event){const all=getEvents();all.push(event);localStorage.setItem(STORAGE_KEY,JSON.stringify(all.slice(-20000)));return event}
export function clearEvents(){localStorage.removeItem(STORAGE_KEY)}
export function getSessions(){const map=new Map();for(const e of getEvents()){if(!map.has(e.sessionId))map.set(e.sessionId,{sessionId:e.sessionId,userType:e.userType,botType:e.botType,sessionSource:e.sessionSource,events:0,lastSeen:e.timestamp});const s=map.get(e.sessionId);s.events++;s.lastSeen=e.timestamp;}return [...map.values()]}
export async function sendEvent(event){saveEvent(event);const url=getGasUrl();if(!url)return;try{await fetch(url,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(event),keepalive:true})}catch(e){console.warn('Remote event delivery failed; retained locally.',e)}}
export async function sendBatch(events){for(const e of events)await sendEvent(e)}
export function setGasUrl(url){localStorage.setItem('botprint-gas-url',url.trim())}
export function getGasUrl(){const queryUrl=getQueryCollector();if(queryUrl){localStorage.setItem('botprint-gas-url',queryUrl);return queryUrl}return localStorage.getItem('botprint-gas-url')||''}
export function exportCsv(events){const cols=['sessionId','userType','botType','sessionSource','botId','coordinationGroupId','eventType','timestamp','elapsedMs','idleMs','page','x','y','dx','dy','speed','acceleration','clickIntervalMs','clickCount','scrollDelta','scrollSpeed','scrollCount','interKeyIntervalMs','typingCount','keyCategory','fieldType','navigationCount','sessionDurationMs','totalMouseSamples','totalClicks','totalScrolls','totalTypingEvents','totalNavigations','value','detail'];const esc=v=>{const s=String(v??'');return /[",\n]/.test(s)?'"'+s.replaceAll('"','""')+'"':s};return [cols.join(','),...events.map(e=>cols.map(c=>esc(e[c])).join(','))].join('\n')}
