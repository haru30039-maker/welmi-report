// 初期セットアップ: シート自動生成・名簿投入
// Apps Script エディタでこの関数を選んで実行する（timecard/SETUP.md 手順4）。
// 既にデータが入っている場合は壊さない（何度実行しても安全）。

function initSpreadsheet() {
  ensureStaffSheet_();
  ensureLogSheet_();
  ensureDeviceSheet_();
  ensureTempSheet_();
  ensureSettingsSheet_();
  seedInitialStaff_();
  Logger.log('セットアップが完了しました。スタッフシートを確認してください。');
}

function ensureHeaders_(sheet, headers) {
  var existing = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  var needsHeader = headers.some(function (h, i) { return existing[i] !== h; });
  if (needsHeader) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }
}

function ensureStaffSheet_() {
  var sheet = getSheet_(SHEET_STAFF);
  ensureHeaders_(sheet, ['社員ID', '氏名', 'シフト表表記', '区分', 'QRトークン', 'みなし残業時間', '在籍', '表示順', '登録日時', '備考']);
  forcePlainTextColumn_(sheet, 9); // 登録日時
}

function ensureLogSheet_() {
  var sheet = getSheet_(SHEET_LOG);
  ensureHeaders_(sheet, ['ログID', '打刻日時', '営業日', '社員ID', '氏名', '種別', '端末ID', '入力方法', '備考']);
  forcePlainTextColumn_(sheet, 2); // 打刻日時
  forcePlainTextColumn_(sheet, 3); // 営業日
}

function ensureDeviceSheet_() {
  var sheet = getSheet_(SHEET_DEVICE);
  ensureHeaders_(sheet, ['端末ID', '端末名', '端末トークン', '登録日時', '最終利用日時', '有効']);
  forcePlainTextColumn_(sheet, 4); // 登録日時
  forcePlainTextColumn_(sheet, 5); // 最終利用日時
}

function ensureTempSheet_() {
  var sheet = getSheet_(SHEET_TEMP);
  ensureHeaders_(sheet, ['予備カードID', 'QRトークン', '氏名', '対象日', '登録日時']);
  forcePlainTextColumn_(sheet, 4); // 対象日
  forcePlainTextColumn_(sheet, 5); // 登録日時

  // 予備カード 臨時1〜5 の QR トークンを最初に払い出しておく（初回のみ）
  var rows = readRowsAsObjects_(sheet);
  var existingIds = rows.map(function (r) { return r['予備カードID']; });
  for (var i = 1; i <= 5; i++) {
    var id = '臨時' + i;
    if (existingIds.indexOf(id) === -1) {
      sheet.appendRow([id, newQrToken_(), '', '', formatDateTime_(nowDate_())]);
    }
  }
}

function ensureSettingsSheet_() {
  var sheet = getSheet_(SHEET_SETTINGS);
  ensureHeaders_(sheet, ['キー', '値']);
  var defaults = [
    [SETTING_ADMIN_PASSWORD_HASH, ''],
    [SETTING_NOTIFY_EMAIL, ''],
    [SETTING_NAME_BUTTON_ENABLED, 'FALSE'],
    [SETTING_DUPLICATE_GUARD_MINUTES, '5']
  ];
  var existingKeys = readRowsAsObjects_(sheet).map(function (r) { return r['キー']; });
  defaults.forEach(function (pair) {
    if (existingKeys.indexOf(pair[0]) === -1) {
      sheet.appendRow(pair);
    }
  });
}

// DESIGN.md 1.5 のスタッフ名簿（12名）。既に1件でも登録があれば何もしない。
function seedInitialStaff_() {
  var sheet = getSheet_(SHEET_STAFF);
  var rows = readRowsAsObjects_(sheet);
  if (rows.length > 0) {
    Logger.log('スタッフは既に登録されています。初期投入をスキップします。');
    return;
  }
  var staffList = [
    ['橋本　潤一郎', '橋本', '社員', 40],
    ['三滝　啓人', '三瀧', '社員', 40],
    ['三村　諒', '三村', '社員', 40],
    ['沖田　勝克', '沖田', '社員', 40],
    ['栗栖　恵美子', 'えみこ', 'パート', 0],
    ['丸﨑　豊徳', '丸崎', 'パート', 0],
    ['月待　民江', '月待', 'パート', 0],
    ['森脇　穂乃実', '森脇', 'パート', 0],
    ['冨樫　慶子', '冨樫', 'パート', 0],
    ['隈元　和美', '隈元', 'パート', 0],
    ['佐々木　佑夏', 'ゆかちゃん', 'パート', 0],
    ['司迫　光', 'ひかる', 'パート', 0]
  ];
  var now = formatDateTime_(nowDate_());
  staffList.forEach(function (s, index) {
    var id = 'S' + ('000' + (index + 1)).slice(-3);
    sheet.appendRow([id, s[0], s[1], s[2], newQrToken_(), s[3], true, index + 1, now, '']);
  });
}
