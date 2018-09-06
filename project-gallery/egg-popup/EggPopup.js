var eggTop = document.getElementById("EggTop");
var eggBottom = document.getElementById("EggBottom");

window.addEventListener("scroll", function(){
  var position = window.scrollY;
  if(position > 200 && position < 350){
    eggTop.classList = "shake";
    eggBottom.classList = "shake";
  }
  else {
    eggTop.classList = "";
    eggBottom.classList = "";
  }
  if(position > 450){
    eggTop.classList = "hatch"
  }  
});

 
