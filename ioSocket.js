const { Server } = require('socket.io')
const path = require('path');
const { plqs, plqGn} = require(path.join(__dirname, "repositorys",'client-repository.js'));
const { SECRET_JWT_KEY } = require(path.join(__dirname, "repositorys", "config.js"));
const  jwt = require('jsonwebtoken');


const io = new Server()

io.on('connection', (socket) =>{

	// ingresar el socket a la habitacion que se le asigno en server.js
	let room = socket.route
	if (room){socket.join(room)}

	console.log("un usuario se ha conectado")
	try{
		
		jwt.verify(socket.access_token, SECRET_JWT_KEY);

		if(socket.rooms.has('RoomAdmin')){
			socket.on('disconnect', ()=>{console.log("un usuario se ha desconectaado")})

			socket.on('upturn', (silla)=>{
				let plq = plqs.find((plq) => plq.silla === silla);
				let upturnRes = plq.upTurn()

				// Este es el evento que se envia a los usuarios de Panel y Index
				if (upturnRes){
					io.emit('upturnRES', upturnRes)
				}
			})

			
			socket.on("downturn", (silla)=> {
				let plq = plqs.find((plq) => plq.silla === silla);
				let downTurnRes = plq.downTurn()
				io.emit("downturnRES", downTurnRes)
			})

			socket.on("newClient", (name, silla) => {

				let plq = plqs.find((plq) => plq.silla === silla)
				let newClientForSend = plq.addClient(name)

				io.emit("newClientRES", newClientForSend)

			})



			socket.on("decline", (msg)=>{

				let plq = plqs.find((plq) => plq.silla === msg.silla);
				let res = plq.declineClient(msg.id)
				io.emit("declineRES", res)
			})

			socket.on("desDecline", (msg) => {
				let plq = plqs.find((plq) => plq.silla === msg.silla);
				let res = plq.desDecline(msg.id)
				io.emit("desDeclineRES", res)
			})

			socket.on('openAndClose', (silla) => {
				let plq = plqs.find((plq) => plq.silla === silla);
				let res = plq.openAndClose()
				io.emit("openAndCloseRES", res)
			})

			socket.on('changeName', (msg)=>{
				let res= plqGn.changeName(msg.id, msg.newName)
				io.emit("changeNameRES", res)
			})
		}
	}catch (e){

	}









})



module.exports = {io, plqs}