const fs = require('fs');

/*
//
// filter pouet data dump and store outline online 2020 prods
//
fs.readFile('pouetdatadump-prods-20210707.json', (err, data) => {
    if (err) throw err;
    let pouetdump = JSON.parse(data);
	console.log("# prods " + pouetdump["prods"].length);
	var filtered = pouetdump["prods"].filter( item => item["party"]?item["party"]["id"] == "1918":false );
	var invitations = pouetdump["prods"].filter( item => item["invitation"] == "1918" );
	console.log("filtered " + filtered.length + " released prods and " + invitations.length + " invitation(s)");
	combinedArr = filtered.concat(invitations);
	let dataoutput = JSON.stringify(combinedArr);
	fs.writeFileSync('novoque_2020.json', dataoutput);
});
*/

/*
function getStuffFromParty(partyid) {
	var filtered = pouetdump["prods"].filter( item => item["party"]?item["party"]["id"] == partyid:false );
	var invitations = pouetdump["prods"].filter( item => item["invitation"] == partyid );
	console.log("filtered " + filtered.length + " released prods and " + invitations.length + " invitation(s)");
	combinedArr = filtered.concat(invitations);
	return combinedArr;
}

let pouetdump;

//
// filter pouet data dump and store all outlineprods
//
fs.readFile('pouetdatadump-prods-20210707.json', (err, data) => {
    if (err) throw err;
    pouetdump = JSON.parse(data);
	console.log("# prods " + pouetdump["prods"].length);
	
	//novoque
	combinedArrTotal = getStuffFromParty("1918");
	
	//evoke
	combinedArrTotal = combinedArrTotal.concat(getStuffFromParty("18"));
	
	//nova
	combinedArrTotal = combinedArrTotal.concat(getStuffFromParty("1808"));
	
	//sundown
	combinedArrTotal = combinedArrTotal.concat(getStuffFromParty("523"));

	//sunrise
	combinedArrTotal = combinedArrTotal.concat(getStuffFromParty("1578"));
		
	let dataoutput = JSON.stringify(combinedArrTotal);
	fs.writeFileSync('all_prods.json', dataoutput);
});
*/


//
// extract data from a prods list
//
fs.readFile('all_prods.json', (err, data) => {
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
				'ascii','ansi','beer','water','floppy','echo','kolsch','cologne','koln','fishing','budleigh','germany','england',
				'faq','blue','red','green','cyan','magenta','yellow','orange','grey','gray','pink','white','black','light','pixel','plot','console',
				'tris','quad','quads','points','coords','origin','vector','attack','sustain','decay','release','vinyl','tape','deck','screen','projector','bigscreen','disc','pool',
				'password','pass','word','firefly','starwars','startrek','starwreck','index','mysql','php','python','hash','sha','goto','to','from','at',
				'slideshow','ps','kb','txt','results','party','prods','prod','computer','console','boot','bootsector','chipmusic','chiptune','chip','game','mac','anim',
				'register','twitch','outreach','jungle','dnb','massive','chill','bbq','cc','summer','winter','autumn','spring','bi','io',
				'party','location','hall','partyhall','sleeping','sleepingarea','hotel','beds','type','bottle','magazine','zine','mag',
				'notebook','laptop','pc','de','be','nl','dk','se','pl','fr','pt','es','uk','gb','tb','mb','kb','byte','bytes','editor','edit',
				'native','new','old','oldschool','retro','emu','retroemu','cables','cable','hdmi','ethernet','nocarrier','noc','dial','dialing','network',
				'cpu','audio','video','mos','ntsc','pal','ram','input','color','controller','djset',
				'aa','ab','ac','ad','ae','af','ba','bb','bc','bd','be','bf','ca','cb','cc','cd','ce','cf','da','db','dc','dd','de','df','ea','eb','ec','ed','ee','ef','fa','fb','fc','fd','fe','ff','dj','42','64','32','16','128b','256b','512b','64b','64kb','4kb','0','1','2','3','4','5','6','7','8','9',
				'foo','bar','foobar','winamp','mpt','modplug','bass','files','root','test','temp','default','entry','prize',
				'demoparty','demoscene','demo','atari','intro','dentro','remote','submission','compo','entry','vote','livevote','namevote','pouet','demozoo','demotopia'];
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
	
	var file = fs.createWriteStream('all_prods.dic');
	file.on('error', function(err) { console.log(err); });
	ordered_words.forEach(function(v) { file.write(v + '\n'); });
	file.end();

});

console.log('This is after the read call');
