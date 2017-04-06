var express = require('express');
var app = express();
var bodyParser = require('body-parser')
var fs = require("fs")
var assert = require("assert")
var backwardsStream = require('fs-backwards-stream')
var createIfNotExist = require("create-if-not-exist");

app.use(express.static("."))

app.use(bodyParser.urlencoded({
    extended: false
}))

app.use(bodyParser.json())

app.post('/files', function(req, res) {
    fs.readdir(req.body.path, function(err, flist) {
        console.log(req.body, "reading as directoty", err)
        if (err) {

            fs.readFile(req.body.path, "utf8", function(err, data) {
                if (err) throw err;
                // console.log(data);
                res.send({
                    type: "file",
                    content: data
                })
            });

        } else {
            console.log(flist)
            res.send({
                type: "folder",
                content: flist
            })
        }
    })
});

app.post('/create', function(req, res) {
    switch (req.body.type) {
        case 'symlink':
            console.log("creating a symlink from", req.body.target, req.body.source)
            res.sendStatus(200)
            break;
        case 'file':
            console.log("creating a file from", req.body)
            const file = req.body.path + "/" + req.body.name
            createIfNotExist(file, "")
            res.sendStatus(200)
            break;
        case 'folder':
            console.log("creating a folder from", req.body)
            const dir = req.body.path + "/" + req.body.name
            console.log(dir)
            if (!fs.existsSync()) {
                try {
                    fs.mkdirSync(dir);
                } catch (e) {
                    res.send({ params: req.body, error: e }, 401)
                }
            } else {
                res.sendStatus(200)
            }


            break;
    }
});

function log(err) {
    assert.ifError(err)
    console.log("server started @3333")
}

app.listen("3333", log)
