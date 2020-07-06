/*
*	Author:shehan
*	Date:1/30/2019
*	
1. View all the current menu items

2. View all the recent orders in the system (orders placed in the last 24 hours)

3. Lookup the details of a specific order by order ID

4. View all the users who have signed up in the last 24 hours

5. Lookup the details of a specific user by email address

*
*/

const cli = {}
const util = require('util');
const debug = util.debuglog('cli');
const readline = require('readline'); 
const events = require('events');
const os = require('os');
const v8 = require('v8');
const _data = require('./data');
const fs = require('fs');
const path = require('path');

cli.responders = {};

class _events extends events{};

const e = new _events();

e.on("man",(str) => {
	cli.responders.man(str);
})
e.on("exit",function(str){
	cli.responders.exit();
})
e.on("stats",function(str){
	cli.responders.stats();
})
e.on("help",function(str){
	cli.responders.help();
})
e.on("menu items",function(str){
	console.log(str)
	str = ((typeof(str) == 'string') && (str.length > 0)) ? str.trim().split('--') : false;
	if (str && str[1]){
		if (str[0].trim() == "menu items" && str[1].trim() == "All"){
			cli.responders.menuItems(str[1].trim());
		}else if (str[0].trim() == "menu items" && str[1].trim()[0] == '(' && str[1].trim()[str[1].trim().length - 1] == ")"){
			str = str[1].replace('(','');
			str = str.replace(')','');
			str = str.trim() != '' ? str.trim() : false;
			if (str){
				cli.responders.menuItems(str);
			}else{
				console.log('missing input field')
			}
		}else{	
			console.log('wrong input')
		}
	} else {
		console.log('invalid input')
	}
})

e.on("orders",function(str){
	console.log(str)
	str = ((typeof(str) == 'string') && (str.length > 0)) ? str.trim().split('--') : false;
	if (str && str[1]){
		if (str[0].trim() == "orders" && str[1].trim() == "All"){
			cli.responders.orders(str[1].trim());
		}else if (str[0].trim() == "orders" && str[1].trim()[0] == '(' && str[1].trim()[str[1].trim().length - 1] == ")"){
			str = str[1].replace('(','');
			str = str.replace(')','');
			str = str.trim() != '' ? str.trim() : false;
			if (str){
				cli.responders.orders(str);
			}else{
				console.log('missing input field')
			}
		}else{	
			console.log('wrong input')
		}
	} else {
		console.log('invalid input')
	}
})

e.on("users",function(str){
	console.log(str)
	str = ((typeof(str) == 'string') && (str.length > 0)) ? str.trim().split('--') : false;
	if (str && str[1]){
		if (str[0].trim() == "users" && str[1].trim() == "All"){
			cli.responders.users(str[1].trim());
		}else if (str[0].trim() == "users" && str[1].trim()[0] == '(' && str[1].trim()[str[1].trim().length - 1] == ")"){
			str = str[1].replace('(','');
			str = str.replace(')','');
			str = str.trim() != '' ? str.trim() : false;
			if (str){
				cli.responders.users(str);
			}else{
				console.log('missing input field')
			}
		}else{	
			console.log('wrong input')
		}
	} else if (str[0] == 'users'){
		cli.responders.users(str[0].trim());
	} else {
		console.log('invalid input')
	}
	
})

cli.responders.users = function(str){
	let _baseDir = path.join(__dirname,'/../.data/users');
	if (str == 'All'){
		/*if (str.split('-').trim()[3] == 'f'){

		}*/
		fs.readdir(_baseDir+'/',function(err,itemData){
			fs.readdir(path.join(__dirname,'/../.logs/'),function(err,logData){
				let primary = [];
				let counter = 0;
				for (let i=0;i<logData.length;){
					if (logData[i].split('-')[0]){
						if (logData[i].split('-')[0].trim() != 'users'){
							//countinue
						}else{
							let number = logData[i].split('-')[2].replace('.json','');
							let newnum = '';
							for (let i = 0; i < 13; i++){
								newnum += number[i];
							}

							if (24 > (((Date.now()) - parseInt(newnum)) /  (1000 * 3600))){
								console.log(logData[i].split('-')[1])
							}

							cli.verticalSpace();
						}
						i++;
					}else{
						logData[i] = logData.splice(i,i);
					}
				}
			})
		})

	}else{
		fs.readdir(_baseDir,function(err,itemData){
			if (!err && itemData){
				console.log('Email Addresses were encrypted as they came into the system.')
				cli.horizantalLine(50);
				cli.verticalSpace();
				itemData.forEach(function(item){
					item = item.replace('.json','')
					console.log(item)
				})
				
			}else{
				console.log('no data')
			}
		})
	}
}
cli.responders.orders = function(str){
	let _baseDir = path.join(__dirname,'/../.data/orders');
	if (str == 'All'){
		fs.readdir(_baseDir+'/',function(err,itemData){
			fs.readdir(path.join(__dirname,'/../.logs/'),function(err,logData){
				let primary = [];
				let counter = 0;
				for (let i=0;i<logData.length;){
					if (logData[i].split('-')[0]){
						if (logData[i].split('-')[0].trim() != 'orders'){
							//countinue
						}else{
							let number = logData[i].split('-')[2].replace('.json','');
							let newnum = '';
							for (let i = 0; i < 13; i++){
								newnum += number[i];
							}

							if (24 > (((Date.now()) - parseInt(newnum)) /  (1000 * 3600))){
								console.log(logData[i].split('-')[1])
							}

							cli.verticalSpace();
						}
						i++;
					}else{
						logData[i] = logData.splice(i,i);
					}
				}
			})
		})
	}else{
		_data.read('orders',str,function(err,itemData){
			if (!err && itemData){
				itemData = JSON.parse(itemData);
				for (item in itemData){
					console.log(`${item} : ${itemData[item]}`);
					cli.verticalSpace();
				}
			}else{
				console.log('no data')
			}
		})
	}
}

cli.responders.menuItems = function(str){
	let _baseDir = path.join(__dirname,'/../.data/availableItems');
	if (str == 'All'){
		fs.readdir(_baseDir+'/',function(err,itemData){
			if (!err){
				itemData.forEach(function(item){
					cli.verticalSpace();
					item = item.replace('.json', '');
					console.log(item);
				})
			}else{
				cli.verticalSpace();
				console.log("error occured")
			}
		})
	}else{
		_data.read('availableItems',str,function(err,itemData){
			if (!err && itemData){
				itemData = JSON.parse(itemData);
				for (item in itemData){
					console.log(`${item} : ${itemData[item]}`);
					cli.verticalSpace();
				}
			}else{
				console.log('no data')
			}
		})
	}
}
//man/help
cli.responders.help = function(){
	let commands = {
		"man" : "ask for help(AKA:- manual)(show the help page)",
		"help" : "ask for help(show the help page)(Alias of 'man' command)",
		"exit" : "exit the CLI program and leave the rest of the application",
		"stats" : "get statistics of undeline operating system and resource utilisaction",
		"menu items --All" : "View all the recent menu items in the system",
		"menu items --([itemId])" : "Lookup the details of a specific menu item by menu ID",
		"orders --All" : "View all the recent orders in the system (orders placed in the last 24 hours)",
		"orders --([orderId])" : "Lookup the details of a specific order by order ID",
		"users" : "View all the users who have signed up in the last 24 hours",
		"users --([userId])" : "Lookup the details of a specific user by email address"
	}

	//show a header that drown all across the screen 
	cli.horizantalLine();
	cli.centered('CLI help');
	cli.horizantalLine();
	cli.verticalLine(2);

	//show each command followed by its explanation in yellow and white respectively
	for (let key in commands){
		if (commands.hasOwnProperty(key)){
			let value = commands[key];
			let line = '\x1b[33m' + key + '\x1b[0m';
			let padding = 60 - line.length;
			for (let i=0;i<padding;i++){
				line += ' ';
			}
			line += value;
			console.log(line);
			cli.verticalSpace();
		}
	}
	cli.verticalSpace();

	//endd with anothoer vertical line
	cli.horizantalLine();
}
//stats
cli.responders.stats = function(){
	let stats = {
		'Load Average' : os.loadavg().join(' '),
		'CPU Count' : os.cpus().length,
		'Free Memory' : os.freemem(),
		'Current Malloced Memory' : v8.getHeapStatistics().malloced_memory,
		'Current Malloced Used' : v8.getHeapStatistics().peak_malloced_memory,
		'Allocated Heap Used (%)' : Math.round((v8.getHeapStatistics().used_heap_size / v8.getHeapStatistics().total_heap_size) * 100),
		'Available Heap Allocated (%)' : Math.round((v8.getHeapStatistics().total_heap_size / v8.getHeapStatistics().heap_size_limit) * 100),
		'Uptime' : os.uptime() + ' seconds'
	}

	//show a header that drown all across the screen 
	cli.horizantalLine();
	cli.centered('SYSTEM STATISTICS');
	cli.horizantalLine();
	cli.verticalLine(2);

	//show each command followed by its explanation in yellow and white respectively
	for (let key in stats){
		if (stats.hasOwnProperty(key)){
			let value = stats[key];
			let line = '\x1b[33m' + key + '\x1b[0m';
			let padding = 60 - line.length;
			for (let i=0;i<padding;i++){
				line += ' ';
			}
			line += value;
			console.log(line);
			cli.verticalSpace();
		}
	}
	cli.verticalSpace();

	//endd with anothoer vertical line
	cli.horizantalLine();
}
//exit
cli.responders.exit = function(){
	console.log("exiting the program")
	process.exit(0);
}

cli.responders.man = function(str){
	let commands = {
		"man" : "ask for help(AKA:- manual)(show the help page)",
		"help" : "ask for help(show the help page)(Alias of 'man' command)",
		"exit" : "exit the CLI program and leave the rest of the application",
		"stats" : "get statistics of undeline operating system and resource utilisaction",
		"menu items --All" : "View all the recent menu items in the system",
		"menu items --([itemId])" : "Lookup the details of a specific menu item by menu ID",
		"orders --All" : "View all the recent orders in the system (orders placed in the last 24 hours)",
		"orders --([orderId])" : "Lookup the details of a specific order by order ID",
		"users --All" : "View all the users who have signed up in the last 24 hours",
		"users --([userId])" : "Lookup the details of a specific user by email address"
	}
	//show a header that drown all across the screen 
	cli.horizantalLine();
	cli.centered('CLI help');
	cli.horizantalLine();
	cli.verticalLine(2);

	//show each command followed by its explanation in yellow and white respectively
	for (let key in commands){
		if (commands.hasOwnProperty(key)){
			let value = commands[key];
			let line = '\x1b[33m' + key + '\x1b[0m';
			let padding = 60 - line.length;
			for (let i=0;i<padding;i++){
				line += ' ';
			}
			line += value;
			console.log(line);
			cli.verticalSpace();
		}
	}
	cli.verticalSpace();

	//endd with anothoer vertical line
	cli.horizantalLine();

}

cli.verticalSpace = function(lines){
	lines = typeof(lines) == "number" && lines > 0 ? lines : 1;
	for (let i=0; i < lines;i++){
		console.log('');
	}
}

cli.horizantalLine = function(){
	//get the available screen size
	let lines = '';
	let width = process.stdout.columns;
	for (let i=0; i<width;i++){
		lines += '-';
	}
	console.log(lines);
}

cli.centered = function(str){
	str = typeof(str) == "string" && str.trim().length > 0 ? str : '';
	//get the available screen size
	let width = process.stdout.columns;
	let render = "";
	let centerPos = (Math.floor(width - str.length) / (2 * 15));
	for (let i=0; i< centerPos; i++){
		render += " ";
	}
	render += str;
	console.log(render);
}

cli.verticalLine = function(lines){
	lines = typeof(lines) == "string" ? lines : 0;
	for (let i=0; i< lines; i++){
		console.log('');
	}
}


cli.processInput = function(str){
	str = typeof(str) == 'string' && str.trim().length > 0 ? str.trim() : false;
	//only process when user write somthing to the console

	if (str){
		let availableCommands = [
			"man",
			"help",
			"exit",
			"stats",
			"menu items" ,
			"orders" ,
			"users" 
		]
		// go through possible emmit event when the match found
		let matchFound =false;
		let counter = 0;
		availableCommands.some(function(input){
			if (str.toLowerCase().indexOf(input) > -1){
				matchFound = true;
				e.emit(input,str)
				return true;
			}
		})
		//if no match is found tell the user to try again
		if (!matchFound){
			console.log("sorry try again!")
		}
	}
}

cli.init = function(){
	//send the start up message to the console
	console.log('\x1b[35m%s\x1b[0m',`CLI is now listening to input`);
	//debug('\x1b[35m%s\x1b[0m',`CLI is now listening to input`);

	let _interface = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
		promt: '>'
	})
	_interface.prompt();

	//handle each line that write
	_interface.on('line',function(str){
		//send to the input processor
		cli.processInput(str);
		//reinit the process afterwards
		_interface.prompt();
	})

	_interface.on('close',function(){
		//exit the process
		process.exit(0);
	})


}

module.exports = cli;