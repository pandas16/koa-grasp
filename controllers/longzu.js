/**
 * 用户模块的函数
 */
'use strict';

const cheerio = require('cheerio');
const superagent = require('superagent');

//注册
exports.fetchChapter = async (ctx,next) => {
    let arr = [];
    try {
        const res = await superagent.post('http://longzu5.co/post/278.html');
        let html = res&&res.text,
            $ = cheerio.load(html, {
                decodeEntities: false
            }), //用cheerio解析页面数据
            obj = {};
        arr = [];

        //下面类似于jquery的操作，前端的小伙伴们肯定很熟悉啦
        $('div:nth-of-type(1) > p:nth-of-type(n+2)').each((index, element) => {
            var $text = $(element).text();
            arr.push($text);
        });
        ctx.body = arr;
    } catch (err) {
        console.error(err);
    }
}