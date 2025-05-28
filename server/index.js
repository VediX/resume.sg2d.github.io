// cd ~/sg2d.github.io/resume.sg2d.github.io && npm run start

const static = require('node-static');
const port = 1080;
const file = new static.Server('.', { cache: 0, headers: {'X-Hello':'World!'} });

require('http').createServer(function (req, res) {
    req.url = '' + req.url;
    file.serve(req, res, function (err, _res) {
        if (err) {
            console.error("> Error serving " + req.url + " - " + err.message);
            //res1.writeHead(err.status, err.headers).end();
        } else {
            console.log("> " + req.url);
        }
    });
}).listen(port);

console.log("> node-static is listening on http://127.0.0.1:" + port);