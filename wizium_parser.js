const fs = require('fs');
const readline = require('readline');

let wizium_file = 'outline_test.wiz';
let export_html = true;
let export_html_filename = 'export.html';
let export_json = true;
let export_json_filename = 'export.json';
let export_hints_template = true;
let export_hints_template_filename = 'export_hints.html';

fs.readFile(wizium_file, (err, data) => {
    if (err) throw err;

	let htmlout = '';
	let jsonout = '{';
	let hintsout = '';
	
	
	let arr = data.toString().replace(/ */g,"").replace(/\r\n/g,'\n').split('\n');
	let filt =  arr.filter(function(el, index) { return index % 2 === 0; });

	//console.log(filt);
	
	word_count_starts = 1;

    for(let i=0; i<filt.length; i++) {
        //console.log(filt[i]);
		for(let j=0; j<filt[i].length; j++) {
			
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
					dirty = true;
				}
			}
			if (dirty) word_count_starts++; 
		}
    }
	
	jsonout = jsonout.slice(0, -1)+'}';
	
	//console.log(jsonout);
	//console.log(filt);
	
	//TODO: html export
	//TODO: hints export
	
	//let dataoutput = JSON.stringify(jsonout);
	fs.writeFileSync(export_json_filename, jsonout);
});

