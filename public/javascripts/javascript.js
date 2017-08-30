var StreetViewPanorama = new function(){}

var globalMap;
var globalMarker;
var globalMarker2;
var globalGeocoder;

// 맵 초기화
function initialize1(x, y) {
     // 입력된 좌표가 없으면 기본좌표를 역삼동으로 설정.
    if(x==0){ x=37.5662952; }
    if(y==0){ y=126.97794509999994; }

    globalGeocoder = new google.maps.Geocoder();

    var latlng = new google.maps.LatLng(x, y);

    var myOptions = {
        zoom: 15,

        //disableDoubleClickZoom:false,
        center: latlng,

        navigationControl: false,    // 눈금자 형태로 스케일 조절하는 컨트롤 활성화 선택.
        navigationControlOptions: {
            position: google.maps.ControlPosition.TOP_RIGHT,
            style: google.maps.NavigationControlStyle.DEFAULT // ANDROID, DEFAULT, SMALL, ZOOM_PAN
        },

        streetViewControl: false,

        scaleControl: false,    // 지도 축적 보여줄 것인지.
        //scaleControlOptions: { position: google.maps.ControlPosition.TOP_RIGHT },

        mapTypeControl: false, // 지도,위성,하이브리드 등등 선택 컨트롤 보여줄 것인지
        mapTypeId: google.maps.MapTypeId.ROADMAP  // HYBRID, ROADMAP, SATELLITE, TERRAIN
    };

    if (navigator.geolocation) {
         navigator.geolocation.getCurrentPosition(function(position) {
           var pos = {
             lat: position.coords.latitude,
             lng: position.coords.longitude
           };
           globalMarker = new google.maps.Marker({
             map: globalMap,
             draggable: true,
             animation: google.maps.Animation.BOUNCE,
             position: pos
           });

           globalMarker.addListener('click', toggleBounce);
           globalMap.setCenter(pos);
         }, function() {
           handleLocationError(true, globalMarker, map.getCenter());
         });

       } else {
         // Browser doesn't support Geolocation
         handleLocationError(false, globalMarker, map.getCenter());
       }





    globalMap = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

    google.maps.event.addListener(globalMap, 'dragend', function(){    // 드래그시 이벤트 추가
        showMapPos();
        showMapAddr();
    });
    google.maps.event.addListener(globalMap, 'click', function(event){        // 지도클릭시 마커이동
        moveMarker(event.latLng);
    });
}

function initialize2(x, y) {
     // 입력된 좌표가 없으면 기본좌표를 역삼동으로 설정.
    if(x==0){ x=37.5662952; }
    if(y==0){ y=126.97794509999994; }

    globalGeocoder = new google.maps.Geocoder();

    var latlng = new google.maps.LatLng(x, y);

    var myOptions = {
        zoom: 15,

        //disableDoubleClickZoom:false,
        center: latlng,

        navigationControl: false,    // 눈금자 형태로 스케일 조절하는 컨트롤 활성화 선택.
        navigationControlOptions: {
            position: google.maps.ControlPosition.TOP_RIGHT,
            style: google.maps.NavigationControlStyle.DEFAULT // ANDROID, DEFAULT, SMALL, ZOOM_PAN
        },

        streetViewControl: false,

        scaleControl: false,    // 지도 축적 보여줄 것인지.
        //scaleControlOptions: { position: google.maps.ControlPosition.TOP_RIGHT },

        mapTypeControl: false, // 지도,위성,하이브리드 등등 선택 컨트롤 보여줄 것인지
        mapTypeId: google.maps.MapTypeId.ROADMAP  // HYBRID, ROADMAP, SATELLITE, TERRAIN
    };

    if (navigator.geolocation) {
         navigator.geolocation.getCurrentPosition(function(position) {
           var pos = {
             lat: position.coords.latitude,
             lng: position.coords.longitude
           };
           globalMarker = new google.maps.Marker({
             map: globalMap,
             draggable: false,
             animation: google.maps.Animation.BOUNCE,
             position: pos
           });

           globalMarker.addListener('click', toggleBounce);
           globalMap.setCenter(pos);
         }, function() {
           handleLocationError(true, globalMarker, map.getCenter());
         });

       } else {
         // Browser doesn't support Geolocation
         handleLocationError(false, globalMarker, map.getCenter());
       }

    globalMap = new google.maps.Map(document.getElementById("map_canvas"), myOptions);


}

function initialize3(x, y) {
     // 입력된 좌표가 없으면 기본좌표를 역삼동으로 설정.
     if(x==0){ x=37.5662952; }
     if(y==0){ y=126.97794509999994; }

    globalGeocoder = new google.maps.Geocoder();

    var latlng = new google.maps.LatLng(x, y);

    var myOptions = {
        zoom: 16,

        //disableDoubleClickZoom:false,
        center: latlng,

        navigationControl: false,    // 눈금자 형태로 스케일 조절하는 컨트롤 활성화 선택.
        navigationControlOptions: {
            position: google.maps.ControlPosition.TOP_RIGHT,
            style: google.maps.NavigationControlStyle.DEFAULT // ANDROID, DEFAULT, SMALL, ZOOM_PAN
        },

        streetViewControl: false,

        scaleControl: false,    // 지도 축적 보여줄 것인지.
        //scaleControlOptions: { position: google.maps.ControlPosition.TOP_RIGHT },

        mapTypeControl: false, // 지도,위성,하이브리드 등등 선택 컨트롤 보여줄 것인지
        mapTypeId: google.maps.MapTypeId.ROADMAP  // HYBRID, ROADMAP, SATELLITE, TERRAIN
    };

    globalMap = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

    google.maps.event.addListener(globalMap, 'dragend', function(){    // 드래그시 이벤트 추가
        showMapPos();
        showMapAddr();
    });
    google.maps.event.addListener(globalMap, 'click', function(event){        // 지도클릭시 마커이동
        moveMarker(event.latLng);
    });

    var pos = {
      lat: 37.5662952,
      lng: 126.97794509999994
    };
      var myOptions2 = {
          position: pos,
          draggable: false,
          map: globalMap,
          animation: google.maps.Animation.DROP,
          //icon: "http://sstatic.naver.net/search/img2/ico_bal_a.gif", // 아이콘 설정할 때
          visible: true
      };

      globalMarker2 = new google.maps.Marker(myOptions2);
  //좌표 값을 index.js 에서 가져와야해





}

function toggleBounce() {
     if (globalMarker.getAnimation() !== null) {
       globalMarker.setAnimation(null);
     } else {
       globalMarker.setAnimation(google.maps.Animation.BOUNCE);
     }
   }


   function handleLocationError(browserHasGeolocation, infoWindow, pos) {
     infoWindow.setPosition(pos);
     infoWindow.setContent(browserHasGeolocation ?
                           'Error: The Geolocation service failed.' :
                           'Error: Your browser doesn\'t support geolocation.');
   }

// 맵 드래그할 때 맵 중앙 좌표 보여주기
function showMapPos(){
    var pos=globalMap.getCenter();

    //alert(pos.lat()+"/"+pos.lng());
    //return {x:pos.lat(), y:pos.lng()};

    document.getElementById("centerX").value = pos.lat();
    document.getElementById("centerY").value = pos.lng();
}

// 드래그할 때 맵 중앙 좌표의 주소
function showMapAddr(){
    globalGeocoder.geocode( { 'location': globalMap.getCenter()}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            /*
            var str="";
            for(var i=0; i<results[0].address_components.length; i++){
                str += "/"+results[0].address_components[0].long_name
            }
            document.getElementById("txtAddress").innerHTML=str;

            document.getElementById("txtAddress").innerHTML=results[0].address_components[0].types;
            */


            var str="";
            for(var i=3; i>=0; i--){
                str += " "+results[0].address_components[i].short_name;
            }
            document.getElementById("txtAddress").innerHTML=str;
            //document.getElementById("txtAddress").innerHTML=results[0].address_components[0].long_name;


        } else {
            alert("Geocode was not successful for the following reason: " + status);
        }
    });
}

// 맵 검색한 마크찍기
function setsearchedMark(){
  var pos = {
    lat: 37.5662952,
    lng: 126.97794509999994//좌표값을 데이터베이스에서 가져와서  for문으로 해주면 될듯 함
  };
    var myOptions = {
        position: pos,
        draggable: false,
        map: globalMap,
        animation: google.maps.Animation.DROP,
        //icon: "http://sstatic.naver.net/search/img2/ico_bal_a.gif", // 아이콘 설정할 때
        visible: true
    };

    globalMarker2 = new google.maps.Marker(myOptions);
    globalMarker2.addListener('click'/*,여기에 클릭시에 그 모임 정보창으로 넘어가게 */);
}

// 마크 삭제하기
function removeMark(){
    globalMarker.setOptions({
        map: null,
        visible: false
    });
    globalMarker = null;
}

// 마크좌표 가져오기
function getMarkPos(){
    var pos=globalMarker.getPosition();

    //alert(pos.lat()+"/"+pos.lng());
    //return {x:pos.lat(), y:pos.lng()};

    document.getElementById("markerX").value = pos.lat();
    document.getElementById("markerY").value = pos.lng();
}

// 특정좌표로 이동하기
function setMapByCoord(x, y){
    var loc = new google.maps.LatLng(x, y);

    globalMap.setCenter(loc);
}

// 주소값으로 찾기
function codeAddress() {
    removeMark();
    var address = document.getElementById("address").value;
    if(address=='검색할 주소를 입력하십시오.' || address==''){
        alert('검색할 주소를 입력하십시오.');
        document.getElementById("address").value='';
        document.getElementById("address").focus();
        return;
    }

    globalGeocoder.geocode( { 'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            globalMap.setCenter(results[0].geometry.location);


            //var marker = new google.maps.Marker({
            globalMarker = new google.maps.Marker({
                map: globalMap,
                position: results[0].geometry.location,
                animation: google.maps.Animation.DROP,
                draggable: true

            });
            globalMarker.addListener('click', toggleBounce);
        } else {
            alert("Geocode was not successful for the following reason: " + status);
        }
    });
}

// 정보창 마크 찍기


// 지도 위의 마크 모두 삭제 - Refresh 말고 방법 없을까?
function clearMark(){
    var loc = globalMap.getCenter(); // 현재의 지도의 위치를 가져온다.

    globalMap = null;
    globalMarker = null;
    globalGeocoder = null;

    initialize(loc.lat(), loc.lng());
}

// 지도 클릭시 마커 이동
function moveMarker(loc){
    //alert(loc);
    globalMarker.setPosition(loc);
}
