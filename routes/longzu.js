/**
 * cloud 子路由
 */
const router = require('koa-router')();
const LongZu = require('../controllers/longzu');

const routers = router
    // 获取章节
    // .get('/fetchChapter',LongZu.fetchChapter) 
    // .get('/textLocalTxt',LongZu.textLocalTxt) 
    .get('/fetchNovel',LongZu.fetchNovel) 
    .get('/fetchCatalog',LongZu.fetchCatalog) 

module.exports = routers;
