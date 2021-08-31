/**
 * 全职法师 子路由
 */
 const router = require('koa-router')();
 const Grap = require('../controllers/grap');
 
 const routers = router
    .get('/fetchCatalog',Grap.fetchCatalog) 
    .post('/fetchCatalog',Grap.fetchCatalog) //获取章节
    .post('/doDownload',Grap.doDownload) //下载
 
 module.exports = routers;
 