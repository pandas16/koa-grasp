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
}

module.exports = Tools;
