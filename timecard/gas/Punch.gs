// 打刻ロジック

var TYPE_IN = '出勤';
var TYPE_OUT = '退勤';

function getWaitingScreenConfig(deviceToken) {
  var valid = isDeviceValid_(deviceToken);
  var nameButtonEnabled = String(getSetting_(SETTING_NAME_BUTTON_ENABLED)).toUpperCase() === 'TRUE';
  var staffList = [];
  if (valid && nameButtonEnabled) {
    staffList = getActiveStaffRows_().map(function (s) {
      return { id: s['社員ID'], name: s['氏名'] };
    });
  }
  return { valid: valid, nameButtonEnabled: nameButtonEnabled, staffList: staffList };
}

// QRトークンから「誰の打刻か」を特定する。臨時割当（本日分のみ）を先に見て、
// 見つからなければ通常のスタッフ名簿を見る。
function resolveIdentifierByToken_(token) {
  var today = todayStr_();
  var tempRows = readRowsAsObjects_(getSheet_(SHEET_TEMP));
  for (var i = 0; i < tempRows.length; i++) {
    var t = tempRows[i];
    if (t['QRトークン'] === token) {
      if (cellToDateStr_(t['対象日']) === today && t['氏名']) {
        return { id: t['予備カードID'], name: t['氏名'], isTemp: true };
      }
      return null; // 予備カードだが本日の割当がない
    }
  }
  var staff = findStaffByToken_(token);
  if (staff) {
    return { id: staff['社員ID'], name: staff['氏名'], isTemp: false };
  }
  return null;
}

function getTodayLogsForIdentifier_(id) {
  var today = todayStr_();
  var rows = readRowsAsObjects_(getSheet_(SHEET_LOG));
  return rows.filter(function (r) {
    return r['社員ID'] === id && cellToDateStr_(r['営業日']) === today;
  });
}

// 前日以前の、この識別子の最後の打刻を探す（退勤打刻漏れの警告に使う）
function getLastLogBeforeToday_(id) {
  var today = todayStr_();
  var rows = readRowsAsObjects_(getSheet_(SHEET_LOG));
  var prior = rows.filter(function (r) {
    return r['社員ID'] === id && cellToDateStr_(r['営業日']) < today;
  });
  if (prior.length === 0) return null;
  prior.sort(function (a, b) { return String(a['打刻日時']).localeCompare(String(b['打刻日時'])); });
  return prior[prior.length - 1];
}

function appendPunchLog_(identifier, type, deviceToken, method, note) {
  var sheet = getSheet_(SHEET_LOG);
  var now = nowDate_();
  var device = findDeviceByToken_(deviceToken);
  sheet.appendRow([
    newUuid_(),
    formatDateTime_(now),
    formatDateOnly_(now),
    identifier.id,
    identifier.name,
    type,
    device ? device['端末ID'] : '',
    method,
    note || ''
  ]);
  return now;
}

// 出退勤の自動判定・重複抑止・打刻ログ追記を行う中核処理。
// 同時打刻での不整合を避けるため、読み取りから追記までを LockService で直列化する。
function doPunchCore_(deviceToken, identifier, method) {
  if (!isDeviceValid_(deviceToken)) {
    return { ok: false, message: 'この端末では打刻できません' };
  }
  if (!identifier) {
    return { ok: false, message: 'このカードは使えません。担当者にお伝えください' };
  }

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (e) {
    return { ok: false, message: '混み合っています。もう一度お試しください' };
  }

  try {
    var todayLogs = getTodayLogsForIdentifier_(identifier.id);
    todayLogs.sort(function (a, b) { return String(a['打刻日時']).localeCompare(String(b['打刻日時'])); });
    var lastToday = todayLogs.length > 0 ? todayLogs[todayLogs.length - 1] : null;

    var guardMinutes = Number(getSetting_(SETTING_DUPLICATE_GUARD_MINUTES)) || 5;
    if (lastToday) {
      var lastTime = parseDateTime_(String(lastToday['打刻日時']));
      var diffMinutes = (nowDate_().getTime() - lastTime.getTime()) / 60000;
      if (diffMinutes < guardMinutes) {
        return {
          ok: false,
          duplicate: true,
          message: 'すでに打刻済みです（' + formatTimeOnly_(lastTime) + ' ' + lastToday['種別'] + '）'
        };
      }
    }

    // 記録なし→出勤 / 直前が出勤→退勤 / 直前が退勤→出勤（同日再出勤）
    var type = !lastToday ? TYPE_IN : (lastToday['種別'] === TYPE_IN ? TYPE_OUT : TYPE_IN);

    var warning = null;
    if (type === TYPE_IN) {
      var priorLog = getLastLogBeforeToday_(identifier.id);
      if (priorLog && priorLog['種別'] === TYPE_IN) {
        warning = '前回の退勤打刻がありません。担当者にお伝えください';
      }
    }

    var note = identifier.isTemp ? ('臨時カード:' + identifier.id) : '';
    var now = appendPunchLog_(identifier, type, deviceToken, method, note);

    return {
      ok: true,
      name: identifier.name,
      type: type,
      time: formatTimeOnly_(now),
      greeting: type === TYPE_IN ? 'おはようございます' : 'おつかれさまでした',
      warning: warning
    };
  } finally {
    lock.releaseLock();
  }
}

function punchWithQr(deviceToken, qrToken) {
  if (!isDeviceValid_(deviceToken)) {
    return { ok: false, message: 'この端末では打刻できません' };
  }
  var identifier = resolveIdentifierByToken_(qrToken);
  return doPunchCore_(deviceToken, identifier, 'QR');
}

function getStaffPunchStatus(deviceToken, staffId) {
  if (!isDeviceValid_(deviceToken)) {
    return { ok: false, message: 'この端末では打刻できません' };
  }
  var staff = findStaffById_(staffId);
  if (!staff || !boolFromCell_(staff['在籍'])) {
    return { ok: false, message: 'このスタッフは見つかりません' };
  }
  var todayLogs = getTodayLogsForIdentifier_(staffId);
  todayLogs.sort(function (a, b) { return String(a['打刻日時']).localeCompare(String(b['打刻日時'])); });
  var lastToday = todayLogs.length > 0 ? todayLogs[todayLogs.length - 1] : null;
  var next = !lastToday ? TYPE_IN : (lastToday['種別'] === TYPE_IN ? TYPE_OUT : TYPE_IN);
  return { ok: true, name: staff['氏名'], nextAction: next };
}

function punchWithStaffId(deviceToken, staffId) {
  if (!isDeviceValid_(deviceToken)) {
    return { ok: false, message: 'この端末では打刻できません' };
  }
  var staff = findStaffById_(staffId);
  if (!staff || !boolFromCell_(staff['在籍'])) {
    return { ok: false, message: 'このスタッフは見つかりません' };
  }
  var identifier = { id: staff['社員ID'], name: staff['氏名'], isTemp: false };
  return doPunchCore_(deviceToken, identifier, '名前ボタン');
}
