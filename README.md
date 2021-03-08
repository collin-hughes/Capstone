# Collin Hughes's Capstone Project - SUNY Polytechnic Institute CS 498
A video conferencing software designed for business to install locally on their servers, bypassing centralized services like Zoom. 

For more information, view the proposal here: https://www.cs.sunyit.edu/~hughesc4/cs498/docs/projectproposal.html

## Build Instructions
To build, first install Node.JS and MongoDB.

NodeJS can be found here: https://nodejs.org/en/

MongoDB can be found here: https://www.mongodb.com/try/download/community

Next, setup MongoDB. Open the MongoDB Compass Community Application and connect to the localhost server. Select "Create Database" and create a database called "conferencedb" and a collection called "users" then select "Create Database." This will create a new MongoDB database hosted locally.

Download the source code for the project and extract it. Go into the config and change the databaseconfig.json file, alterting the value of MongoURI to be your database. If the previously created database was "conferencedb," then nothing has to be done here. Save this file.

Generate a key.pem and cert.pem using OpenSSL. Place the resulting files in the "config" directory.

Next, open a terminal window in this file. Run the command "npm -i videoconferenceapp." This will install all dependencies. Then run the command "npm run start." This will launch the application. 

## Use Instructions
Open **CHROME**, and connect to the ip address of the hosting system, appending the port. By default, this is port 5000. For example: "https://localhost:5000/" would connect to the application hosted locally.

Next, create an account or log in if one already exists. Once logged in, select "Create Room" or join an existing one my pasting the room code in the box and select "Join Room." Allow access to the video camera and microphone. You will then be connected. Distribute the room code to all who want to join that room.




