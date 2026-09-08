// 共通処理: シート操作・日時・ハッシュ・トークン生成

var TIMEZONE = 'Asia/Tokyo';

var SHEET_STAFF = 'スタッフ';
var SHEET_LOG = '打刻ログ';
var SHEET_DEVICE = '端末';
var SHEET_TEMP = '臨時割当';
var SHEET_SETTINGS = '設定';

var SETTING_ADMIN_PASSWORD_HASH = '管理者パスワードハッシュ';
var SETTING_NOTIFY_EMAIL = '通知先メール';
var SETTING_NAME_BUTTON_ENABLED = '名前ボタン方式を有効にする';
var SETTING_DUPLICATE_GUARD_MINUTES = '重複打刻の抑止分数';

function getSpreadsheet_() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getSheet_(name) {
  var ss = getSpreadsheet_();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

// 列番号(1始まり)を A1 表記の列文字に変換する。この用途では10列以内なので A〜Z の範囲で足りる。
function columnLetter_(index) {
  return String.fromCharCode(64 + index);
}

// 日付・日時の列は、Sheets が文字列を自動で日付シリアル値に変換してしまうと
// 文字列比較（前方一致・辞書順比較）が壊れる。列全体をあらかじめ「書式なしテキスト」に
// しておくことで、appendRow で書き込む文字列が常にそのまま保存されるようにする。
function forcePlainTextColumn_(sheet, colIndex) {
  var letter = columnLetter_(colIndex);
  sheet.getRange(letter + ':' + letter).setNumberFormat('@');
}

function nowDate_() {
  return new Date();
}

function formatDateTime_(date) {
  return Utilities.formatDate(date, TIMEZONE, 'yyyy-MM-dd HH:mm:ss');
}

function formatDateOnly_(date) {
  return Utilities.formatDate(date, TIMEZONE, 'yyyy-MM-dd');
}

function formatTimeOnly_(date) {
  return Utilities.formatDate(date, TIMEZONE, 'H:mm');
}

function todayStr_() {
  return formatDateOnly_(nowDate_());
}

// 'yyyy-MM-dd HH:mm:ss' 形式の文字列を、スクリプトのタイムゾーンで解釈した Date に戻す。
// new Date(string) は実行環境依存の解釈になるため使わない。
function parseDateTime_(str) {
  return Utilities.parseDate(str, TIMEZONE, 'yyyy-MM-dd HH:mm:ss');
}

function newUuid_() {
  return Utilities.getUuid();
}

// wnm_ + 32桁hex（QRトークン用）。連番や氏名から導出しない。
function newQrToken_() {
  return 'wnm_' + randomHex_(32);
}

// 64桁hex（端末トークン用）
function newDeviceToken_() {
  return randomHex_(64);
}

function randomHex_(length) {
  var out = '';
  while (out.length < length) {
    out += Utilities.getUuid().replace(/-/g, '');
  }
  return out.substring(0, length);
}

function sha256Hex_(text) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text, Utilities.Charset.UTF_8);
  return bytes.map(function (b) {
    var v = (b < 0 ? b + 256 : b).toString(16);
    return v.length === 1 ? '0' + v : v;
  }).join('');
}

function getSetting_(key) {
  var sheet = getSheet_(SHEET_SETTINGS);
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === key) {
      return data[i][1];
    }
  }
  return null;
}

function setSetting_(key, value) {
  var sheet = getSheet_(SHEET_SETTINGS);
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === key) {
      sheet.getRange(i + 1, 2).setValue(value);
      return;
    }
  }
  sheet.appendRow([key, value]);
}

// シートの全データを、ヘッダー行をキーにしたオブジェクト配列にして返す。
// 各要素の _row に 1始まりの実シート行番号を入れておく（更新時に使う）。
function readRowsAsObjects_(sheet) {
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  var headers = values[0];
  var rows = [];
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    if (row.join('') === '') continue;
    var obj = { _row: i + 1 };
    for (var c = 0; c < headers.length; c++) {
      obj[headers[c]] = row[c];
    }
    rows.push(obj);
  }
  return rows;
}

// TRUE/FALSE のセルは、実際のブール値でも "TRUE" 等の文字列でも受け付ける。
function boolFromCell_(v) {
  if (typeof v === 'boolean') return v;
  return String(v).trim().toUpperCase() === 'TRUE';
}

// 対象日など、文字列のはずのセルが万一 Date として返ってきた場合の保険。
function cellToDateStr_(v) {
  if (!v) return '';
  if (Object.prototype.toString.call(v) === '[object Date]') {
    return formatDateOnly_(v);
  }
  return String(v).trim();
}
