const say = require('say')

// some voices can't handle voice rate below 90, which is roughly 0.55 in percentage
// if they are below the handled rate they snap back to 1.0 instead of playing lowest

// Use default system voice and speed
say.speak('Hello!','Samantha','0.5');
//say.speak('Hello!','Samantha',1.0);
//say.speak('Hello!','Samantha',1.5);

//say.speak('Hello!','Alex','0.5');


//command line "say -v '?' >> voices.txt" to get list of available voices