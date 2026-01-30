/*HEADER*/

// get both pupils
const pupils = document.querySelectorAll(".eye .pupil");
window.addEventListener("mousemove", (e) => {
  pupils.forEach((pupil) => {
    // get x and y postion of cursor
    var rect = pupil.getBoundingClientRect();
    var x = (e.pageX - rect.left) / 78 + "px";
    var y = (e.pageY - rect.top) / 78 + "px";
    pupil.style.transform = "translate3d(" + x + "," + y + ", 0px)";
  });
});

/*TABS*/

function openTabs(tabsName) {
  var i;
  var x = document.getElementsByClassName("tabs");
  for (i = 0; i < x.length; i++) {
    x[i].style.display = "none";
  }
  document.getElementById(tabsName).style.display = "block";
}

/*COUNTER*/

var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function () {
  if (this.readyState == 4 && this.status == 200) {
    var site_data = JSON.parse(this.responseText);
    var num_arr = site_data.info.views.toString().split("");
    var num_str = "";
    for (i = 0; i < num_arr.length; i++) {
      num_str += num_arr[i];
      if ((num_arr.length - 1 - i) % 3 == 0 && num_arr.length - 1 - i != 0) {
        num_str += ",";
      }
      var date_str = site_data.info.last_updated;
      var date_obj = new Date(site_data.info.last_updated);
      document.getElementById("lastupdate").innerHTML =
        date_obj.getMonth() +
        1 +
        "-" +
        date_obj.getDate() +
        "-" +
        date_obj.getFullYear();
    }
    document.getElementById("hitcount").innerHTML = num_str;
  }
};
xhttp.open(
  "GET",
  "https://weirdscifi.ratiosemper.com/neocities.php?sitename=hell-mouth",
  true
);
xhttp.send();

/*MENU*/
