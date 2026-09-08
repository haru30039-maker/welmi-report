// 管理画面用の処理（スタッフ管理・臨時割当・端末管理・設定）
// sessionToken は adminLogin で取得したものを毎回渡す。

function adminListStaff(sessionToken) {
  if (!requireAdminSession_(sessionToken)) return { ok: false, message: '認証が必要です。' };
  var rows = getAllStaffRows_().map(function (s) {
    return {
      id: s['社員ID'],
      name: s['氏名'],
      shiftName: s['シフト表表記'],
      category: s['区分'],
      deemedOvertime: s['みなし残業時間'],
      active: boolFromCell_(s['在籍']),
      order: s['表示順']
    };
  });
  return { ok: true, staff: rows };
}

function adminAddStaff(sessionToken, name, shiftName, category) {
  if (!requireAdminSession_(sessionToken)) return { ok: false, message: '認証が必要です。' };
  if (!name) return { ok: false, message: '氏名を入力してください。' };
  var staff = addStaff_(name, shiftName, category);
  return { ok: true, staff: { id: staff['社員ID'], name: staff['氏名'] } };
}

function adminSetStaffActive(sessionToken, staffId, active) {
  if (!requireAdminSession_(sessionToken)) return { ok: false, message: '認証が必要です。' };
  setStaffActive_(staffId, active);
  return { ok: true };
}

function adminRegenerateToken(sessionToken, staffId) {
  if (!requireAdminSession_(sessionToken)) return { ok: false, message: '認証が必要です。' };
  var token = regenerateStaffToken_(staffId);
  return { ok: true, token: token };
}

function adminGetStaffCard(sessionToken, staffId) {
  if (!requireAdminSession_(sessionToken)) return { ok: false, message: '認証が必要です。' };
  var staff = findStaffById_(staffId);
  if (!staff) return { ok: false, message: 'スタッフが見つかりません。' };
  return { ok: true, name: staff['氏名'], token: staff['QRトークン'] };
}

function adminGetAllStaffCards(sessionToken) {
  if (!requireAdminSession_(sessionToken)) return { ok: false, message: '認証が必要です。' };
  var rows = getActiveStaffRows_().map(function (s) {
    return { id: s['社員ID'], name: s['氏名'], token: s['QRトークン'] };
  });
  return { ok: true, cards: rows };
}

// ---- 臨時割当 ----

function adminListTempAssignments(sessionToken) {
  if (!requireAdminSession_(sessionToken)) return { ok: false, message: '認証が必要です。' };
  var today = todayStr_();
  var rows = readRowsAsObjects_(getSheet_(SHEET_TEMP)).map(function (r) {
    var dateStr = cellToDateStr_(r['対象日']);
    return {
      cardId: r['予備カードID'],
      name: r['氏名'],
      date: dateStr,
      isToday: dateStr === today
    };
  });
  return { ok: true, assignments: rows };
}

function adminSetTempAssignment(sessionToken, cardId, name, dateStr) {
  if (!requireAdminSession_(sessionToken)) return { ok: false, message: '認証が必要です。' };
  var sheet = getSheet_(SHEET_TEMP);
  var rows = readRowsAsObjects_(sheet);
  for (var i = 0; i < rows.length; i++) {
    if (rows[i]['予備カードID'] === cardId) {
      sheet.getRange(rows[i]._row, 3).setValue(name || '');
      sheet.getRange(rows[i]._row, 4).setValue(dateStr || '');
      return { ok: true };
    }
  }
  return { ok: false, message: '予備カードが見つかりません。' };
}

// ---- 設定 ----

function adminGetSettings(sessionToken) {
  if (!requireAdminSession_(sessionToken)) return { ok: false, message: '認証が必要です。' };
  return {
    ok: true,
    nameButtonEnabled: String(getSetting_(SETTING_NAME_BUTTON_ENABLED)).toUpperCase() === 'TRUE',
    duplicateGuardMinutes: Number(getSetting_(SETTING_DUPLICATE_GUARD_MINUTES)) || 5,
    notifyEmail: getSetting_(SETTING_NOTIFY_EMAIL) || ''
  };
}

function adminUpdateNameButtonSetting(sessionToken, enabled) {
  if (!requireAdminSession_(sessionToken)) return { ok: false, message: '認証が必要です。' };
  setSetting_(SETTING_NAME_BUTTON_ENABLED, enabled ? 'TRUE' : 'FALSE');
  return { ok: true };
}
