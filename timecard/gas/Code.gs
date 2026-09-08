// エントリポイント（doGet ルーティング・HTML部品の include）

function doGet(e) {
  var page = (e && e.parameter && e.parameter.page) || 'punch';
  var template;
  var title;
  if (page === 'device') {
    template = HtmlService.createTemplateFromFile('device');
    title = '端末登録 - 温井ダムリゾート勤怠';
  } else if (page === 'admin') {
    template = HtmlService.createTemplateFromFile('admin');
    title = '管理画面 - 温井ダムリゾート勤怠';
  } else {
    template = HtmlService.createTemplateFromFile('punch');
    title = '温井ダムリゾート 勤怠';
  }
  return template.evaluate()
    .setTitle(title)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
