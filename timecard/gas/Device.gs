// 端末バインドと管理者パスワード・管理画面セッション

var ADMIN_SESSION_PREFIX = 'admin_session_';
var ADMIN_SESSION_TTL_SECONDS = 1800; // 30分

function isAdminPasswordSet() {
  var hash = getSetting_(SETTING_ADMIN_PASSWORD_HASH);
  return !!hash;
}

function setInitialAdminPassword(password) {
  if (isAdminPasswordSet()) {
    return { ok: false, message: 'すでにパスワードは設定されています。' };
  }
  if (!password || password.length < 4) {
    return { ok: false, message: 'パスワードは4文字以上にしてください。' };
  }
  setSetting_(SETTING_ADMIN_PASSWORD_HASH, sha256Hex_(password));
  return { ok: true };
}

function verifyAdminPassword_(password) {
  var hash = getSetting_(SETTING_ADMIN_PASSWORD_HASH);
  if (!hash) return false;
  return sha256Hex_(password || '') === hash;
}

function adminLogin(password) {
  if (!verifyAdminPassword_(password)) {
    return { ok: false, message: 'パスワードが違います。' };
  }
  var token = newUuid_();
  CacheService.getScriptCache().put(ADMIN_SESSION_PREFIX + token, 'valid', ADMIN_SESSION_TTL_SECONDS);
  return { ok: true, sessionToken: token };
}

function requireAdminSession_(sessionToken) {
  if (!sessionToken) return false;
  var v = CacheService.getScriptCache().get(ADMIN_SESSION_PREFIX + sessionToken);
  return v === 'valid';
}

// ---- 端末 ----

function registerDevice(password, deviceName) {
  if (!verifyAdminPassword_(password)) {
    return { ok: false, message: 'パスワードが違います。' };
  }
  var sheet = getSheet_(SHEET_DEVICE);
  var id = newUuid_();
  var token = newDeviceToken_();
  var now = formatDateTime_(nowDate_());
  sheet.appendRow([id, deviceName || 'iPad', token, now, now, true]);
  return { ok: true, deviceId: id, deviceToken: token };
}

function findDeviceByToken_(token) {
  if (!token) return null;
  var rows = readRowsAsObjects_(getSheet_(SHEET_DEVICE));
  for (var i = 0; i < rows.length; i++) {
    if (rows[i]['端末トークン'] === token) return rows[i];
  }
  return null;
}

// 打刻の可否を決める唯一の関門。ここを通らないリクエストは以降の処理を一切行わない。
function isDeviceValid_(token) {
  if (!token) return false;
  var device = findDeviceByToken_(token);
  if (!device || !boolFromCell_(device['有効'])) return false;
  var sheet = getSheet_(SHEET_DEVICE);
  sheet.getRange(device._row, 5).setValue(formatDateTime_(nowDate_())); // 最終利用日時
  return true;
}

function adminListDevices(sessionToken) {
  if (!requireAdminSession_(sessionToken)) return { ok: false, message: '認証が必要です。' };
  var rows = readRowsAsObjects_(getSheet_(SHEET_DEVICE)).map(function (r) {
    return {
      id: r['端末ID'],
      name: r['端末名'],
      registeredAt: r['登録日時'],
      lastUsedAt: r['最終利用日時'],
      active: boolFromCell_(r['有効'])
    };
  });
  return { ok: true, devices: rows };
}

function adminRevokeDevice(sessionToken, deviceId) {
  if (!requireAdminSession_(sessionToken)) return { ok: false, message: '認証が必要です。' };
  var sheet = getSheet_(SHEET_DEVICE);
  var rows = readRowsAsObjects_(sheet);
  for (var i = 0; i < rows.length; i++) {
    if (rows[i]['端末ID'] === deviceId) {
      sheet.getRange(rows[i]._row, 6).setValue(false);
      return { ok: true };
    }
  }
  return { ok: false, message: '端末が見つかりません。' };
}
