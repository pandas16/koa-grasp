/**
 * 《全职法师》函数
 */
'use strict';

const cheerio = require('cheerio');
const superagent = require('superagent');
require('superagent-charset')(superagent); // install charset
const utils = require('../utils/utils');

// 斩决 https://www.11kt.cn/read/131820/index.html
// 我师兄实在太稳健了 https://www.booktxt.net/18_18099/
// 圣墟 https://www.booktxt.net/2_2219/
// 诡秘 https://www.booktxt.net/5_5552/
// 烂柯棋缘 https://www.booktxt.net/16_16202/

const Params = {
    catalogUrl: `https://www.booktxt.net/18_18099/`,
    startName: `第六百三十章 灵珠子转世的主要原因555`,
    endName: ``,
    fileName: `师兄_620-630.txt`
}

exports.fetchCatalog = async (ctx,next) => {
    let superagentRes = null;
    let urls = [];
    let isHasEndFlag = Params.endName&&Params.endName.length>0;
    let initIndex = -1;
    let isLoading = false;

    if (isLoading) {
        ctx.body = {
            errInfo: '正在进行中……',
        }
    }
    try {
        isLoading=true;
        superagentRes = await superagent.get(`${Params.catalogUrl}`).buffer(true).charset('gbk');
        let html = superagentRes&&superagentRes.text;
        let $ = await cheerio.load(html, {decodeEntities: false}); //用cheerio解析页面数据
    
        $($('dd:nth-of-type(n+7) a').toArray().reverse()).each((index, element) => {
            let $text = $(element).text();
            let $url = $(element).attr('href');
            if (isHasEndFlag&&($text==Params.endName)) {
                initIndex = index;
            }
            if (((isHasEndFlag&&initIndex>-1)||!isHasEndFlag)&&/第.*章.*/.test($text)) {
                urls.unshift($url);
            }
            if ($text == Params.startName) {
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
                await utils.delay(100);
                let resStr = await this.fetchChapter(`${urls[index]}`);
                if (resStr&&resStr.length>0) {
                    await utils.writeFile(Params.fileName,resStr);
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
        isLoading = false;
    } catch (error) {
        isLoading = false;
        ctx.body = {
            errInfo: error,
        }
    }
}

/** 抓取每一章 */
exports.fetchChapter = async (chapterUrl) => {
    return new Promise(async (resolve, reject) => {
        let url = `${Params.catalogUrl}${chapterUrl}`;
        let str = '';
        superagent.get(`${url}`).buffer(true).charset('gbk').then((res) => {
            let html = res&&res.text;
            let $ = cheerio.load(html, {decodeEntities: false}); //用cheerio解析页面数据
            let header = $('h1').text().trim();
            header = header.replace(/（.*?）/,'');
            header = header.replace(/【.*?】/,''); 
            str += ('\r\n' + header + '\r\n');
            $('div#content').contents().each((index, element) => {
                let $text = $(element).text().trim();
                if ($text.indexOf('PS：')!=-1||$text.indexOf('PS:')!=-1||$text.indexOf('booktxt')!=-1) {
                    return false;
                }
                if ($text&&$text.length > 0) { //不需要空行
                    str += (`    ` + $text + '\r\n');
                }
            });
            console.log('===抓取结束===',header);
            resolve&&resolve(str);
        }).catch((err)=>{
            reject&&reject(err)
        });
    });
}