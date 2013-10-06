var request = require('request'),
http = require('http'),
url = require('url'),
path = require('path'),
fs = require('fs');


var mimeTypes = {
    "html": "text/html",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
    "js": "text/javascript",
    "css": "text/css"};
	
	
var CSVURL1 = "http://ichart.finance.yahoo.com/table.csv?s=";

var CSVURL2 = "&a=07&b=19&c=2004&d=05&e=18&f=2009&g=v&ignore=.csv";

// Configure our HTTP server to respond with Hello World to all requests.
var server = http.createServer(function (req, res) {
  if(req.url == "/"){
    var fileStream = fs.createReadStream("index.html");
    fileStream.pipe(res);
	return;
  }
  if (req.url.indexOf("/historic") !== -1){ // if the url is for historic
    // console.log("WTF", req.url, req.url.indexOf("/historic"));
    // console.log(req);
	var url_parts = url.parse(req.url, true);
	req.query = url_parts.query;
	if(req.query && req.query.symbol){
	  var symbol = req.query.symbol
	  
      var x = request(CSVURL1+symbol+CSVURL2, function(err, response, body){
	    // console.log("response", response.statusCode);
		if(response && response.statusCode === 404){
		  res.writeHead(404);
	      res.end("NOPE");
		}else{
  	      res.writeHead(200, {"Content-Type": "text/csv"});
	      res.end(body);
		}
	  });
	}else{
	  res.writeHead(200, {"Content-Type": "text/plain"});
      res.end("No symbol provided\n");
	}
  }else{
    var uri = url.parse(req.url).pathname;
    var filename = path.join(process.cwd(), uri);
    fs.exists(filename, function(exists) {
        if(!exists) {
            console.log("not exists: " + filename);
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.write('404 Not Found\n');
            res.end();
			return;
        }
        var mimeType = mimeTypes[path.extname(filename).split(".")[1]];
        res.writeHead(200, mimeType);

        var fileStream = fs.createReadStream(filename);
        fileStream.pipe(res);

    }); //end path.exists
  }
});

// Listen on port 8080, IP defaults to 127.0.0.1
server.listen(8080);
