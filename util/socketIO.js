var jwt = require("jsonwebtoken");
const globalchanel = require("../app/models/Globalchanel"); // its a model

var onlineUsers = [];
socketIO = (app) => {
  var server = require("http").Server(app);
  var io = require("socket.io")(server);
  const port = process.env.PORT || 3000;

  //
  io.on("connect", (socket) => {
    var accessToken;
    var userData;
    var cookies = socket.handshake.headers.cookie;
    if (cookies.indexOf(";") >= 0) {
      cookies = cookies.split(";");
      for (let cookie of cookies) {
        cookie.startsWith("accessToken") || cookie.startsWith(" accessToken")
          ? (accessToken = cookie.split("=")[1])
          : (accessToken = "noToken");
      }
    }
    cookies.startsWith("accessToken")
      ? (accessToken = cookies.split("=")[1])
      : (accessToken = "noToken");
    jwt.verify(
      accessToken,
      `${process.env.JWT_SECRET_KEY}`,
      function (err, decoded) {
        var dupUser = false;
        var userDataId = decoded.userId;
        socketId = socket.id;
        for (onlineUser of onlineUsers) {
          if (userDataId === onlineUser.userId) {
            dupUser = true;
          }
        }
        dupUser
          ? true
          : onlineUsers.push({ userId: userDataId, socketId: socketId });
        // console.log(onlineUsers);
      }
    );
    // console.log(socket.id);
    // console.log(socket.rooms);
    socket.on("globalChanel", (data) => {
      if (data.accessToken) {
        jwt.verify(
          data.accessToken,
          `${process.env.JWT_SECRET_KEY}`,
          function (err, decoded) {
            try {
              if (decoded.userName) {
                // get time
                var date = new Date();
                var month = [
                  "Jan",
                  "Feb",
                  "Mar",
                  "Apr",
                  "May",
                  "Jun",
                  "Jul",
                  "Aug",
                  "Sep",
                  "Oct",
                  "Nov",
                  "Dec",
                ];
                var time = `${date.getHours()}:${date.getMinutes()} ${date.getDate()} ${
                  month[date.getMonth()]
                }`;
                //create message to send to global room
                sendGlobalChanel = {
                  userAvatar: decoded.avatar,
                  userName: decoded.userName,
                  message: data.message,
                  time: time,
                };
                // create database
                const newGlobalchanel = new globalchanel({
                  message: data.message,
                  user: decoded.userId,
                });
                newGlobalchanel.save(function (err) {
                  if (err) return console.log("mongoDBerr" + err);
                  // saved!
                  // console.log("DB saved!");
                });
                // emit to all client
                io.emit("globalChanel", sendGlobalChanel);
              }
            } catch (error) {
              console.log(error);
            }
          }
        );
      }
    });
    socket.on("disconnect", () => {
      console.log(socket.id);
      onlineUsers.forEach((onlineUser, index) => {
        onlineUser.socketId === socket.id
          ? onlineUsers.splice(index, 1) // delete user disconnected
          : false;
      });
      // console.log(onlineUsers);
    });
  });
  server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
};

module.exports = socketIO;
