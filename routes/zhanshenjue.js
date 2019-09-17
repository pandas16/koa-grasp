/**
 * 斩神绝 子路由
 */
const router = require('koa-router')();
const Zhanshenjue = require('../controllers/zhanshenjue');

const routers = router
    // 获取章节
    .get('/fetchCatalog',Zhanshenjue.fetchCatalog) 
    .get('/fetchChapter',Zhanshenjue.fetchChapter) 

module.exports = routers;
