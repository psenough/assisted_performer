const fs = require('fs');

/*
//
// filter pouet data dump and store outline online 2020 prods
//
fs.readFile('pouetdatadump-prods-20210421.json', (err, data) => {
    if (err) throw err;
    let pouetdump = JSON.parse(data);
	console.log("# prods " + pouetdump["prods"].length);
	var filtered = pouetdump["prods"].filter( item => item["party"]?item["party"]["id"] == "1910":false );
	var invitations = pouetdump["prods"].filter( item => item["invitation"] == "1910" );
	console.log("filtered " + filtered.length + " released prods and " + invitations.length + " invitation(s)");
	combinedArr = filtered.concat(invitations);
	let dataoutput = JSON.stringify(combinedArr);
	fs.writeFileSync('outline_online_2020.json', dataoutput);
});
*/

/*
//
// filter pouet data dump and store all outlineprods
//
fs.readFile('pouetdatadump-prods-20210421.json', (err, data) => {
    if (err) throw err;
    let pouetdump = JSON.parse(data);
	console.log("# prods " + pouetdump["prods"].length);
	var filtered = pouetdump["prods"].filter( item => item["party"]?item["party"]["id"] == "1910":false );
	var invitations = pouetdump["prods"].filter( item => item["invitation"] == "1910" );
	console.log("filtered " + filtered.length + " released prods and " + invitations.length + " invitation(s)");
	combinedArr = filtered.concat(invitations);
	var filtered2 = pouetdump["prods"].filter( item => item["party"]?item["party"]["id"] == "652":false );
	var invitations2 = pouetdump["prods"].filter( item => item["invitation"] == "652" );
	console.log("filtered " + filtered2.length + " released prods and " + invitations2.length + " invitation(s)");
	combinedArr2 = filtered2.concat(invitations2);
	combinedArr3 = combinedArr.concat(combinedArr2);
	let dataoutput = JSON.stringify(combinedArr3);
	fs.writeFileSync('all_outline_prods.json', dataoutput);
});
*/


//
// extract data from a prods list
//
fs.readFile('all_outline_prods.json', (err, data) => {
    if (err) throw err;
    let pouetdump = JSON.parse(data);
	console.log("# prods " + pouetdump.length);
	
	let words = [];
	
	var top5 = pouetdump;//.filter( item => item["placings"].length>0?item["placings"][0]["ranking"] < 5:false );
	for (let i=0; i<top5.length; i++){
		words[words.length]=top5[i]["name"].toLowerCase().split(" ").join("");
		if (top5[i]["groups"] != undefined) {
			for(let j=0;j<top5[i]["groups"].length; j++) {
				words[words.length]=top5[i]["groups"][j]["name"].toLowerCase().split(" ").join("");
				words[words.length]=top5[i]["groups"][j]["acronym"].toLowerCase().split(" ").join("");
			}
		}
		if (top5[i]["credits"] != undefined) {
			for(let j=0;j<top5[i]["credits"].length; j++) {
				words[words.length]=top5[i]["credits"][j]["user"]["nickname"].toLowerCase().split(" ").join("");
			}
		}
		let obj = Object.values(top5[i]["platforms"]);
		for(let j=0;j<obj.length; j++) {
				words[words.length]=obj[j]["name"].toLowerCase().split(" ").join("");
		}
	}
	
	extrawords = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',
				'holland','outline','shader','showdown','eersel','lievelde','braamt','zevenaar','netherlands','ascii','ansi','beer','water','acid','floppy','echo',
				'dick','jazz','fizz','bang','buzz','quiz','zoom','hoax','dose','daze','hack','coax','calx','exec','zits','hype','jugs','tits','pack','disk','wank','work','wake',
				'faq','aqua','blue','red','green','cyan','magenta','yellow','pastel','orange','grey','gray','pink','white','black','light','pixel','plot','teletext','console',
				'tris','quad','quads','points','coords','origin','vector','attack','sustain','decay','release','vinyl','tape','deck','screen','projector','bigscreen','disc','pool',
				'password','salt','pass','word','multipass','firefly','starwars','startrek','starwreck','index','mysql','php','python','hash','sha','goto','to','from','at','ignite',
				'slideshow','crem','dbug','ps','kb','txt','results','party','prods','prod','computer','console','boot','bootsector','chipmusic','chiptune','chip','game','mac','anim',
				'register','twitch','outreach','boozedrome','jumpstyle','jungle','dnb','massive','chill','bbq','cc','summer','winter','autumn','spring','bi','io',
				'party','location','hall','partyhall','sleeping','sleepingarea','hotel','beds','tent','tents','type','opener','bottle','magazine','zine','mag','rock','joy',
				'meadow','nap','schnapps','notebook','laptop','pc','de','be','nl','dk','se','pl','fr','pt','es','uk','gb','tb','mb','kb','byte','bytes','editor','edit',
				'native','new','old','oldschool','retro','emu','retroemu','cables','cable','hdmi','ethernet','nocarrier','noc','dial','dialing','network',
				'breakpoint','tum','numerica','vcs','blockparty','gathering','tg','revision','sundown','evoke','main','ghettoscene','harmonica','come','play','igor',
				'you','should','totally','but','like','really','rock','grass','expansion','cpu','audio','video','mos','ntsc','pal','ram','jr','input','color','controller','mindlink','sears','heavy','sixer','light','irish','switch','darth','vader','atarijr','starpath','secam','tia','gameline','yoko','coleco',
				'pacman','pitfall','asteroids','invaders','space','atlantis','adventure','kaboom','riverraid','raid','steve','cartwright','david','crane','tod','frye','rob','fulop','larry','kaplan','garry','kitchen','carla','meninsky','alan','miller','warren','robinett','carol','shaw','peter','halin',
				'vault','flashback','spectravideo','sega','telesys','tigervision','xonox','zimag','imagic','activision','imagic','dataage',
				'havoc','wurstgetrank','beftex','mantratronic','racoonviolet','spiny','thebat','brittle','dipswitch','mrc','fixato','anus','synesthesia','rich','zinko',
				'franky','britelite','mabra','darya','tma','felice','fready','tater','crazyq','gopher','byteobserver','fmscat','quarryman','nodepond','kali','kb','moqui','vitalkanev','grz','spiikki','djay','zootime','darkstone','dan','txg','tmc','tronic','flibblesan','tcm','roccow','kabuto','harekiet','tinker','dkb','avoozl','bitnenfer','aki','superogue','deved','anticore','deadline','trawen','dman','lamerdeluxe','superstande','critikill','muffintrap','turboknight','facet','eightbm','cih','rrrola','aldroid','cmdrhomer','ggn','dojoe','dad','totetmatt',
				'aa','ab','ac','ad','ae','af','ba','bb','bc','bd','be','bf','ca','cb','cc','cd','ce','cf','da','db','dc','dd','de','df','ea','eb','ec','ed','ee','ef','fa','fb','fc','fd','fe','ff','dj','42','68','32','16','13',
				'stay','atari2600','2600','atarivcs','vcs','6502','128b','256b','512b','64b','64kb','4kb','0','1','2','3','4','5','6','7','8','9',
				'job','foo','bar','foobar','winamp','mpt','modplug','bass','files','root','test','temp','default','password','admin','desktop','server','fuck','entry','prize',
				'numtek','homski','turboanalisis','staying','alive','demoparty','demoscene','sofaworld','sofa','fridge','snacks','fluid','dynamics','highend','willemsoord','golf','golfcart','cart','pez','hat','swag','wuhu',
				'demoparty','demo','atari','intro','dentro','remote','submission','compo','entry','vote','livevote','namevote','falcon','midi','pouet','demozoo','demotopia',
				'adc','and','asl','bit','bpl','bmi','bvc','bcc','bcs','bne','beq','brk','cmp','cpx','cpy','dec','eor','clc','sec','cli','sei','clv','cld','sed','inc','jmp','jsr','lda','ldx','ldy','lsr','nop','ora','tax','txa','dex','inx','tay','tya','dey','iny','rol','ror','rti','rts','sbc','sta','stx','sty'];
	words = words.concat(extrawords);
	// add extra words: outline, location names, shader showdown, organizer names, byte battle, dj set names, tic80, registered users
	
	ordered_words = words.filter(function (value, index, array) {
		let format = /[^a-zA-Z0-9]+/; //TODO: hack wiz to accept words with numbers so we can add 0-9 to this regex
		if (format.test(value)==true) return false;
		if (value == '') return false;
		if (value.length > 14) return false;
		return array.indexOf(value) == index;
	});
	
	ordered_words.sort();
	
	console.log(ordered_words);
	
	var file = fs.createWriteStream('all_outline_prods.dic');
	file.on('error', function(err) { console.log(err); });
	ordered_words.forEach(function(v) { file.write(v + '\n'); });
	file.end();

});

console.log('This is after the read call');


