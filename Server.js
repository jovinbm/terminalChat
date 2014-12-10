/**
 * Created by jovinbm on 11/29/14.
 */
var net = require('net');
var fs = require('fs');
var port = 4000; //replace this with your own port
var server = net.createServer();
var sockets = [];

//a text file to save history for the ongoing chat - replace it with your own path
var file = fs.createWriteStream('history.txt');

server.on('connection', function(socket){
    console.log('got a new connection');

    var welcome = new Buffer('Welcome to the chat. Here is what you missed\n');
    socket.write(welcome);

    fs.open('history.txt',
        'r',
        function(err, fd){
        var file2 = fs.createReadStream(null, {fd: fd, encoding: 'utf8'});
        file2.on('data', function(data){
            socket.write(data);
        })
    });

    sockets.forEach(function(othersocket){
        if(othersocket != socket){
            othersocket.write(othersocket.remoteAddress + ' joined the chat\n');
        }
    });

    sockets.push(socket);

    socket.on('data', function(data){
        console.log('got data');
        file.write(socket.remoteAddress + ' > ' + data);

        sockets.forEach(function(othersocket){
            if(othersocket != socket){
                othersocket.write(othersocket.remoteAddress + ' > ' + data);
            }
        });
    });

    socket.on('close', function(){
        console.log('connection closed');
        var index = sockets.indexOf(socket);
        sockets.forEach(function(othersocket){
            if(othersocket != socket){
                othersocket.write(othersocket.remoteAddress + ' left the chat\n');
            }
        });
        sockets.splice(index, 1);
    });
});

server.on('error', function(err){
    console.log('Server error:', err.message);
});

server.on('close', function(){
    console.log('Server closed');
});

server.listen(port); // go to terminal and telnet to localhost:port

// telnet localhost:port