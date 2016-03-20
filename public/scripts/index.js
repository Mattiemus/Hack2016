// This is a simple *viewmodel* - JavaScript that defines the data and behavior of your UI
function AppViewModel() {

    var self = this;

    // Provide your access token
    L.mapbox.accessToken = 'pk.eyJ1IjoiY2F0ZXJwYXVsYSIsImEiOiJjaWx6Z3g0Nm8wMGlzdW9tNHF3cmlzNjE3In0.f4YzCXDvsl9o8G1ZmUC6SA';
    // Create a map in the div #map
    var locationMap = L.mapbox.map('mapid', 'caterpaula.pf1keid7');
    var myLayer = L.mapbox.featureLayer().addTo(locationMap);

        self.colors = ["#4d9de0", "#e15554", "#e1bc29", "#3bb273", "#7768ae"];

        self.randomColour = function () {
            return self.colors[Math.floor(Math.random() * self.colors.length - 1)];
        };

        self.locationCircles = ko.observableArray();

        self.displaySection = ko.observable();
        self.viewMap = ko.observable();
        self.locationArray = ko.observableArray();

        self.viewLocationID = ko.observable();
        self.viewLocationName = ko.observable();
        self.viewLocationPhone = ko.observable();
        self.viewLocationFax = ko.observable();
        self.viewLocationEmail = ko.observable();
        self.viewLocationAddress = ko.observable();
        self.viewLocationMales = ko.observable();
        self.viewLocationFemales = ko.observable();
        self.viewLocationNAs = ko.observable();
        self.viewLocationEmployeesNo = ko.observable();
        
        self.viewLocationHappiness = ko.observable();
        self.viewLocationWorkload = ko.observable();

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
            self.showSkills();
            self.displaySection('skills');
        }

        self.clickPeople = function () {
            self.displaySection('people');
        }

        self.loadLocation = function () {
            self.viewMap(false);
            var genderdata = [];
            var skillsdata = {};
            var departmentdata = [];
            var locationID = $.getJSON("/action/get/locations?latitude=" + self.locationArray()[0] + "&longitude=" + self.locationArray()[1], function (data) {
                self.viewLocationID(data.result[0]._id);
                self.viewLocationName(data.result[0].name);
                self.viewLocationPhone('<i class="fa fa-phone"></i> Phone: ' + data.result[0].phone);
                self.viewLocationFax('<i class="fa fa-fax"></i> Fax: '+ data.result[0].fax);
                self.viewLocationAddress('<i class="fa fa-building"></i> Address: ' + data.result[0].address);
                self.viewLocationEmail('<i class="fa fa-envelope"></i> Email: ' + data.result[0].email);
                
                var calendar = $.getJSON("/action/get/people?location.$id=" + self.viewLocationID(), function (data) {
                    var events = data.result.map(function (value) {
                        return {
                            id: value._id,
                            title: value.firstname + " " + value.lastname + "'s Review",
                            start: value.reviewDate
                        };
                    });

                    $('#calendar').fullCalendar({
                        header: {
                            left: 'prev,next today',
                            center: 'title',
                            right: 'month,agendaWeek,agendaDay'
                        },
                        editable: true,
                        eventLimit: true,
                        events: events,
                        eventClick: function (event, jsEvent, view) {
                            console.log(event.id);
                        }
                    });
                });


                var happiness = $.getJSON("action/get/people?location.$id=" + self.viewLocationID(), function (data) {
                    var happinessTotal = 0;

                    for (var i = 0; i < data.result.length; i++) {
                        happinessTotal += data.result[i].happiness * 100;
                    }

                    self.viewLocationHappiness(Math.floor(happinessTotal / data.result.length));
                });

                var workload = $.getJSON("action/get/people?location.$id=" + self.viewLocationID(), function (data) {
                    var workloadTotal = 0;

                    for (var i = 0; i < data.result.length; i++) {
                        workloadTotal += data.result[i].workload * 100;
                    }

                    self.viewLocationWorkload(Math.floor(workloadTotal / data.result.length));
                });

                var departments = $.getJSON("/action/get/people?location.$id=" + self.viewLocationID(), function (data) {
                    var departmentsArray = [];
                    for (var i = 0; i < data.result.length; i++) {
                        departmentsArray.push(data.result[i].department);
                        departmentsArray.concat();
                    }

                    var merged = [].concat.apply([], departmentsArray);

                    var hist = {};
                    merged.map(function (a) { if (a.name in hist) hist[a.name]++; else hist[a.name] = 1; });

                    for (var histname in hist) {
                            departmentdata.push({
                                value: hist[histname],
                                color: "#4D9DE0",
                                highlight: "#FF5A5E",
                                label: histname
                             });
                    };

                    var options = {
                        responsive: true
                    };

                    var ctx = $("#departmentChart").get(0).getContext("2d");
                    var departmentPieChart = new Chart(ctx).Pie(departmentdata, options);
                });

                var skills = $.getJSON("/action/get/people?location.$id=" + self.viewLocationID(), function (data) {
                    var skillsArr = [];
                    for (var i = 0; i < data.result.length; i++) {
                        skillsArr.push(data.result[i].skills);
                        skillsArr.concat();
                    }

                    console.log(data.result);

                    var merged = [].concat.apply([], skillsArr);

                    var hist = {};
                    merged.map(function (a) { if (a.name in hist) hist[a.name]++; else hist[a.name] = 1; });

                    
                    var skillsNameArray = [];
                    for (var histname in hist) {
                        skillsNameArray.push(histname);
                    }

                    var skillsCountArray = [];
                    for (var histname in hist) {
                        skillsCountArray.push(hist[histname]);
                    }

                    skillsdata.labels = skillsNameArray;
                    skillsdata.datasets = [{
                        label: "Skills Data",
                        fillColor: "rgba(220,220,220,0.2)",
                        strokeColor: "rgba(220,220,220,1)",
                        pointColor: "rgba(220,220,220,1)",
                        pointStrokeColor: "#fff",
                        pointHighlightFill: "#fff",
                        pointHighlightStroke: "rgba(220,220,220,1)",
                        data: skillsCountArray
                    }];

                    var options = {
                        responsive: true
                    };

                    var ctx = $("#skillsChart").get(0).getContext("2d");
                    var skillsChart = new Chart(ctx).Radar(skillsdata, options);
                });



                var employeeNo = $.getJSON("/action/count/people?location.$id=" + self.viewLocationID(), function (data) {
                    self.viewLocationEmployeesNo('<i class="fa fa-users"></i>  ' + data.result + ' employees');
                });

                var locationMales = $.getJSON("/action/count/people?gender=male&location.$id=" + self.viewLocationID(), function (data) {
                    self.viewLocationMales(data.result);

                    genderdata.push({
                        value: self.viewLocationMales(),
                        color: "#4D9DE0",
                        highlight: "#FF5A5E",
                        label: "Male"
                    });

                    var locationFemales = $.getJSON("/action/count/people?gender=female&location.$id=" + self.viewLocationID(), function (data) {
                        self.viewLocationFemales(data.result);

                        genderdata.push({
                            value: self.viewLocationFemales(),
                            color: "#E1BC29",
                            highlight: "#FF5A5E",
                            label: "Female"
                        });

                        var locationNAs = $.getJSON("/action/count/people?gender=na&location.$id=" + self.viewLocationID(), function (data) {
                            self.viewLocationNAs(data.result);

                            genderdata.push({
                                value: self.viewLocationNAs(),
                                color: "#F7464A",
                                highlight: "#FF5A5E",
                                label: "None applicable/Prefer not to say"
                            });

                            var options = {
                                responsive: true,
                                //String - A legend template
                                legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li><span style=\"background-color:<%=segments[i].fillColor%>\"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>"
                            };


                            var ctx = $("#genderChart").get(0).getContext("2d");
                            var genderPieChart = new Chart(ctx).Pie(genderdata, options);

                        });
                    });
                });
            });

        }

        self.showSkills = function () {
            function displayBubbles(skills) {
                $("#skillBubbles").empty();

                var diameter = 400,
                    format = d3.format(",d"),
                    color = d3.scale.category20c();

                var bubble = d3.layout.pack()
                    .sort(null)
                    .size([diameter, diameter])
                    .padding(1.5);

                var svg = d3.select("#skillBubbles")
                    .append("svg")
                    .attr("width", diameter)
                    .attr("height", diameter)
                    .attr("class", "bubble");

                var root = {
                    name: "Skills",
                    children: skills
                };

                var node = svg.selectAll(".node")
                    .data(bubble.nodes(classes(root))
                    .filter(function (d) { return !d.children; }))
                    .enter().append("g")
                    .attr("class", "node")
                    .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; })
                    .style("cursor", "pointer");

                node.append("title")
                    .text(function (d) { return d.className + ": " + format(d.value); });

                node.append("circle")
                    .attr("r", function (d) { return d.r; })
                    .style("fill", self.randomColour());

                node.append("text")
                    .attr("dy", ".3em")
                    .style("text-anchor", "middle")
                    .text(function (d) { return d.className; });

                node.on("click", function (bubble) {
                    console.log(bubble.id);
                });

                // Returns a flattened hierarchy containing all leaf nodes under the root.
                function classes(root) {
                    var classes = [];

                    function recurse(name, node) {
                        if (node.children) node.children.forEach(function (child) { recurse(node.name, child); });
                        else classes.push({ packageName: name, className: node.name, value: node.size, id: node._id });
                    }

                    recurse(null, root);
                    return { children: classes };
                }

                d3.select(self.frameElement).style("height", diameter + "px");
            }

            $.getJSON("/action/get/people", function (data) {
                //var skills = [];
                //data.result.forEach(function (value) {
                //    skills.push(value.skills);
                //});
                //skills = [].concat.apply([], skills);

                //for (var i = 0, j = skills.length; i < j; i++) {
                //    for (var j = 0; j < skills.length; j++) {
                //        if (skills[j].name == skills[i].name) {
                //            skills[j].size = (skills[j].size || 0) + 1;
                //        }
                //    }
                //}

                //var hist = {};
                //skills.map(function (a) { if (a.name in hist) hist[a.name]++; else hist[a.name] = 1; });

                var skillsArr = [];
                for (var i = 0; i < data.result.length; i++) {
                    for (var k = 0; k < data.result[i].skills.length; k++) {
                        var exists = false;
                        for (var j = 0; j < skillsArr.length; j++) {
                            if (skillsArr[j].name == data.result[i].skills[k].name) {
                                exists = true;
                                skillsArr[j].size++;
                            }
                        }
                        if (!exists) {
                            data.result[i].skills[k].size = 1;
                            skillsArr.push(data.result[i].skills[k]);
                        }
                    }
                }

                console.log(skillsArr);
                displayBubbles(skillsArr);
            });
        };

        self.clickLocation();

}

ko.applyBindings(new AppViewModel());