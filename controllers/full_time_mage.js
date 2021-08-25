/**
 * 《全职法师》函数
 */
'use strict';

const cheerio = require('cheerio');
const charset = require('superagent-charset');
const superagent = charset(require('superagent'));

const utils = require('../utils/utils');

// 斩决 https://www.11kt.cn/read/131820/index.html
// 我师兄实在太稳健了 https://www.ddyueshu.com/18_18099/
// 圣墟 https://www.ddyueshu.com/2_2219/
// 诡秘 https://www.ddyueshu.com/5_5552/
// 烂柯棋缘 https://www.ddyueshu.com/16_16202/

const Params = {
    catalogUrl: `https://www.ddyueshu.com/18_18099/`,
    startName: `第六百三十章`,
    endName: ``,
    fileName: `师兄_620-630.txt`
}

exports.fetchCatalog = async (ctx,next) => {
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

        // 20210809 注意：当网站的域名发生更换时，会出现superagent: double callback bug.
        const result = await superagent.get(Params.catalogUrl).buffer(true)//.charset('gbk');  
        // console.log('===result===',result);
        let html = result&&result.text;
        let $ = await cheerio.load(html, {decodeEntities: false}); //用cheerio解析页面数据
        let charset = this.getWebsiteCharset($);
        console.log('===charset===',charset);

        //let catalogNodeName = this.findCatalogNodeName($);
        
        // $(`${catalogNodeName} a`).each((index, element) => {
        //     let $text = $(element).text();
        //     let $url = $(element).attr('href');
        //     if (isHasEndFlag&&($text.includes(Params.endName))) {
        //         initIndex = index;
        //     }
        //     if (((isHasEndFlag&&initIndex>-1)||!isHasEndFlag)&&/第.*章.*/.test($text)) {
        //         console.log('===$text===',$text);
        //         urls.unshift($url);
        //     }
        //     if ($text.includes(Params.startName)) {
        //         return false;
        //     }
        // });
        // console.log('获取数组完成:',JSON.stringify(urls),'数组长度:',urls.length);

        // if (!utils.isDataValid(urls) || urls.length < 1) {
        //     ctx.body = {errInfo: '抓取章节失败！'};
        // }

        // for (let index = 0; index < urls.length; index++) {
        //     try {
        //         await utils.delay(250);
        //         let resStr = await this.fetchChapter(`${urls[index]}`);
        //         if (resStr&&resStr.length>0) {
        //             await utils.writeFile(Params.fileName,resStr);
        //         }else {
        //             ctx.body = {
        //                 errInfo2: `${url}抓取失败`,
        //             }
        //         }
        //     } catch (error) {
        //         ctx.body = {
        //             errInfo3: error,
        //         }
        //     }
        // }
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

/** 查找目录所在的节点的名称 */
exports.findCatalogNodeName = ($) => {
    let nodeName = '';
    $('a').parents().each((index, element)=>{ // 查询出所有a标签的父节点并遍历
        let nodeCount = $(element).siblings().length; // a标签父级元素的同级节点数量
        if (nodeCount > 15) {
            nodeName =  $(element).prop("tagName");
            return false; //用false结束循环
        }
    });
    return nodeName;
}

/** 获取网站的字符集 */
exports.getWebsiteCharset = ($) => {
    let charsetOfMeta = $('meta[charset]').attr('charset');
    if (utils.isDataValid(charsetOfMeta)) return charsetOfMeta;
    let charsetOfHE = $('meta[http-equiv]').attr('content');
    if (utils.isDataValid(charsetOfHE)) {
        let charset = charsetOfHE.split("charset=")[1];
        if (utils.isDataValid(charset)) return charset;
    }
    return 'utf-8';
}
