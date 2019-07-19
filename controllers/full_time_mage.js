/**
 * 《全职法师》函数
 */
'use strict';

const cheerio = require('cheerio');
const superagent = require('superagent');
require('superagent-charset')(superagent); // install charset
const utils = require('../utils/utils');

exports.fetchCatalog = async (ctx,next) => {
    const query = ctx.request.query;
    let start = query&&query.start || '第2865章 魔墟白蛛帝王';
    let superagentRes = null;
    let urls = [];
    let fileName = `全职法师.txt`;

    try {
        let catalogUrl = `https://www.booktxt.net/0_595/`;
        superagentRes = await superagent.get(`${catalogUrl}`).buffer(true).charset('gbk');
        let html = superagentRes&&superagentRes.text;
        let $ = await cheerio.load(html, {decodeEntities: false}); //用cheerio解析页面数据
    
        $($('dd:nth-of-type(n+10) a').toArray().reverse()).each((index, element) => {
            let $text = $(element).text();
            let $url = $(element).attr('href');
            urls.unshift($url);
            if ($text == start) {
                return false;
            }
        });

        console.log('获取数组完成:',JSON.stringify(urls),'数组长度:',urls.length);
        if (!utils.isDataValid(urls) || urls.length < 1) {
            ctx.body = {errInfo: '抓取章节失败！'};
        }

        // Promise.all(urls&&urls.map(async (item)=>{
        //     return this.fetchChapter(`${item}`);
        // })).then((res)=>{
        //     utils.writeFile(fileName,res);
        //     ctx.body = {
        //         tip: `抓取成功！`,
        //         count: urls.length,
        //     }
        // }).catch((err)=>{
        //     ctx.body = {
        //         errTip: `抓取失败`,
        //         errMsg: err,
        //     }
        // });
        for (let index = 0; index < urls.length; index++) {
            try {
                await utils.delay(250);
                let resStr = await this.fetchChapter(`${urls[index]}`);
                if (resStr&&resStr.length>0) {
                    await utils.writeFile(fileName,resStr);
                }else {
                    ctx.body = {
                        errInfo2: `${url}抓取失败`,
                    }
                }
            } catch (error) {
                ctx.body = {
                    errInfo3: error,
                }
            }
        }
    } catch (error) {
        ctx.body = {
            errInfo: error,
        }
    }
}

/** 抓取每一章 */
exports.fetchChapter = async (chapterUrl) => {
    return new Promise(async (resolve, reject) => {
        let url = `https://www.booktxt.net/0_595/${chapterUrl}`;
        let str = '';
        superagent.get(`${url}`).buffer(true).charset('gbk').then((res) => {
            console.log('===url===',url);
            let html = res&&res.text;
            let $ = cheerio.load(html, {decodeEntities: false}); //用cheerio解析页面数据
            let header = $('h1').text();
            str += (header + '\r\n\n');
            $('div#content').contents().each((index, element) => {
                let $text = $(element).text();
                if ($text.trim() && $text.trim().length > 0) { //不需要空行
                    str += ($text + '\r\n\n');
                }
            });
            resolve&&resolve(str);
        }).catch((err)=>{
            reject&&reject(err)
        });
    });
}