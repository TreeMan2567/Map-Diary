let global_map;
let global_images, act_img;

function ReadMapData(){
   mapdata = MAPDATA;
   points = mapdata.split(';');

   return points;
}

function PrepareFilters(){
   marker_names = MARKERS_NAMES.split("\n");
   
   for(let i = 0; i < FILTERS_COUNT ;i++) {
      let label = document.getElementById("label-"+i);
      label.innerText = marker_names[i+1];
   }
}

function ReadMarkers(){
   markers_tab = [];

   for(let i = 0; i < FILTERS_COUNT; i++) {
      let checkbox = document.getElementById("color-"+i);
      if(checkbox.checked){
         markers_tab[i] = true;
      }
      else {
         markers_tab[i] = false;
      }
   }

   return markers_tab;
}

function UpdateMap(){
   points = ReadMapData();
   markers_tab = ReadMarkers();

   let center = START_POINT;
   let zoom = ZOOM_LEVEL;

   if(global_map != null){
      center = global_map.getCenter();
      zoom = global_map.getZoom();
      global_map.remove();
   }

   global_map = L.map('map').setView(center, zoom);

   const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 20,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
   }).addTo(global_map);

   const icons = GetIcons();

   for (let i = 0; i < points.length; i++) {
      
      points[i] = points[i].replace("\n","");
      data = points[i].replace("\n","").split(',');

      x = data[0];
      y = data[1];
      pointName = data[2];
      date = data[3];
      type = parseInt(data[4]);
      images = data[5];
      description = data[6];

      if(markers_tab[type] && FilterTitle(pointName, description) && FilterDate(date)){
         date = date.replaceAll(":", ", ")
         let marker = L.marker([x, y], {icon: icons[type]}).addTo(global_map)
            .bindPopup("<b>" + pointName + "</b> <br> <button onclick='ShowDescription(\""+pointName+"\",\""+date+"\",\""+description+"\",\""+images+"\")'> Szczegóły </button>");
      }
   }
   
   global_map.setView(center, zoom);
}

function FilterDate(dates_arg) {
   let from = document.getElementById("from-input").value;
   let to = document.getElementById("to-input").value;
   let FIRST_DATE = new Date(0, 1, 1);
   let LAST_DATE = new Date(2567, 1, 1);

   dates = dates_arg.replaceAll(" ","").split(":");
   
   // Creating Date Objects 
   let from_date = FIRST_DATE;
   if(from != ""){
      let from_year = from.substring(0, 4);
      let from_month = from.substring(5, 7);
      let from_day = from.substring(8, 10);
      from_date = new Date(from_year, from_month, from_day);
   }

   let to_date = LAST_DATE;
   if(to != ""){
      let to_year = to.substring(0, 4);
      let to_month = to.substring(5, 7);
      let to_day = to.substring(8, 10);
      to_date = new Date(to_year, to_month, to_day);
   }

   function CreateDateObj(str){
      let day = str.substring(0, 2);
      let month = str.substring(3, 5);
      let year = str.substring(6, 10);
      let date = new Date(year, month, day);

      if(isNaN(date)) return null; //checks if its invalid date

      return date;
   }

   // Filtration
   for(let i = 0; i<dates.length ;i++){

      if(dates[i] == "-"){
         return (from_date == FIRST_DATE && to_date == LAST_DATE);
      }

      let date_arr = dates[i].split("-");
      if(date_arr.length == 1){
         let date = CreateDateObj(date_arr[0]);
         if(date == null) return true;
         if(date >= from_date && date <= to_date) return true;
      }
      else if(date_arr.length == 2) {
         let date = [];
         
         date[0] = CreateDateObj(date_arr[0]);
         date[1] = CreateDateObj(date_arr[1]);
         if(date[0] <= to_date && date[1] >= from_date) return true;
      }
   }

   return false;
}

function FilterTitle(title, desc) {
   let filter = document.getElementById("title-input").value;

   if(filter == ""){
      return true;
   }

   let len = filter.length;
   filter = filter.toLowerCase();

   checkarray = [title, desc];

   for(let j=0; j < checkarray.length ;j++) {
      checkarray[j] = checkarray[j].toLowerCase();

      for(let i=0; i < checkarray[j].length - len + 1 ; i++) {
         if(checkarray[j].substring(i, i+len) == filter) {
            return true;
         }
      }
   }

   return false;
}

function ShowDescription(name, date, desc, imgs){
   let title_div = document.getElementById("title-details");
   let date_div = document.getElementById("date-details");
   let desc_div = document.getElementById("description-details");
   let img_div = document.getElementById("img-details");
   let icons_div = document.getElementById("img-icons");

   title_div.innerText = name;
   date_div.innerText = date;
   desc_div.innerHTML = desc;

   imgs = imgs.replace(/\s/, '').split(":");

   if(imgs[0] == "") {   
      imgs[0] = "../../img/No_image_available.png";
   }
   img_div.src = "mapdata/photos/"+imgs[0];
   img_div.onclick = EnlargePicture;

   icons_div.innerText = "x";
   for(let i = 1; i<imgs.length; i++){
      icons_div.innerText += "o";
   }

   global_images = imgs;
   act_img = 0;
}

function EnlargePicture(){
   let largePicture_div = document.getElementById("largePicture");
   let background_div = document.getElementById("largePictureBackground");
   let img_div = document.getElementById("largePictureImg");
   
   largePicture_div.style.display = "inline";
   background_div.style.display = "inline";
   img_div.src = "mapdata/photos/"+ global_images[act_img];
}

function LargePictureExit() {
   let largePicture_div = document.getElementById("largePicture");
   let background_div = document.getElementById("largePictureBackground");
   
   largePicture_div.style.display = "none";
   background_div.style.display = "none";
   
}

function LargePictureSwitch(offset) {
   let img_div = document.getElementById("largePictureImg");

   let next_idx = act_img + offset;

   if(next_idx < 0){
      next_idx = global_images.length-1;
   }
   else if(next_idx >= global_images.length) {
      next_idx = 0;
   }

   img_div.src = "mapdata/photos/"+ global_images[next_idx];
   
   SwitchImage(offset);
}

function SwitchImage(offset){
   let img_div = document.getElementById("img-details");
   
   let next_idx = act_img + offset;

   if(next_idx < 0){
      next_idx = global_images.length-1;
   }
   else if(next_idx >= global_images.length) {
      next_idx = 0;
   }

   act_img = next_idx;
   img_div.src = "mapdata/photos/"+ global_images[next_idx];
   
   let icons_div = document.getElementById("img-icons");
      icons_div.innerText = "";
   for(let i = 0; i<global_images.length; i++){
      if( i != act_img){
         icons_div.innerText += "o";
      }
      else {
         icons_div.innerText += "x";
      }
   }
}

function GetIcons(){
   icons = [];

   var blueIcon = L.icon({
      iconUrl: 'img/blue-icon.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: 'img/shadow.png',
      shadowSize: [41, 41]
   });

   var redIcon = L.icon({
      iconUrl: 'img/red-icon.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: 'img/shadow.png',
      shadowSize: [41, 41]
   });

   var greenIcon = L.icon({
      iconUrl: 'img/green-icon.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: 'img/shadow.png',
      shadowSize: [41, 41]
   });

   var orangeIcon = L.icon({
      iconUrl: 'img/orange-icon.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: 'img/shadow.png',
      shadowSize: [41, 41]
   });

   var pinkIcon = L.icon({
      iconUrl: 'img/pink-icon.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: 'img/shadow.png',
      shadowSize: [41, 41]
   });

   var purpleIcon = L.icon({
      iconUrl: 'img/purple-icon.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: 'img/shadow.png',
      shadowSize: [41, 41]
   });

   var grayIcon = L.icon({
      iconUrl: 'img/gray-icon.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: 'img/shadow.png',
      shadowSize: [41, 41]
   });

   var blackIcon = L.icon({
      iconUrl: 'img/black-icon.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: 'img/shadow.png',
      shadowSize: [41, 41]
   });
   
   icons[0] = blueIcon;
   icons[1] = redIcon;
   icons[2] = greenIcon;
   icons[3] = orangeIcon;
   icons[4] = pinkIcon;
   icons[5] = purpleIcon;
   icons[6] = grayIcon;
   icons[7] = blackIcon;

   return icons;
}