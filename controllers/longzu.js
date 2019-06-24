/**
 * 用户模块的函数
 */
'use strict';

const cheerio = require('cheerio');
const superagent = require('superagent');
const fs = require('fs');

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
    let fileName = `龙族_100.txt`;
    let array = [...Array(parseInt(size)).fill(0)];

    for (let index = 0; index < array.length; index++) {
        if (index == 0) {
            array[index] = parseInt(start);
        }else {
            array[index] = array[index - 1] + parseInt(step);
        }
        try {
            console.log(`===开始抓取===第${ array[index] }页`);
            // setTimeout(async () => {
                let resStr = await this.fetchChapter(`/post/${array[index]}.html`);
                this.textLocalTxt(resStr,fileName);   
            // }, 5000);
        } catch (error) {
            ctx.body = {
                errInfo: error,
            }
        }
    }
}

exports.fetchCatalog = async (ctx,next) => {
    const query = ctx.request.query;
    let start = query&&query.start || '第100章 但为君故(4)';
    let superagentRes = null,urls = [];
    let fileName = `龙族_100.txt`;
    try {
        superagentRes = await superagent.post(`http://longzu5.co`);
        let html = superagentRes&&superagentRes.text;
        let $ = cheerio.load(html, {decodeEntities: false}); //用cheerio解析页面数据
    
        $('.booklist li:nth-of-type(n+2) a').each((index, element) => {
            let $text = $(element).text();
            let $url = $(element).attr('href');
            urls.unshift($url);
            if ($text == start) {
                return false;
            }
        });
    } catch (error) {
        ctx.body = {
            errInfo1: error,
        }
    }
    console.log('===获取数组完成===',urls);
    for (let index = 0; index < urls.length; index++) {
        try {
            console.log(`===开始抓取${urls[index]}===`);
            let resStr = await this.fetchChapter(`${urls[index]}`);
            console.log('===resStr===',resStr);
            if (resStr&&resStr.length>0) {
                this.textLocalTxt(resStr,fileName);         
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
            const res = await superagent.post(`${url}`);
            let html = res&&res.text,
                $ = cheerio.load(html, {
                    decodeEntities: false
                }), //用cheerio解析页面数据
                obj = {};
            let arr = [];
            let str = '';
            
            let header = $('h2').text();
            obj.header = header;
            str += (header + '\r\n\n');
    
            //类似于jquery的操作
            $('div:nth-of-type(1) > p:nth-of-type(n+2)').each((index, element) => {
                var $text = $(element).text();
                arr.push($text);
                if ($text == '坑边闲话：' || $text == '（坑边闲话：') {
                    return false;
                }
                str += ($text + '\r\n\n');
            });
            console.log('===str===',str);
            resolve&&resolve(str);
        } catch (err) {
            reject&&reject(err);
        }
    });
}

/** 写入每一章 */
exports.textLocalTxt = async (text,fileName) => {
    fs.appendFile(fileName,text,'utf8',(error) => {
        if(error){
            console.log('===error===',error);
            return false;
        }
        console.log('===写入完成===');
    });
}