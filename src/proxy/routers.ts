import * as fs from 'fs';
import * as path from 'path';

export const isLocal = (url: string): boolean => {
  return !(url.startsWith('http') || url.startsWith('https')) && !url.includes('/socket.io/');
}

const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bproxy</title>
</head>
<body>
<style>
.btn {display: inline-flex;align-items: center;padding: 5px 10px; background: blue; color: #fff; justify-content: center; font-size: 16px; text-decoration: none; border-radius: 5px; margin: 0 10px;}
</style>
<a class="btn" href="/install">安装证书</a>
<a class="btn" href="/inspect">日志</a>
</body>
</html>
`;

const inspectResponse = (req, res) => {
  const filepath = req.url === '/inspect' ? path.resolve(__dirname, '../../index.html') : path.resolve(__dirname, req.url.replace(/^\/dist\//, '../../'));

  try {
    if (!fs.existsSync(filepath)) {
      throw 404;
    }
    const readStream = fs.createReadStream(filepath);
    const headers = {};
    if (filepath.includes('.html')) {
      headers['content-type'] = 'text/html; charset=utf-8';
    } else if (filepath.includes('.js')) {
      headers['content-type'] = 'text/javascript; charset=utf-8';
    } else if (filepath.includes('.css')) {
      headers['content-type'] = 'text/css; charset=utf-8';
    }  else if (filepath.includes('.svg')) {
      headers['content-type'] = 'image/svg+xml';
    }
    res.writeHead(200, headers);
    readStream.pipe(res);
  } catch(err) {
    res.writeHead(404, {});
    res.end('404');
  }
};

export const requestJac = (req, res, certConfig) => {
  switch (req.url) {
    case '/':
      res.end(html);
      break;

    case '/install':
      try {
        const readStream = fs.createReadStream(certConfig.certPath);
        res.writeHead(200, {
          'content-type': 'application/x-x509-ca-cert; charset=utf-8',
        });
        readStream.pipe(res);
      } catch(err) {
        res.writeHead(404, {});
        res.end('404');
      }
      break;
    default:
      if (req.url.startsWith('/dist') || req.url.startsWith('/inspect')) {
        inspectResponse(req, res);
        return;
      }
      res.end('404');
      break;
  }
};
