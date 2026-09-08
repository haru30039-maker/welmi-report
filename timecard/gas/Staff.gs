// スタッフ名簿の読み書き

function getAllStaffRows_() {
  return readRowsAsObjects_(getSheet_(SHEET_STAFF));
}

function getActiveStaffRows_() {
  return getAllStaffRows_()
    .filter(function (s) { return boolFromCell_(s['在籍']); })
    .sort(function (a, b) { return (Number(a['表示順']) || 0) - (Number(b['表示順']) || 0); });
}

function findStaffByToken_(token) {
  var rows = getAllStaffRows_();
  for (var i = 0; i < rows.length; i++) {
    if (rows[i]['QRトークン'] === token && boolFromCell_(rows[i]['在籍'])) {
      return rows[i];
    }
  }
  return null;
}

function findStaffById_(id) {
  var rows = getAllStaffRows_();
  for (var i = 0; i < rows.length; i++) {
    if (rows[i]['社員ID'] === id) return rows[i];
  }
  return null;
}

function nextStaffId_() {
  var rows = getAllStaffRows_();
  var max = 0;
  rows.forEach(function (r) {
    var m = /^S(\d+)$/.exec(r['社員ID']);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  });
  return 'S' + ('000' + (max + 1)).slice(-3);
}

function addStaff_(name, shiftName, category) {
  var sheet = getSheet_(SHEET_STAFF);
  var rows = getAllStaffRows_();
  var id = nextStaffId_();
  var order = rows.length + 1;
  var deemed = category === '社員' ? 40 : 0;
  sheet.appendRow([id, name, shiftName || '', category || 'パート', newQrToken_(), deemed, true, order, formatDateTime_(nowDate_()), '']);
  return findStaffById_(id);
}

function setStaffActive_(id, active) {
  var sheet = getSheet_(SHEET_STAFF);
  var row = findStaffById_(id);
  if (!row) throw new Error('スタッフが見つかりません: ' + id);
  sheet.getRange(row._row, 7).setValue(!!active); // 在籍 列
}

function regenerateStaffToken_(id) {
  var sheet = getSheet_(SHEET_STAFF);
  var row = findStaffById_(id);
  if (!row) throw new Error('スタッフが見つかりません: ' + id);
  var newToken = newQrToken_();
  sheet.getRange(row._row, 5).setValue(newToken); // QRトークン 列
  return newToken;
}
