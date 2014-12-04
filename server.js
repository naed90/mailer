/**
 * New node file
 */
var http = require("http");
var url = require("url");
var trackers = {};

function start(route, handle) {
	function onRequest(request, response) {
		var postData = "";
		var pathname = url.parse(request.url).pathname;
		console.log("Request for " + pathname + " received.");
		//request.setEncoding("utf8");
		request.addListener("data", function(postDataChunk) {
			postData += postDataChunk;
			console.log("Received POST data chunk '"+
					postDataChunk + "'.");
		});
		request.addListener("end", function() {
			//JSON parse:
			var stringConstructor = "test".constructor;
			if(postData && postData.constructor===stringConstructor)
			{
				console.log("Parsing postdata");
				try{postData = JSON.parse(postData);}catch(e){console.log("Error parsing: " +e)}
			}
			route(handle, pathname, response, postData, trackers);
		});
	}
	server = http.createServer(onRequest);
	server.listen(process.env.PORT || 5000);
	console.log("Server has started.");
	
	var io = require('socket.io').listen(server)
	io.on('connection', function(socket){
		  console.log('a user connected1');
		  socket.isOn = true;
		  socket.on('message', function(message)
				  {
			  console.log(message);
				  });
		  function registerInfo(info)
		  {
			  /*
			   * info:
			   * id
			   * field
			   */
			  if(!info.id || !info.field)
				{
					socket.send("error socketing: no obj/field to track");
					return;
				}
			  str = stringFromIDAndField(info.id, info.field);
			  if(str === "error")
				  {
				  socket.send("error socketing: obj/field is/are not string/s");
					return;
				  }
			  if(typeof trackers[str]!==typeof{})
				  {
				  trackers[str] = {};
				  }
			  trackers[str][socket.id] = socket;
			  socket.send("accepted track of: " + str);
			  console.log("accepted track of: " + str);
			  client.send("Updated: " + str);
		  }
		  socket.on("registerForNotifications", registerInfo);
		  function resignInfo(info)
				  {
			  /*
			   * info:
			   * id
			   * field
			   */
			  if(!info.id || !info.field)
				{
					socket.send("error socketing: no obj/field to resign track");
					return;
				}
			  str = stringFromIDAndField(info.id, info.field);
			  if(str === "error")
			  {
			  socket.send("error socketing: obj/field is/are not string/s");
				return;
			  }
			  if(trackers[str])
				  {
				  console.log("deleting: " + trackers[str][socket.id]);
				  delete trackers[str][socket.id];
				  }
			  
				  }
		  socket.on("resignNotifications", resignInfo);
		  socket.on("registerAllTrackers", function(info){
			  if(typeof info !== typeof [])
				  {
				  socket.send("error socketing: info for register all is NOT in array form");
					return;
				  }
			  for(i = 0; i < info.length; i++)
			  {
			  
				  trackInfo = info[i];//string form
				  array = trackInfo.split("/");
				  if(array.length!=2)
					  {
					  socket.send("error socketing: string not appropriate in register all at index: " + i);
						break;
					  }
				  dictionary = {"id":array[0], "field":array[1]}
				  registerInfo(dictionary);
				  
			  }
		  });
		  socket.on("resignAllTrackers", function(info){
			  if(typeof info !== typeof [])
			  {
			  socket.send("error socketing: info for resign all is NOT in array form");
				return;
			  }
		  for(i = 0; i < info.length; i++)
			  {
			  
				  trackInfo = info[i];//string form
				  array = trackInfo.split("/");
				  if(array.length!=2)
					  {
					  socket.send("error socketing: string not appropriate in resign all at index: " + i);
						break;
					  }
				  dictionary = {"id":array[0], "field":array[1]}
				  resignInfo(dictionary);
				  
			  }
		  });
		  
		  socket.on('postMessage', function(info)
				  {
			  route(handle, "/resturant/postmessage", socket, info, trackers);
				  })
		  
		  socket.on('disconnect', function(){
			    console.log('user disconnected');
			    socket.isOn = false;
			  });
		});
	/*
	server.on('connection', function(socket){
		  console.log('a user connected2');
		  try{
			  socket.broadcast.emit('hi');}catch(err){console.log("connection is not socket")}
		  socket.on('disconnect', function(){
			    console.log('user disconnected');
			  });
		});*/
}
exports.start = start;

function stringFromIDAndField(id, field)
{
return (typeof id === 'string' && typeof field === 'string') ? id + "/" + field	: "error";
}
