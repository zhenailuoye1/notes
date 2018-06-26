const superagent = require('superagent');
const fs = require('fs');
const cheerio = require('cheerio');
const readline = require('readline');
const URL = require('url');

let parseUrl = null

function getInput(que) {
  return new Promise(function (resolve) {
    let rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  
    rl.question(`${que} \n   ==> `, (answer) => {
      rl.close();
      resolve(answer)
    });
  })
}

function savedImg(src, pos) {
  let stream = fs.createWriteStream('./' + parseUrl.host + '/' + pos + '.jpg');
  let req = superagent.get(src);
  req.pipe(stream);
  stream.on('error', (err) => {
    console.log(err.stack);
  });
}

function getResources($, dirName) {
  $('.pic-list2 .pic').each((index, item) => {
    let href = $(item).attr('href')
    superagent.get(parseUrl.protocol + '//' + parseUrl.host + href).end((err, res) => {
      if (err) {
        console.log(err);
      }
      let $c = cheerio.load(res.text);
      let src = $c('#bigImg').attr('src');
      savedImg(src, dirName + '/' + index)
    })
  })
}

function start(url) {
  superagent.get(url).end((err, res) => {
    if (err) {
      console.log(err);
    }
    let $ = cheerio.load(res.text);
    let dirName = url.split('/').pop().replace(/\.html/,'')
    fs.mkdir(parseUrl.host, (err) => {
      if (err) {
        if (!/EEXIST/.test(err)) {
          console.log(err)
        }
      }
      fs.mkdir(parseUrl.host + '/' + dirName, (err) => {
        if (err) {
          if (/EEXIST/.test(err)) {
            console.log('目录已存在！');
            let p = getInput('是否替换掉已存在的目录？（输入y替换）');
            p.then((input) => {
              if (input === 'y' || input === 'Y') {
                getResources($, dirName)
                console.log('获取资源...')
              }
              main()
            })
          } else {
            console.log(err);
          }
        } else {
          console.log("目录创建成功。");
          getResources($, dirName)
          console.log('获取资源...')
          main()
        }
      })
    });
  })
}

async function main() {
  let input = await getInput('请输入网址:');
  parseUrl = URL.parse(input)
  start(input)
}

main();
