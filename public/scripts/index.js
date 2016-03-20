// This is a simple *viewmodel* - JavaScript that defines the data and behavior of your UI
function AppViewModel() {

    var self = this;

    // Provide your access token
    L.mapbox.accessToken = 'pk.eyJ1IjoiY2F0ZXJwYXVsYSIsImEiOiJjaWx6Z3g0Nm8wMGlzdW9tNHF3cmlzNjE3In0.f4YzCXDvsl9o8G1ZmUC6SA';
    // Create a map in the div #map
    var locationMap = L.mapbox.map('mapid', 'caterpaula.pf1keid7');
    var myLayer = L.mapbox.featureLayer().addTo(locationMap);

        self.locationCircles = ko.observableArray();

        self.displaySection = ko.observable();
        self.viewMap = ko.observable();
        self.locationArray = ko.observableArray();

        self.viewLocationID = ko.observable();
        self.viewLocationName = ko.observable();
        self.viewLocationDesc = ko.observable();
        self.viewLocationEmployeesNo = ko.observable();
        self.viewLocationCEO = ko.observable();
        self.viewLocationsDepartments = ko.observableArray();

        self.clickLocation = function () {
            self.viewMap(true);
            $.getJSON("/action/get/locations", function (data) {

                var geojson = [];

                for (var i = 0; i < data.result.length; i++) {
                    self.locationCircles.push(data.result[i]);
                    geojson.push({
                        "type": "Feature",
                        "geometry": {
                            "type": "Point",
                            "coordinates": [data.result[i].latitude, data.result[i].longitude]
                        },
                        "properties": {
                            "title": data.result[i].name,
                            "description": "More content to go here tehe",
                            "icon": {
                                "className": "mapIcon", // class name to style
                                "html": '<i class="fa fa-building fa-2x"></i>', // add content inside the marker
                                "iconSize": null, // size of icon, use null to set the size in CSS
                                "iconAnchor": [20, 20]
                            }
                        }
                    });
                }

                myLayer.on('layeradd', function (e) {
                    var marker = e.layer,
                        feature = marker.feature;
                    marker.setIcon(L.divIcon(feature.properties.icon));
                });

                myLayer.on('mouseover', function (e) {
                    e.layer.openPopup();
                });
                myLayer.on('mouseout', function (e) {
                    e.layer.closePopup();
                });
                myLayer.on('click', function (e) {
                    self.locationArray.removeAll();
                    self.locationArray.push(e.latlng.lng);
                    self.locationArray.push(e.latlng.lat);
                    self.loadLocation();
                });

                myLayer.setGeoJSON(geojson);

            });


            self.displaySection('location');
        }

        self.clickSkills = function () {
            self.displaySection('skills');
        }

        self.clickPeople = function () {
            self.displaySection('people');
        }


        self.loadLocation = function () {
            self.viewMap(false);
            var locationID = $.getJSON("/action/get/locations?latitude=" + self.locationArray()[0] + "&longitude=" + self.locationArray()[1], function (data) {
                self.viewLocationID(data.result[0]._id);
                self.viewLocationName(data.result[0].name);
                
                var employeeNo = $.getJSON("/action/query/employeecount?locationId=" + self.viewLocationID(), function (data) {
                    self.viewLocationEmployeesNo(data.result);
                });
            });
           
                var data = [
                    {
                        value: 300,
                        color: "#F7464A",
                        highlight: "#FF5A5E",
                        label: "Red"
                    },
                    {
                        value: 50,
                        color: "#46BFBD",
                        highlight: "#5AD3D1",
                        label: "Green"
                    },
                    {
                        value: 100,
                        color: "#FDB45C",
                        highlight: "#FFC870",
                        label: "Yellow"
                    }
                ];

                var options = {
                    //String - A legend template
                    legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li><span style=\"background-color:<%=segments[i].fillColor%>\"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>"
                };


                var ctx = $("#myChart").get(0).getContext("2d");
                var myPieChart = new Chart(ctx).Pie(data, options);

        }

        self.clickLocation();

}

ko.applyBindings(new AppViewModel());