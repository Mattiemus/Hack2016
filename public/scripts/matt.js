$(document).ready(function() {
    $.getJSON("/action/get/people?location.$id=56edea6763115f9c0ebd0141", function(data) {
        var events = data.result.map(function(value) {
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
            eventClick: function(event, jsEvent, view) {
                console.log(event.id);
            }
        });
    });

    $.getJSON("/action/get/people", function(data) {
        var skills = [];
        data.result.forEach(function(value) {
            skills.push(value.skills);
        });
        skills = [].concat.apply([], skills);

        var skillCounts = {};
        var categoryCounts = {};
        for (var i = 0, j = skills.length; i < j; i++) {
           skillCounts[skills[i].name] = (skillCounts[skills[i].name] || 0) + 1;
           categoryCounts[skills[i].category] = (categoryCounts[skills[i].category] || 0) + 1;
        }

        var diameter = 400,
            format = d3.format(",d"),
            color = d3.scale.category20c();

        var bubble = d3.layout.pack()
            .sort(null)
            .size([diameter, diameter])
            .padding(1.5);

        var svg = d3.select("body").append("svg")
            .attr("width", diameter)
            .attr("height", diameter)
            .attr("class", "bubble");

        var root = {
          name: "Skills",
          children: []
        };

        for(var skillName in skillCounts) {
            root.children.push({
                name: skillName,
                size: skillCounts[skillName] + Math.round(Math.random() * 20)
            });
        }

        var node = svg.selectAll(".node")
            .data(bubble.nodes(classes(root))
            .filter(function(d) { return !d.children; }))
          .enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

        node.append("title")
            .text(function(d) { return d.className + ": " + format(d.value); });

        node.append("circle")
            .attr("r", function(d) { return d.r; })
            .style("fill", function(d) { return color(d.packageName); });

        node.append("text")
            .attr("dy", ".3em")
            .style("text-anchor", "middle")
            .text(function(d) { return d.className.substring(0, d.r / 3); });

        // Returns a flattened hierarchy containing all leaf nodes under the root.
        function classes(root) {
          var classes = [];

          function recurse(name, node) {
            if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
            else classes.push({packageName: name, className: node.name, value: node.size});
          }

          recurse(null, root);
          return {children: classes};
        }

        d3.select(self.frameElement).style("height", diameter + "px");
    });
});
