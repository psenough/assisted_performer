
	var thishaiku;
	
	var metagenhaiku = {"genhaikus":{"Spring1":{"forms":{"Form1":{"first":{"0":[2,"Flutteringly,"]},"second":{"0":[28,"Floating"],"1":[30,"in"],"2":["27","the"],"3":[7,"breeze,"]},"third":{"0":[13,"A"],"1":[28,"single"],"2":[30,"butterfly."]}}},"wordlists":{"Flutteringly,":["Flutteringly,","Suddenly,","Passionately,","Surprisingly,"],"Floating":["floating","drifting","crying","swimming"],"in":["in","on","over","under"],"the":["the","my","your","our"],"breeze,":["breeze,","river,","clouds,","trees,"],"A":["a","a","my","one"],"single":["single","lonely","lost","brave"],"butterfly.":["butterfly.","grasshopper.","flower.","sigh."]}},"Spring2":{"forms":{"Form1":{"first":{"0":[10,"Wings"],"1":[31,"flutter"]},"second":{"0":[11,"upon"],"1":[28,"melting"],"2":[12,"icicles"]},"third":{"0":[18,"first"],"1":[8,"glimpse"],"2":[0,"of"],"3":[26,"spring"]}}},"wordlists":{"Wings":["Wings","Words","Dreams","Thoughts"],"flutter":["flutter","float","dive","spread"],"upon":["upon","across","over","inside"],"melting":["melting","drowning","frozen","thawning"],"icicles":["icicles","mountains","lakes","forests"],"first":["first","my","your","short"],"glimpse":["glimpse","thought","insight","memory"],"of":["of"],"spring":["Spring","you","warmth","love"]}},"Spring3":{"forms":{"Form1":{"first":{"0":[23,"Longing"]},"second":{"0":[15,"another"],"1":[1,"Spring"],"2":[28,"blooms"]},"third":{"0":[5,"without"],"1":[11,"you"]}}},"wordlists":{"Longing":["Longing","Waiting","Saudade","Sleeping"],"another":["another","lazy","this","silent"],"Spring":["Spring","child","thought","day"],"blooms":["blooms","flowers","awakens","walks"],"without":["without","within","withelding","willowing"],"you":["you","love","me","haste"]}},"Summer1":{"forms":{"Form1":{"first":{"0":[19,"Your"],"1":[6,"wet"],"2":[21,"skin"]},"second":{"0":[25,"watermelon"],"1":[24,"seeds"]},"third":{"0":[4,"this"],"1":[17,"hot"],"2":[24,"sand"]}}},"wordlists":{"Your":["Your","My","Our","This"],"wet":["wet","damp","tanned","biting"],"skin":["skin","lust","craving","love"],"watermelon":["watermelon","apricot","papaya","mango"],"seeds":["seeds","juice","seduction","devotion"],"this":["this","over","our","burning"],"hot":["hot","wet","white","black"],"sand":["sand","spray","tide","dunes"]}},"Autumn1":{"forms":{"Form1":{"first":{"0":[11,"Golden"],"1":["12","red"]},"second":{"0":[28,"grey"],"1":[10,"skies"],"2":["14","warm"],"3":[0,"clothes"],"4":[8,"soft"],"5":[13,"smile"]},"third":{"0":[2,"nostalgic"]}}},"wordlists":{"Golden":["Golden","Brownish","Yellow","Orange"],"red":["red","tone","day","leaf"],"grey":["grey","tall","long","tame"],"skies":["skies,","clouds,","eyes,","winds,"],"warm":["warm","wet","damp","itchy"],"clothes":["clothes,","jacket,","blanket,","sofa,"],"soft":["soft","warm","happy","sleepy"],"smile":["smile","kitty","heart","hugs"],"nostalgic":["nostalgy","memory","perfect day","fireplace"]}},"Winter1":{"forms":{"Form1":{"first":{"0":[1,"Winter"],"1":[5,"solitude"]},"second":{"0":[21,"in"],"1":[5,"a"],"2":[30,"world"],"3":["22","of"],"4":["23","one"],"5":[18,"color"]},"third":{"0":[10,"the"],"1":["2","sound"],"2":[17,"of"],"3":[19,"wind"]}}},"wordlists":{"Winter":["Winter","Coldest","Darkest","Solstice"],"solitude":["solitude","isolation","seclusion","settled"],"in":["in","in","on","from"],"a":["a","the","my","this"],"world":["world","view","night","time"],"of":["of","of","of","of"],"one":["one","one","no","grey"],"color":["color","sight","form","dream"],"the":["the","my","our","this"],"sound":["sound","smell","cold","threat"],"wind":["wind","ice","snow","rain"]}},"Autumn2":{"forms":{"Form1":{"first":{"0":[12,"Early"],"1":[0,"petrichor"]},"second":{"0":[20,"fallen"],"1":[26,"leaves"],"2":[26,"hide"],"3":[0,"this"],"4":[7,"path"]},"third":{"0":[0,"finding"],"1":[10,"scarves"]}}},"wordlists":{"Early":["Early","Cozy","Lazy","Fuzzy"],"petrichor":["petrichor","matriarch","memory","seance"],"fallen":["fallen","red-brown","yellow","season"],"leaves":["leaves","traits","schemes","hands"],"hide":["hide","cover","take","control"],"this":["this","our","my","the"],"path":["path","way"],"finding":["finding","brand new","wearing","layer"],"scarves":["scarves","clothes","mittens","blankets"]}}}};

	
	function initHaiku(haiku_name) {
		metagenhaiku.addGenHaiku = function( genhaikuname, genhaikuarray ) {
    		metagenhaiku.genhaikus[genhaikuname] = genhaikuarray;
   		}
		var ourgenhaiku = metagenhaiku.genhaikus[haiku_name];
		thishaiku = new GenHaiku();
		thishaiku.wordlists = ourgenhaiku.wordlists;
		thishaiku.forms = ourgenhaiku.forms;
	}
	
	// function to get a word form an array, based on ourmd5 index value (limited to 0..16)
	function getword(ourmd5, varthing, arraything) {
		var thisvar = parseInt("0x"+ourmd5.charAt(varthing));
	 	return arraything[thisvar % arraything.length];
	}

// javascript doesnt support associative arrays, but i want to use them, so i reimplemented the wheel
	function getAssociativeArrayLength(thisarray) {
		var ind = 0;
		for (i in thisarray)
		{
			ind++;
		}
		return ind;
	}
	
	function getAssociativeArrayByIndex(thisarray, index) {
		var ind = 0;
		for (i in thisarray)
		{
			if (index == ind) return thisarray[i];
			ind++;
		}
	}

	function GenHaiku () {
    	this.forms = {};
    	this.wordlists = {};

    	this.getHaiku = function( ourmd5 ) {
    		var ourhaiku = '';
    		var first = '';
    		var second = '';
    		var third = '';

			var thisform = getAssociativeArrayByIndex(this.forms, parseInt("0x"+ourmd5.charAt(10)) % getAssociativeArrayLength(this.forms));
	 	
			var ourarray;
			var i;
			
    		ourarray = thisform.first;
    		for (i in ourarray)
			{
				first += getword( ourmd5, ourarray[i][0], this.wordlists[ourarray[i][1]] ) + " ";
			}
			
    		ourarray = thisform.second;
    		for (i in ourarray)
			{
				second += getword( ourmd5, ourarray[i][0], this.wordlists[ourarray[i][1]] ) + " ";
			}
			
    		ourarray = thisform.third;
    		for (i in ourarray)
			{
				third += getword( ourmd5, ourarray[i][0], this.wordlists[ourarray[i][1]] ) + " ";
			}
			
			haiku[0] = first;
			haiku[1] = second;
			haiku[2] = third;
			
			ourhaiku = first + '<br />' + second + '<br />' + third;
			return ourhaiku;
    	}
    
	}

	function MetaGenHaiku () {
		this.genhaikus = {};
    	this.addGenHaiku = function( genhaikuname, genhaikuarray ) {
    		this.genhaikus[genhaikuname] = genhaikuarray;
   		}
	}