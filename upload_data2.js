const https = require('https');

const data = JSON.stringify([
    { id: 'game_1', title: '🚀 Baboot!', category: 'all-subjects', grade: '全学年・全教科', description: '黒板のPINを入力してクイズに参加しよう！スマホ・タブレット対応の早押し対戦アプリ。', url: 'https://mitsuki-0526.github.io/peerjstest/student.html', isVisible: true, isNew: false },
    { id: 'game_2', title: '⚔️ 数学RPGクエスト', category: 'math', grade: '全学年', description: '勇者になって問題を解き、魔王を倒そう！セーブ機能付きの本格RPG。', url: '', isVisible: true, isNew: false },
    { id: 'game_3', title: '🏆 数学グランドバトル', category: 'math', grade: '全学年・対戦', description: '最強の計算王は誰だ！？クラスのみんなと協力して巨大ボスを討伐しよう。', url: 'https://script.google.com/a/macros/oskedu.jp/s/AKfycbyqULb0iCVWLS2U_BdKwX2fDJhidKrjNuhOYlmixsvqM4LGAnY8T6BVjROddp63VJmm/exec', isVisible: true, isNew: false },
    { id: 'game_4', title: '💣 方程式ボンバー', category: 'math', grade: '全学年', description: 'タイムリミットが迫る！瞬時の判断が試されるスリル満点の計算ゲーム。', url: 'https://script.google.com/a/macros/oskedu.jp/s/AKfycbxMa-mB5nxrKXbwy69iF_l3wSe5-qwqkBQGjDSQdqanE2ghhIY9Kwi8ADBUt5mwBXcO/exec', isVisible: true, isNew: false },
    { id: 'game_5', title: '🔠 Word Guess Game', category: 'english', grade: '全学年', description: '隠された英単語を推測せよ！3文字・4文字単語のマスターへの道。', url: 'https://script.google.com/a/macros/oskedu.jp/s/AKfycbxXmb5ppwM2btEiJnCF5Czavp0B8HubVf-ggsPpdPPd4ddJWDCATXZDnoWpJjTE41le/exec', isVisible: true, isNew: false }
]);

const url = 'https://script.google.com/macros/s/AKfycbw3tGmx08u1BaIyu9PVmg8s5xxQ-xCq-6-Ohlvi-eWo13UZJoMSkxjpA5MlFg7BS-pC/exec';

function postData(urlStr) {
    const parsedUrl = new URL(urlStr);
    const options = {
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data)
        }
    };

    const req = https.request(options, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            postData(res.headers.location);
        } else {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => console.log('Response:', body));
        }
    });

    req.on('error', (e) => console.error('Error:', e));
    req.write(data);
    req.end();
}

postData(url);
