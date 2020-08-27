/**
 * 《全职法师》函数
 */
'use strict';

const cheerio = require('cheerio');
const superagent = require('superagent');
require('superagent-charset')(superagent); // install charset
const utils = require('../utils/utils');


const Cookie = `SINAGLOBAL=9538639505503.3.1559650633062; un=13619562046; Ugrow-G0=140ad66ad7317901fc818d7fd7743564; login_sid_t=70b64910a71fa67e6d379785db0f22f2; cross_origin_proto=SSL; TC-V5-G0=799b73639653e51a6d82fb007f218b2f; WBStorage=42212210b087ca50|undefined; _s_tentry=passport.weibo.com; UOR=www.cidianwang.com,widget.weibo.com,www.baidu.com; wb_view_log=1366*7681; Apache=6388749598041.541.1584777990410; ULV=1584777990418:22:3:2:6388749598041.541.1584777990410:1584258501194; SUBP=0033WrSXqPxfM725Ws9jqgMF55529P9D9WWKAm_RT83dRxHyw-zZE6XZ5JpX5K2hUgL.FoeN1h2NSKMRe0B2dJLoIpeLxK.L1-BL1--LxK-L12zL1KHk; ALF=1616314045; SSOLoginState=1584778045; SCF=AvSMTUfB_D2abuK_eQF5Iy1wDCV45RzwSQln6QkpHfiGFqRxFpOj4Nl1I6ubzmD9FeSREohRq3Mgzh1rp0WkuS8.; SUB=_2A25zcbttDeRhGeVJ41MW9SnEyDiIHXVQBqulrDV8PUNbmtAKLXXwkW9NT8fzEnJqYiI50A0qs9e8g1g6rvPO2-iI; SUHB=0ElqanRReiCute; wvr=6; TC-Page-G0=1ae767ccb34a580ffdaaa3a58eb208b8|1584778050|1584778050; wb_view_log_3781757834=1366*7681; webim_unReadCount=%7B%22time%22%3A1584778081856%2C%22dm_pub_total%22%3A0%2C%22chat_group_client%22%3A0%2C%22allcountNum%22%3A0%2C%22msgbox%22%3A0%7D`
// 斩决 https://www.11kt.cn/read/131820/index.html
// 全职法师 https://www.booktxt.net/0_595/
// 我师兄实在太稳健了 https://www.booktxt.net/18_18099/
// 圣墟 https://www.booktxt.net/2_2219/
const catalogUrl = 'https://weibo.com/u/5872517301?profile_ftype=1&is_all=1&is_search=1&key_word=%E9%87%8D%E7%94%9F%E4%B9%8B%E6%9A%B4%E5%90%9B&page=1'; 


exports.weiboLogin = async (ctx,next) => {
    
}

exports.fetchCatalog = async (ctx,next) => {
    const query = ctx.request.query;
    let start = query&&query.start || '第1529章 仙后';
    let superagentRes = null;
    let urls = [];
    let fileName = `weibo.txt`;

    try {
        superagentRes = await superagent.get(`${catalogUrl}`)
            .set('Cookie', Cookie) 
            .buffer(true)
            .charset('utf-8');
        let html = superagentRes&&superagentRes.text;
        let $ = await cheerio.load(html, {decodeEntities: false}); //用cheerio解析页面数据
        console.log('===$===',$);
        
        let aaa = $('h1').text();
        console.log('aaa',aaa);
        
        // $($('.WB_text a').toArray().reverse()).each((index, element) => {
        //     console.log('element',element);
        //     let $text = $(element).text();
        //     console.log('$text',$text);
        //     let $url = $(element).attr('href');
        //     urls.unshift($url);
        //     if ($text == start) {
        //         return false;
        //     }
        // });

        // console.log('获取数组完成:',JSON.stringify(urls),'数组长度:',urls.length);
        // if (!utils.isDataValid(urls) || urls.length < 1) {
        //     ctx.body = {errInfo: '抓取章节失败！'};
        // }

        // console.log('urls',urls);
        

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
        // for (let index = 0; index < urls.length; index++) {
        //     try {
        //         await utils.delay(250);
        //         let resStr = await this.fetchChapter(`${urls[index]}`);
        //         if (resStr&&resStr.length>0) {
        //             await utils.writeFile(fileName,resStr);
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
    } catch (error) {
        ctx.body = {
            errInfo: error,
        }
    }
}

/** 抓取每一章 */
exports.fetchChapter = async (chapterUrl) => {
    return new Promise(async (resolve, reject) => {
        let url = `${catalogUrl}${chapterUrl}`;
        let str = '';
        superagent.get(`${url}`).buffer(true).charset('gbk').then((res) => {
            console.log('===url===',url);
            let html = res&&res.text;
            let $ = cheerio.load(html, {decodeEntities: false}); //用cheerio解析页面数据
            let header = $('h1').text().trim();
            str += (header + '\r\n');
            $('div#content').contents().each((index, element) => {
                let $text = $(element).text().trim();
                if ($text.trim() && $text.trim().length > 0) { //不需要空行
                    str += (`    ` + $text + '\r\n');
                    console.log('===test1===',$text);
                    // $text.replace('\r\n','');
                    // console.log('===test2===',$text);
                    // $text.replace('\n+','\n');
                    // console.log('===test3===',$text);
                    // TODO 需要将句前的空格替换为固定的2个空格
                    // $text.replace('/^\s+/gm','');
                    // console.log('===test4===',$text);
                    // str += $text;
                }
            });
            resolve&&resolve(str);
        }).catch((err)=>{
            reject&&reject(err)
        });
    });
}