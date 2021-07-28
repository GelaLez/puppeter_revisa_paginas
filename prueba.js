const puppeteer = require('puppeteer');
const fs = require('fs')
const path = require('path');
const Promise = require("bluebird");
let browser, page, pages;
let ArrayPaginas = JSON.parse(fs.readFileSync(__dirname + '/Paginas.json', 'utf8'))
const express = require('express');
const app = express()
const cors = require('cors');
app.use(cors())
const exphbs = require('express-handlebars')

var hbsHelpers = {
  ifCond: function (v1, operator, v2, options) {
    console.log(v1)
    console.log(operator)
    console.log(v2)

    switch (operator) {
      case '==':
        return (v1 == v2) ? options.fn(this) : options.inverse(this)
      case '===':
        return (v1 === v2) ? options.fn(this) : options.inverse(this)
      case '<':
        return (v1 < v2) ? options.fn(this) : options.inverse(this)
      case '<=':
        return (v1 <= v2) ? options.fn(this) : options.inverse(this)
      case '>':
        return (v1 > v2) ? options.fn(this) : options.inverse(this)
      case '>=':
        return (v1 >= v2) ? options.fn(this) : options.inverse(this)
      case '&&':
        return (v1 && v2) ? options.fn(this) : options.inverse(this)
      case '||':
        return (v1 || v2) ? options.fn(this) : options.inverse(this)
      default:
        return options.inverse(this)
    }
  }
}

app.engine('.hbs', exphbs({
  layoutsDir: path.join(__dirname, 'views'),
  // partialsDir: path.join(__dirname, 'client/views/partials'),
  defaultLayout: 'main',
  extname: 'hbs',
  helpers: hbsHelpers
}))


if (!fs.existsSync(path.join('.', 'img'))) {
  fs.mkdirSync(path.join('.', 'img'));
}

if (!fs.existsSync(path.join('.', 'views'))) {
  fs.mkdirSync(path.join('.', 'views'));
}

if (!fs.existsSync(path.join('.', 'public'))) {
  fs.mkdirSync(path.join('.', 'public'));
}

app.set('view engine', '.hbs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'img')))

// servidor 
app.get('/', (req, res) => {
  res.render('main', { err: false, description: '', url: 'http://localhost:5000/' })
})

app.listen(5000, () => {
  console.log("escuchando por el puerto 192.168.240.14", 5000)
})

// functiones 
async function start() {
  try {
    browser = await puppeteer.launch({
      headless: false,
      //args: ['--no-sandbox=false', '--disable-setuid-sandbox'],
      executablePath: '/snap/bin/chromium'
    });
    page = await browser.newPage()
    //  await page.goto('http://localhost:5000/', { waitUntil: 'networkidle2' });

    return true;

  } catch (e) {
    return false;
  }
}


async function lista_paginas() {
  var l = ArrayPaginas

  for (let p in l) {
    try {
      await page.goto('$url', { waitUntil: 'load', timeout: 0 });
    } catch (e) {
      console.log(e.message);
    }

    await page.goto(l[p].url, { waitUntil: 'networkidle2' })
      .catch((res) => {
        console.log('Error al tratar de acceder :' + l[p].url)
        // reporta 
      })

    await page.type(l[p].id_usuario, l[p].usuario);
    await page.type(l[p].id_password, l[p].contrasena);
    await Promise.all([
      page.click(l[p].id_enter),
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
    ]);
    await page.setViewport({ width: 1366, height: 768 });

    if (l[p].navegaPanel != undefined) {
      await page.goto(l[p].navegaPanel, { waitUntil: 'networkidle2' })
        .catch((res) => {
          console.log('Error al tratar de acceder :' + l[p].url)
          // reporta 
        })

      await page.screenshot({
        path: 'img/' + l[p].alias + '.png',
        fullPage: false
      })
      await page.close();
      //await browser.close();
      return true;
    } else {
      await page.screenshot({
        path: 'img/' + l[p].alias + '.png',
        fullPage: false
      })
      await page.close();
      //await browser.close();
      return true;
    }
    //await page.waitFor(1500)

  }
  
}

start()
  .then(function (res) {
    if (res) {
      setInterval(() => {
        lista_paginas()
          .then(function (rp) {
            console.log("vuelta terminada");
          })
      }, 30000);
    }
  })



  //http://192.168.130.215:8082/inconcert/apps/outboundengine/automaticoutboundprocess/edit/AP_MAESTRIAS_PRED//