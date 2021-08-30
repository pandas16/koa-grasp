/**
 * 公共方法
 */
const fs = require('fs');

const Tools = {
    writeFile: (fileName = '', content = '') => {
        return new Promise((resolve, reject) => {
            //判断文件是否存在
            fs.exists(`${fileName}`, (exists) => {
                if (exists) {
                    fs.appendFile(`${fileName}`, content, 'utf8', (err) => {
                        if (err) {
                            reject && reject(err); return;
                        }
                        console.log(`===追加文件内容成功===`);
                        resolve && resolve();
                    });
                } else {
                    fs.writeFile(`${fileName}`, content, 'utf8', (err) => {
                        if (err) {
                            reject && reject(err); return;
                        }
                        console.log(`===写入文件成功===`);
                        resolve && resolve();
                    });
                }
            });
        });
    },
    isDataValid: function (data = '') {
        if (data != null) {
            data = data.toString();
            if (data != '' && data != 'undefined' && data != 'null') {
                return true;
            }
        }
        return false;
    },
    delay: async (time) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, time);
        });
    },
    mixinRepeatKeywords(k1, k2) {
        if (k1 === k2 || !k2 || !k1) return false;
    
        const len1 = k1.length;
        const len2 = k2.length;
        let index = 0;
    
        for (let i = 1; i < len1; i++) {
            let sub1 = k1.substring(len1 - i, len1); // k1的后几位
            let sub2 = k2.substring(0, i); // k2的前几位
    
            // 记录匹配上的最后一个位置
            if (sub1 === sub2) {
                index = i;
            }
        }
    
        // 拼接为一个字符串
        if (index) {
            return k1 + k2.substring(index, len2);
        }
    }
}

module.exports = Tools;
