/** 作为API的接口 */
'use strict';

const cheerio = require('cheerio');
const charset = require('superagent-charset');
const superagent = charset(require('superagent'));
const iconv = require('iconv-lite');
const utils = require('../utils/utils');

exports.fetchCatalog = async (ctx,next) => {
    let params = ctx.request.body;

    let urls = [];
    let initIndex = -1;
    let isHasStartFlag = params.startTitle&&params.startTitle.length>0;

    const result = await superagent.get(params.link).buffer(true).charset('binary');
    let html = result && result.text;
    let buf = Buffer.from(html, 'binary'); //转换成buffer
    let charset = (buf.toString().match(/<meta.+?charset=['"]?([^"']+)/i) || []).pop() || 'utf-8'; //编码格式
    var decodeHtml = iconv.decode(buf, charset);
    let $ = await cheerio.load(decodeHtml, { decodeEntities: false }); //用cheerio解析页面数据
    let catalogNode = this.findCatalogNode($); //目录结构的标志
    let node = JSON.parse(JSON.stringify(catalogNode));

    let selectorStr = this.getSelectorStr(node); // 选择器文本
    if (!utils.isDataValid(selectorStr)) 
        ctx.body = { errInfo: '选择器索取失败' };
    
    $(`${selectorStr}`).find('a').each((index, element) => {
        let $text = $(element).text();
        let $url = $(element).attr('href');
        if (isHasStartFlag && ($text.includes(params.startTitle))) {
            initIndex = index;
        }
        if ((isHasStartFlag && initIndex > -1) || !isHasStartFlag) { //((isHasStartFlag && initIndex > -1) || !isHasStartFlag) && /第.*章.*/.test($text)
            let chapter = {url: $url, text: $text};
            urls.push(chapter);
        }
        if (utils.isDataValid(params.endTitle)&&$text.includes(params.endTitle)) {
            return false;
        }
    });
    console.log('获取数组完成:', JSON.stringify(urls), '数组长度:', urls.length);

    if (!utils.isDataValid(urls) || urls.length < 1) 
        ctx.body = {errInfo: '抓取章节失败！'};

    ctx.body = {
        data: urls
    }
}

exports.doDownload = async (ctx,next) => {
    let params = ctx.request.body;
    console.log('===params===',params);
    let result = '';
    let promiseList = params.list&&params.list.map((item)=>this.fetchChapter(params.url, item));
    await Promise.all(promiseList).then((res)=>{
        result +=res;
    }).catch((err)=>{
        ctx.body = err;
    });
    ctx.body = result;
}

/** 抓取每一章 */
exports.fetchChapter = async (baseUrl = '',chapter = {}) => {
    return new Promise(async (resolve, reject) => {
        let url = utils.mixinRepeatKeywords(baseUrl, chapter.url);
        console.log('===url===',url);
        let str = '';
        superagent.get(`${url}`).buffer(true).charset('binary').then((res) => {
            let html = res&&res.text;
            let buf = Buffer.from(html, 'binary'); //转换成buffer
            let charset = (buf.toString().match(/<meta.+?charset=['"]?([^"']+)/i) || []).pop() || 'utf-8'; //编码格式
            var decodeHtml = iconv.decode(buf, charset);
            let $ = cheerio.load(decodeHtml, {decodeEntities: false}); //用cheerio解析页面数据
            
            let contentInfo = this.findContentNodeId($, 'br');
            if (contentInfo == null || Object.keys(contentInfo).length <= 0) {
                contentInfo = this.findContentNodeId($, 'p');
            }
            // console.log('===contentInfo===',JSON.stringify(contentInfo));
            let selectorStr = this.getSelectorStr(contentInfo); // 选择器文本
            // console.log('===selectorStr===',selectorStr);
            
            if (!utils.isDataValid(selectorStr)) {
                reject&&reject('正文解构失败,请联系管理员!');
            }
            let header = chapter&&chapter.text.trim();
            header = header.replace(/（.*?）/,'');
            header = header.replace(/【.*?】/,''); 
            str += ('\r\n' + header + '\r\n');
            $(`${selectorStr}`).contents().each((index, element) => {
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
exports.getSelectorStr = (node = {}) => {
    let selectorStr = '';
    if ('id' in node) {
        selectorStr = `#${node.id}`;
    }else if ('class' in node) {
        let classArr = node.class.split(' ');
        selectorStr = classArr.map((item)=>`.${item}`).join(', ');
    }
    return selectorStr;
}

/** 查找目录所在的节点的名称 */
exports.findCatalogNode = ($) => {
    let node = {};
    $('a').length > 0 && $('a').each((index, element)=>{ // 查询出所有a标签的父节点并遍历
        let containerNode = $(element).parent();
        let nodeCount = containerNode.siblings().length; // a标签父级元素的同级节点数量
        if (nodeCount > 19) {
            node = containerNode.parent().attr();
            if (!('id' in node) && !('class' in node)) 
                node = containerNode.parent().parent().attr();
            return false; //用false结束循环
        }
    });
    return node;
}

/** 查找正文的节点信息 */
exports.findContentNodeId = ($, tag) => {
    let contentInfo = {};
    $(tag).length > 0 && $(tag).each((index, element) => {
        let brCount = $(element).siblings().length;
        if (brCount > 10) {
            contentInfo = $(element).parent().attr();
            if (!('id' in contentInfo) && !('class' in contentInfo)) {
                contentInfo = $(element).parent().parent().attr();
            }
            return false; //用false结束循环
        }
    });
    return contentInfo;
}