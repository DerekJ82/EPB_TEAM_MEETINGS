const MEETINGS = [
  {
    id: 'june-2026',
    title: 'EPB Strategy Check 2026',
    date: 'June 2026',
    description: 'Growth story, 4 strategic pillars, team wins, and 2027 targets.',
    file: 'index'
  },
  {
    id: 'april-2026',
    title: 'April 2026 Team Meeting',
    date: 'April 2026',
    description: 'AI Innovation & 45-Minute Breakout Challenge',
    file: 'April2026'
  }
];

function doGet(e) {
  var meetingId = e && e.parameter && e.parameter.meeting;
  var file = 'index';

  if (meetingId && meetingId !== 'current') {
    for (var i = 0; i < MEETINGS.length; i++) {
      if (MEETINGS[i].id === meetingId) {
        file = MEETINGS[i].file;
        break;
      }
    }
  }

  return HtmlService.createHtmlOutputFromFile(file)
      .setTitle('EPB Team Meeting - June 2026')
      .setSandboxMode(HtmlService.SandboxMode.IFRAME)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function getMeetingsManifest() {
  return MEETINGS;
}

function getExecUrl() {
  return ScriptApp.getService().getUrl();
}

// This function receives notes from the presentation and saves them to a Google Sheet
function saveNoteToSheet(section, noteText) {
  var props = PropertiesService.getUserProperties();
  var sheetId = props.getProperty('MEETING_NOTES_SHEET_ID');
  var doc;
  var sheet;

  // If a sheet doesn't exist yet, create one automatically in your Drive
  if (!sheetId) {
    doc = SpreadsheetApp.create('S&P Leadership Team - Meeting Notes & Actions');
    sheet = doc.getActiveSheet();
    // Set up headers
    sheet.appendRow(['Timestamp', 'Agenda Section', 'Action Item / Note']);
    sheet.getRange('A1:C1').setFontWeight('bold').setBackground('#4b286d').setFontColor('white');
    sheet.setColumnWidth(1, 150);
    sheet.setColumnWidth(2, 200);
    sheet.setColumnWidth(3, 500);
    props.setProperty('MEETING_NOTES_SHEET_ID', doc.getId());
  } else {
    try {
      doc = SpreadsheetApp.openById(sheetId);
      sheet = doc.getActiveSheet();
    } catch (e) {
      // Fallback if the file was deleted manually
      doc = SpreadsheetApp.create('S&P Leadership Team - Meeting Notes & Actions');
      sheet = doc.getActiveSheet();
      sheet.appendRow(['Timestamp', 'Agenda Section', 'Action Item / Note']);
      sheet.getRange('A1:C1').setFontWeight('bold').setBackground('#4b286d').setFontColor('white');
      props.setProperty('MEETING_NOTES_SHEET_ID', doc.getId());
    }
  }

  // Append the new note with a timestamp
  sheet.appendRow([new Date(), section, noteText]);

  // Return the URL of the sheet so the user can click it from the presentation
  return doc.getUrl();
}
