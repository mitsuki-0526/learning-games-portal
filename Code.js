function doGet() {
    return HtmlService.createTemplateFromFile('index')
        .evaluate()
        .setTitle('中学校 学習ゲームポータル')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}