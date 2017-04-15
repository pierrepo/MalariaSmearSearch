/*Functions that flash messages in the flash div:
*
* @param {string} msg - the msg that have to be printed
* @param {int} time - the duration of the flash
*
*/
var Flash = {};
Flash.success = function(msg, time=1000){
    $('#flash-container')[0].innerHTML = "<span class='success message'>" + msg + "</span>";
    $('#flash-container').addClass('showing');
    setTimeout(function(){
      $('#flash-container').removeClass('showing');
    }, time);
  };
Flash.error = function(msg, time=1000){
    $('#flash-container')[0].innerHTML = "<span class='error message'>" + msg + "</span>";
    $('#flash-container').addClass('showing');
    setTimeout(function(){
        $('#flash-container').removeClass('showing');
    }, time);
};