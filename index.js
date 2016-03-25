"use strict"
require('./helper')
let fs = require('fs').promise
let express = require('express')
let morgan = require('morgan')
let trycatch = require('trycatch')
let wrap = require('co-express')
let bodyParser = require('simple-bodyparser')
let path = require('path')
let mime = require('mime-types')

function* create(req, res) {
	try {
		let filePath = path.join(__dirname, 'files', req.url)
		let data = yield fs.open(filePath, "wx")
		if(req.body) {
			let data = yield fs.writeFile(filePath, req.body)	
			var stats = yield fs.stat(filePath)
			res.setHeader('Content-Length', stats["size"])
			res.setHeader('Content-Type', mime.lookup(filePath))
		}
		res.send()
	} catch (err) {
		console.error(err.stack)
	}
	
}

function* update(req, res) {
	let filePath = path.join(__dirname, 'files', req.url)
	let data = yield fs.writeFile(filePath, req.body)
	res.end()
}

function* remove(req, res) {
	let filePath = path.join(__dirname, 'files', req.url)
	let data = yield fs.unlink(filePath)
	res.end()
}

function* read(req, res) {
	let filePath = path.join(__dirname, 'files', req.url)
	let data = yield fs.readFile(filePath)
	res.end(data)
}

function* main() {
	let app = express()
	app.use(morgan('dev'))

	app.use((req, res, next) => {
        trycatch(next, e => {
            console.log(e.stack)
            res.writeHead(500)
            res.end(e.stack)
        })
    })
    //read
    app.get('*', wrap(read))
    
    app.put('*', bodyParser(), wrap(create))

  	app.post('*', bodyParser(), wrap(update))
    
    app.delete('*', wrap(remove))
	
	app.all('*', (req, res) => res.end('hello\n'))

    let port = 8000
    app.listen(port)
    console.log(`LISTENING @ http://127.0.0.1:${port}`)
}



module.exports = main
