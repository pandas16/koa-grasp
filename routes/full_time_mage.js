/**
 * 全职法师 子路由
 */
const router = require('koa-router')();
const Fashi = require('../controllers/full_time_mage');

const routers = router
    // 获取章节
    .get('/start',Fashi.fetchCatalog) 
    .get('/fetchChapter',Fashi.fetchChapter) 

module.exports = routers;
