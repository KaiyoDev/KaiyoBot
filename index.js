const { spawn } = require("child_process");
const express = require("express");
const app = express();
const logger = require("./utils/log.js");
const path = require('path');
const net = require('net');
const chalk = require('chalk');
const pkg = require('./package.json');
const axios = require('axios');
const moment = require('moment-timezone');
moment.tz.setDefault('Asia/Ho_Chi_Minh');
const vietnamTime = moment();
const getRandomPort = () => Math.floor(Math.random() * (65535 - 1024) + 1024);
const PORT = getRandomPort();
let currentPort = PORT;
const REPL_HOME = `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`.toLowerCase();

app.get('/', (req, res) => res.sendFile(path.join(__dirname, '/kaiyo.html')));

console.clear();
console.log(chalk.bold.dim(`
            #               #
          ##                 ##
         ##                   ##
        ##                     ##
        ##                     ##
        ##                     ##
         ##                   ##
     ##  ##                   ##  ##
    ##   ##                   ##   ##
   ##     ##                 ##     ##
   #       ###             ###       #
   ##       ###           ###       ##
   ###       ###  #####  ###       ###
    ######    #############   #######
         ######################
    ################################
   ### ########################## ###
  ###         ############         ###
 ##         #################        ##
 ##     ########################     ##
##     ###  ################  ###     ##
 ##    ##   #######  #######   ##    ##
  #    ##   #######  #######   ##    #
   #   ##   ################   ##   #
    #  ##    ##############    ##  #
       ##     ############     ##
       ##       ########       ##
        ##                    ##
        
© 2017 - 2023 | KaiyoSadboy - All Rights Reserved.
----------------KaiyoBot---(${pkg.version})---------------`));

startBot(0);

function startServer(port) {
  app.listen(port, () => {
    const formattedTime = vietnamTime.format('dddd, DD-MM-YYYY HH:mm:ss');

    logger.loader(`Thời gian hiện tại: ${formattedTime}`);
    logger.loader(`Bot đang chạy trên cổng: ${port}`);

    const apiUrl = `https://api.kaiyocoder.repl.co/addurl?url=${encodeURIComponent(REPL_HOME)}`;
    axios.get(apiUrl)
      .then(response => {
        if (response.data.success && response.data.data && response.data.data.status) {
            logger.loader('Đã uptime thành công!!!');
        } else {
          console.error('Phản hồi không mong muốn từ API:', response.data);
        }
      })
      .catch(error => {
        console.error('Lỗi khi gửi yêu cầu đến API:', error.message);
      });
  });

  app.on('error', (error) => {
    logger(`Đã xảy ra lỗi khi khởi động máy chủ: ${error}`, "HỆ THỐNG");
  });
}

startServer(currentPort);

async function startBot(index) {
  try {
    const child = spawn("node", ["--trace-warnings", "--async-stack-traces", "main.js"], {
      cwd: __dirname,
      stdio: "inherit",
      shell: true,
      env: {
        ...process.env,
        CHILD_INDEX: index,
      },
    });

    child.on("close", (codeExit) => {
      if (codeExit !== 0) {
        startBot(index);
      }
    });

    child.on("error", (error) => {
      logger(`Đã xảy ra lỗi khi khởi động quá trình con: ${error}`, "HỆ THỐNG");
    });
  } catch (err) {
    logger(`Lỗi khi khởi động bot: ${err}`, "HỆ THỐNG");
  }
}
