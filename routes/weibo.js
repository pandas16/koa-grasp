/**
 * 微博小说抓取
 */
const router = require('koa-router')();
const Weibo = require('../controllers/weibo');

const routers = router
    // 获取章节
    .get('/fetchCatalog',Weibo.fetchCatalog) 
    .get('/fetchChapter',Weibo.fetchChapter) 
    .get('/weiboLogin',Weibo.weiboLogin) 

module.exports = routers;
