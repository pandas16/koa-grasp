/**
 * 总路由
 */
'use strict';

const router = require('koa-router')();
const LongZu = require('./longzu');

router.use('/longzu', LongZu.routes(), LongZu.allowedMethods());

module.exports = router;