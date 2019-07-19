/**
 * 《龙族》函数
 */
'use strict';

const cheerio = require('cheerio');
const superagent = require('superagent');
require('superagent-charset')(superagent); // install charset
const utils = require('../utils/utils');

exports.fetchNovel = async (ctx,next) => {
    const query = ctx.request.query;
    let start = query.start || 260; //起始编号
    let step = query.step || 1; //步长
    let size = query.size || 1; //数组长度
    let end = query.end || 0; //结束编码

    if (end&&end>0) {
        step = 1;
        size = end - start;
    }
    // let fileName = `龙族_${start}_${size}_${step}.txt`;
    let fileName = `龙族_xxx.txt`;
    let array = [...Array(parseInt(size)).fill(0)];

    for (let index = 0; index < array.length; index++) {
        if (index == 0) {
            array[index] = parseInt(start);
        }else {
            array[index] = array[index - 1] + parseInt(step);
        }
        try {
            console.log(`===开始抓取===第${ array[index] }页`);
            let resStr = await this.fetchChapter(`/post/${array[index]}.html`);
            if (resStr&&resStr.length>0) {
                await utils.writeFile(fileName,resStr);
            }else {
                ctx.body = {
                    errInfo2: `${url}抓取失败`,
                }
            }
        } catch (error) {
            ctx.body = {
                errInfo: error,
            }
        }
    }
}

exports.fetchCatalog = async (ctx,next) => {
    const query = ctx.request.query;
    let start = query&&query.start; // || '第170章 但为君故(74)';
    let superagentRes = null,urls = [];
    let fileName = `龙族_170.txt`;
    try {
        superagentRes = await superagent.get(`http://longzu5.co`);
        let html = superagentRes&&superagentRes.text;
        let $ = await cheerio.load(html, {decodeEntities: false}); //用cheerio解析页面数据
    
        $('.booklist a').each((index, element) => {
            let $text = $(element).text();
            let $url = $(element).attr('href');
            urls.unshift($url);
            if ($text == start) {
                return false;
            }
        });

        console.log('获取数组完成:',urls,'数组长度:',urls.length);
        if (urls&&urls.length < 1) {
            ctx.body = {
                errInfo1: '抓取章节失败！',
            }
        }
    } catch (error) {
        ctx.body = {
            errInfo1: error,
        }
    }

    for (let index = 0; index < urls.length; index++) {
        try {
            console.log(`===开始抓取${urls[index]}===`);
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
}

/** 抓取每一章 */
exports.fetchChapter = async (urlNumber) => {
    return new Promise(async (resolve, reject) => {
        try {
            let url = `http://longzu5.co${urlNumber}`;
            console.log('===url===',url);
            const res = await superagent.get(`${url}`);
            let html = res&&res.text;
            let $ = await cheerio.load(html, {decodeEntities: false}); //用cheerio解析页面数据
            let str = '';
            let header = $('h2').text();
            str += (header + '\r\n\n');
            $('div:nth-of-type(1) > p:nth-of-type(n+2)').each((index, element) => {
                let $text = $(element).text();
                // if ($text == '坑边闲话：' || $text == '（坑边闲话：') {
                if ($text.search('坑边闲话：') != -1 || $text.search('PS：') != -1) {
                    return false;
                }
                if ($text.trim() && $text.trim().length > 0) { //不需要空行
                    str += ($text + '\r\n\n');
                }
            });
            resolve&&resolve(str);
        } catch (err) {
            reject&&reject(err);
        }
    });
}