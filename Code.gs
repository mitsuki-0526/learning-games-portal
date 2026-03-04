// ==========================================
// リンク集ポータル用 GAS API (Code.gs)
// ==========================================

const SHEET_NAME = 'Games'; // データを保存するシート名
const METADATA_SHEET = 'Metadata'; // バージョン管理用シート

// --------------------------------------------------------------------------------
// GETリクエスト処理 (データの読み出し)
// index.htmlからのアクセス、またはadmin.htmlからの初期データ取得用
// --------------------------------------------------------------------------------
function doGet(e) {
  const sheet = getSheet();
  const data = readSheetData(sheet);
  const version = getVersion();
  
  const result = {
    version: version,
    games: data
  };

  // JSONP または 通常のJSON で返す
  const output = ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
    
  return output;
}

// --------------------------------------------------------------------------------
// バージョン取得ヘルパー
// --------------------------------------------------------------------------------
function getVersion() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let metaSheet = ss.getSheetByName(METADATA_SHEET);
  if (!metaSheet) {
    metaSheet = ss.insertSheet(METADATA_SHEET);
    metaSheet.getRange(1, 1, 1, 2).setValues([['key', 'value']]);
    metaSheet.getRange(2, 1, 1, 2).setValues([['version', 1]]);
    return 1;
  }
  const data = metaSheet.getRange(2, 1, 1, 2).getValues();
  return data[0][1] || 1;
}

function incrementVersion() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let metaSheet = ss.getSheetByName(METADATA_SHEET);
  if (!metaSheet) {
    getVersion(); // シート作成
    return;
  }
  const currentVersion = getVersion();
  metaSheet.getRange(2, 2).setValue(currentVersion + 1);
}

// --------------------------------------------------------------------------------
// POSTリクエスト処理 (データの保存・更新)
// admin.html からのアクセス用
// --------------------------------------------------------------------------------
function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const sheet = getSheet();
    
    // データをシートに書き込む
    writeSheetData(sheet, postData);
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'データを保存しました' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// --------------------------------------------------------------------------------
// シート取得ヘルパー
// --------------------------------------------------------------------------------
function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  // シートが存在しなければ作成し、ヘッダー行をセット
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    const headers = ['id', 'category', 'grade', 'title', 'description', 'url', 'adminUrl', 'isVisible', 'isNew', 'patchNotes'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  } else {
    // 既存シートの場合、必要な列があるか確認し、無ければ一番右に追加
    const lastCol = sheet.getLastColumn();
    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    const requiredHeaders = ['adminUrl', 'patchNotes'];
    
    requiredHeaders.forEach(h => {
      if (!headers.includes(h)) {
        sheet.getRange(1, sheet.getLastColumn() + 1).setValue(h).setFontWeight('bold');
      }
    });
  }
  
  // Metadataシートの存在も保証
  getVersion(); 
  
  return sheet;
}

// --------------------------------------------------------------------------------
// データの読み出し (JSON配列に変換)
// --------------------------------------------------------------------------------
function readSheetData(sheet) {
  const lastRow = sheet.getLastRow();
  // ヘッダーのみ、または空の場合は空配列を返す
  if (lastRow <= 1) return [];
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const dataRange = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn());
  const rows = dataRange.getValues();
  
  const result = rows.map(row => {
    let obj = {};
    headers.forEach((header, index) => {
      // boolean型のカラム文字列をパースする
      let val = row[index];
      if (header === 'isVisible' || header === 'isNew') {
        val = (val === true || val === 'true' || val === 'TRUE');
      }
      obj[header] = val;
    });
    return obj;
  });
  
  return result;
}

// --------------------------------------------------------------------------------
// データの書き込み (全上書き)
// --------------------------------------------------------------------------------
function writeSheetData(sheet, dataArray) {
  // 既存データ（2行目以降）をクリア
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, lastCol).clearContent();
  }
  
  if (!dataArray || dataArray.length === 0) return;
  
  // ヘッダーを取得して、書き込むデータの順序を合わせる
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const outputValues = [];
  
  dataArray.forEach(dataObj => {
    let rowValues = [];
    headers.forEach(header => {
      rowValues.push(dataObj[header] !== undefined ? dataObj[header] : '');
    });
    outputValues.push(rowValues);
  });
  
// まとめて書き込み
  sheet.getRange(2, 1, outputValues.length, headers.length).setValues(outputValues);

  // 保存時にバージョンを上げる
  incrementVersion();
}

// --------------------------------------------------------------------------------
// (1回だけ実行) 既存データの流し込み
// --------------------------------------------------------------------------------
function initData() {
  const data = [
    { id: 'game_1', category: 'all-subjects', grade: '全学年・全教科', title: '🚀 Baboot!', description: '黒板のPINを入力してクイズに参加しよう！スマホ・タブレット対応の早押し対戦アプリ。', url: 'https://mitsuki-0526.github.io/baboot/', adminUrl: 'https://mitsuki-0526.github.io/baboot/teacher.html', isVisible: true, isNew: false, patchNotes: '・学校回線突破用の専用サーバー構築に対応\n・UIの調整を行いました' },
    { id: 'game_2', category: 'math', grade: '全学年', title: '⚔️ 数学RPGクエスト', description: '勇者になって問題を解き、魔王を倒そう！セーブ機能付きの本格RPG。', url: '', adminUrl: '', isVisible: true, isNew: false, patchNotes: '' },
    { id: 'game_3', category: 'math', grade: '全学年・対戦', title: '🏆 数学グランドバトル', description: '最強の計算王は誰だ！？クラスのみんなと協力して巨大ボスを討伐しよう。', url: 'https://script.google.com/a/macros/oskedu.jp/s/AKfycbyqULb0iCVWLS2U_BdKwX2fDJhidKrjNuhOYlmixsvqM4LGAnY8T6BVjROddp63VJmm/exec', adminUrl: 'https://script.google.com/a/macros/oskedu.jp/s/AKfycbyqULb0iCVWLS2U_BdKwX2fDJhidKrjNuhOYlmixsvqM4LGAnY8T6BVjROddp63VJmm/exec?p=teacher', isVisible: true, isNew: false, patchNotes: '' },
    { id: 'game_4', category: 'math', grade: '全学年', title: '💣 方程式ボンバー', description: 'タイムリミットが迫る！瞬時の判断が試されるスリル満点の計算ゲーム。', url: 'https://script.google.com/a/macros/oskedu.jp/s/AKfycbxMa-mB5nxrKXbwy69iF_l3wSe5-qwqkBQGjDSQdqanE2ghhIY9Kwi8ADBUt5mwBXcO/exec', adminUrl: '', isVisible: true, isNew: false, patchNotes: '' },
    { id: 'game_5', category: 'english', grade: '全学年', title: '🔠 Word Guess Game', description: '隠された英単語を推測せよ！3文字・4文字単語のマスターへの道。', url: 'https://script.google.com/a/macros/oskedu.jp/s/AKfycbxXmb5ppwM2btEiJnCF5Czavp0B8HubVf-ggsPpdPPd4ddJWDCATXZDnoWpJjTE41le/exec', adminUrl: 'https://script.google.com/a/macros/oskedu.jp/s/AKfycbxXmb5ppwM2btEiJnCF5Czavp0B8HubVf-ggsPpdPPd4ddJWDCATXZDnoWpJjTE41le/exec?page=admin', isVisible: true, isNew: false, patchNotes: '' }
  ];
  
  const sheet = getSheet();
  writeSheetData(sheet, data);
}
