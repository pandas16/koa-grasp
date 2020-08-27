/**
 * 《斩神绝》函数
 */
'use strict';

const cheerio = require('cheerio');
const superagent = require('superagent');
require('superagent-charset')(superagent); // install charset
const utils = require('../utils/utils');

//https://www.bestrenyan.com/best/11625.html
//https://www.gebiqu.com/biquge_42368
const catalogUrl = 'https://www.999xs.com/files/article/html/126/126891/'; 

exports.fetchCatalog = async (ctx,next) => {
    const query = ctx.request.query;
    let start = query&&query.start || '1、穿书';
    let superagentRes = null;
    let urls = [];
    let fileName = `200826_001.txt`;

    try {
        superagentRes = await superagent.get(`${catalogUrl}`).buffer(true)//.charset('gbk');
        let html = superagentRes&&superagentRes.text;
        let $ = await cheerio.load(html, {decodeEntities: false}); //用cheerio解析页面数据
    
        $($('dd a').toArray().reverse()).each((index, element) => {
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
        let url = `https://www.999xs.com/${chapterUrl}`;
        let str = '';
        superagent.get(`${url}`).buffer(true).then((res) => {
            console.log('===url===',url);
            let html = res&&res.text;
            let $ = cheerio.load(html, {decodeEntities: false}); //用cheerio解析页面数据
            let header = $('h1').text();
            str += (header + '\r\n\n');
            $('div#content').contents().each((index, element) => {
                let $text = $(element).text();
                // if ($text.indexOf('PS：')!=-1||$text.indexOf('PS:')!=-1||$text.indexOf('999小说')!=-1||$text.indexOf('www')!=-1) {
                //     return false;
                // }
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