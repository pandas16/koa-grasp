/**
 * 总路由
 */
'use strict';

const router = require('koa-router')();
const LongZu = require('./longzu');
const Fashi = require('./full_time_mage');
const Zhanshenjue = require('./zhanshenjue');
const Weibo = require('./weibo');

router.use('/longzu', LongZu.routes(), LongZu.allowedMethods());
router.use('/fashi', Fashi.routes(), Fashi.allowedMethods());
router.use('/weibo', Weibo.routes(), Weibo.allowedMethods());
router.use('/zhanshenjue', Zhanshenjue.routes(), Zhanshenjue.allowedMethods());

module.exports = router;