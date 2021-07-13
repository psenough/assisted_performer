const fs = require('fs');
const readline = require('readline');

let wizium_file = 'evoke_test_6.wiz';
let export_html = true;
let export_html_filename = 'public/crosswords.html';
let export_json = true;
let export_json_filename = 'export.json';
let export_hints_template = true;
let export_hints_template_filename = 'export_hints_template.html';
let include_hints_in_crosswords_html = true;

let htmlout = '';
let jsonout = '{';
let hintsout = '';

fs.readFile('crosswords_html_header.txt', (error, txtString) => {
    if (error) throw err;
    htmlout = txtString.toString();
	htmlout += '<div style="float: left">\n';
	
	if (include_hints_in_crosswords_html == false) hintsout = txtString.toString();
	hintsout += '<div class="hints">\n<table class="maintable">\n<thead>\n<td><b>Across</b></td>\n<td>&nbsp;</td>\n<td><b>Down</b></td>\n</thead>\n<tr>\n<td valign="top"><table>\n';

	fs.readFile(wizium_file, (err, data) => {
		if (err) throw err;

		let arr = data.toString().replace(/ */g,"").replace(/\r\n/g,'\n').split('\n');
		let filt =  arr.filter(function(el, index) { return index % 2 === 0; });

		//console.log(filt);
		let ncols = filt[0].length * 37;
		let nrows = filt.length * 37;
		
		htmlout += '<div style="border-width:0px;width:'+ncols+'px;height:'+nrows+'px;position:relative;">\n';
		htmlout += '<div id="grid" style="border-width:0px;top:0px;left:0px;width:'+ncols+'px;height:'+nrows+'px;position:absolute;">\n';
		
		let tempverthints = '';
		
		word_count_starts = 1;

		for(let i=0; i<filt.length; i++) {
			//console.log(filt[i]);
			for(let j=0; j<filt[i].length; j++) {

				if (filt[i][j] == '#') {
					htmlout += '<div class="bk" data-x="'+j+'" data-y="'+i+'" style="left:'+(36*j+1)+'px;top:'+(36*i+1)+'px;"></div>\n';
				} else {
					htmlout += '<div class="bk" data-x="'+j+'" data-y="'+i+'" style="left:'+(36*j+1)+'px;top:'+(36*i+1)+'px;border-top:#DEDEDE 36px solid;"><input type="text" minlength="1" maxlength="1" size="1"></div>\n';
				}
				let dirty = false;
				
				// check horizontal words
				if ((j-1 < 0) || (filt[i][j-1] == '#')) {
					// start of a vertical word
					let word = '';
					for (k=j;k<filt[i].length; k++) {
						if (filt[i][k] != '#') {
							word += filt[i][k];
						} else {
							break;
						}
					}
					if (word.length > 1) {
						jsonout += '\"H'+word_count_starts+'\":\{\"word\":"'+word+'\",\"x\":'+(j+1)+',\"y\":'+(i+1)+'},';
						htmlout += '<div class="nu" data-x="'+j+'" data-y="'+i+'" data-hint="'+word_count_starts+'" style="left:'+(36*j+4)+'px;top:'+(36*i+1)+'px;color:000000;text-align:left" >'+word_count_starts+'</div>\n';
						hintsout += '<tr><td width="0" align="right" valign="top"><b>'+word_count_starts+'</b></td>\n';
						hintsout += '<td valign="top">'+word+'('+word.length+')</td></tr>\n';
						dirty = true;
					}
				}
				
				// check vertical words			
				if ((i-1 < 0) || (filt[i-1][j] == '#')) {
					// start of a vertical word
					let word = '';
					for (k=i;k<filt.length; k++) {
						if (filt[k][j] != '#') {
							word += filt[k][j];
						} else {
							break;
						}
					}
					if (word.length > 1) {
						jsonout += '\"V'+word_count_starts+'\":\{\"word\":"'+word+'\",\"x\":'+(j+1)+',\"y\":'+(i+1)+'},';
						htmlout += '<div class="nu" data-x="'+j+'" data-y="'+i+'" data-hint="'+word_count_starts+'" style="left:'+(36*j+4)+'px;top:'+(36*i+1)+'px;color:000000;text-align:left" >'+word_count_starts+'</div>\n';
						tempverthints += '<tr><td width="0" align="right" valign="top"><b>'+word_count_starts+'</b></td>\n';
						tempverthints += '<td valign="top">'+word+'('+word.length+')</td></tr>\n';
						dirty = true;
					}
				}
				if (dirty) word_count_starts++; 
			}
		}
		
		jsonout = jsonout.slice(0, -1)+'}';
		
		for(let j=0; j<filt.length+1; j++) {
			htmlout += '<div class="hr" style="left:0px;top:'+(36*j)+'px;width:'+(36*filt[0].length)+'px;"></div>\n';
		}

		for(let i=0; i<filt[0].length+1; i++) {
			htmlout += '<div class="vr" style="left:'+(36*i)+'px;top:0px;height:'+(36*filt.length)+'px;"></div>\n';
		}
					
		htmlout += '</div></div>\n</div>\n';
		
		hintsout += '</table></td>\n<td>&nbsp;</td>\n<td valign="top"><table>\n';
		hintsout += tempverthints;
		hintsout += '</table></td>\n</tr>\n</table></div>\n';
		
		if (include_hints_in_crosswords_html == true) htmlout += hintsout;
			
		htmlout += '</body>\n</html>\n';

		hintsout += '</body>\n</html>\n';


		fs.writeFileSync(export_json_filename, jsonout);
		
		fs.writeFileSync(export_html_filename, htmlout);
		
		if (include_hints_in_crosswords_html == false) fs.writeFileSync(export_hints_template_filename, hintsout);
	});

});


