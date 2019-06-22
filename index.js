

// const Router = require('koa-router');
// const cheerio = require('cheerio');
// const superagent = require('superagent-charset');
// const router = new Router();
// const superagent = require('superagent');

const Koa = require('koa2');
const app = new Koa();

var router = require('./routes/index');

router.get('/', function (ctx, next) {
    ctx.body = '路由搭建好啦';
});

app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(3000, () => {
    // 注册全局未捕获异常处理器
    process.on('uncaughtException', (err) => {
      console.error('Caught exception:', err.stack);
    });
    process.on('unhandledRejection', (reason, p) => {
      console.error('Unhandled Rejection at: Promise ', p, ' reason: ', reason.stack);
    });
    console.log('[服务已开启,访问地址为：] http://127.0.0.1:3000/');
});