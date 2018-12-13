const say = require('say')

// Use default system voice and speed
say.speak('Hello!')

var result = say.getInstalledVoices(function(obj){ console.log(obj); });

console.log(result);
