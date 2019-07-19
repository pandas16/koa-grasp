/**
 * 总路由
 */
'use strict';

const router = require('koa-router')();
const LongZu = require('./longzu');
const Fashi = require('./full_time_mage');

router.use('/longzu', LongZu.routes(), LongZu.allowedMethods());
router.use('/fashi', Fashi.routes(), Fashi.allowedMethods());

module.exports = router;