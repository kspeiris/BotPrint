/** BotPrint shared research event collector. Use only for consented/authorized studies. */
const SHEET_NAME = 'Events';
const HEADERS = ['SessionID','UserType','BotType','SessionSource','BotID','CoordinationGroupID','EventType','Timestamp','ElapsedMs','IdleMs','Page','X','Y','DX','DY','Speed','Acceleration','ClickIntervalMs','ClickCount','ScrollDelta','ScrollSpeed','ScrollCount','InterKeyIntervalMs','TypingCount','KeyCategory','FieldType','NavigationCount','SessionDurationMs','TotalMouseSamples','TotalClicks','TotalScrolls','TotalTypingEvents','TotalNavigations','Value','Detail'];
function doPost(e) {
  try {
    const payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const sheet = getSheet_();
    const row = [payload.sessionId,payload.userType,payload.botType,payload.sessionSource,payload.botId,payload.coordinationGroupId,payload.eventType,payload.timestamp,payload.elapsedMs,payload.idleMs,payload.page,payload.x,payload.y,payload.dx,payload.dy,payload.speed,payload.acceleration,payload.clickIntervalMs,payload.clickCount,payload.scrollDelta,payload.scrollSpeed,payload.scrollCount,payload.interKeyIntervalMs,payload.typingCount,payload.keyCategory,payload.fieldType,payload.navigationCount,payload.sessionDurationMs,payload.totalMouseSamples,payload.totalClicks,payload.totalScrolls,payload.totalTypingEvents,payload.totalNavigations,payload.value,payload.detail].map(v => v === undefined || v === null ? '' : safe_(v));
    sheet.appendRow(row);
    return ContentService.createTextOutput(JSON.stringify({ok:true})).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ok:false,error:String(err)})).setMimeType(ContentService.MimeType.JSON);
  }
}
function doGet() { return ContentService.createTextOutput(JSON.stringify({service:'BotPrint collector',status:'ready',headers:HEADERS})).setMimeType(ContentService.MimeType.JSON); }
function getSheet_() {
  const ss=SpreadsheetApp.getActiveSpreadsheet(); let sheet=ss.getSheetByName(SHEET_NAME);
  if(!sheet) sheet=ss.insertSheet(SHEET_NAME);
  if(sheet.getLastRow()===0){sheet.appendRow(HEADERS);sheet.setFrozenRows(1);}
  return sheet;
}
function safe_(value) { return String(value).replace(/[\r\n]/g,' ').slice(0,500); }
