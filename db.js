var config = require('./config.js');
var pg = require('pg');

// Change to config.pg_local_url if working on local
var pgURL = config.pg_dokku_url;
// var pgURL = config.pg_local_url;

function pgQuery(queryString, callback) {
    pg.connect(pgURL, function(err, client, done) {
        if (err) {
            callback(err);
        }
        client.query(queryString, function(err, result) {
            if (err) {
                return console.error('Error running query ', err);
            }
            callback(null, result);
            client.end();
        });
                
    });
}

module.exports = {
    insertMessage: function(chatRoom, username, message, unix_time, callback) {
        var insertMessageQueryString = 'INSERT INTO message VALUES (\'' + chatRoom + '\',\'' + username + '\',\'' + message + '\', to_timestamp(' + unix_time + '))';
        console.log(insertMessageQueryString);
        pgQuery(insertMessageQueryString, function(err) {
            if (err) {
                callback(err);
            } else {
                callback(null);
            }
        });
    },
    getMessages: function(chatRoom, limit, timeZoneOffsetHours, callback) {
        var getMessagesQueryString = 'SELECT username, msg, to_char((time - interval \'' + timeZoneOffsetHours + ' hours\'), \'HH:MI\') as time FROM message JOIN chat_room ON chat_room.room_name=message.room_name WHERE chat_room.room_name=\'' + chatRoom + '\'' + ' LIMIT ' + limit;
        console.log(getMessagesQueryString);
        pgQuery(getMessagesQueryString, function(err, result) {
            if (err) {
                callback(err);
            } else {
                callback(null, result.rows);
            }
        });
    },
    getChatRooms: function(callback) {
        pgQuery('SELECT room_name FROM chat_room', function(err, result) {
            if (err) {
                callback(err);
            } else {
                callback(null, result.rows);
            }
        });
    }
};
