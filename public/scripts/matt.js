$(document).ready(function() {
    function displayBubbles(skills) {
        var diameter = 400,
            format = d3.format(",d"),
            color = d3.scale.category20c();

        var bubble = d3.layout.pack()
            .sort(null)
            .size([diameter, diameter])
            .padding(1.5);

        var svg = d3.select("body")
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
            .filter(function(d) { return !d.children; }))
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
            .style("cursor", "pointer");

        node.append("title")
            .text(function(d) { return d.className + ": " + format(d.value); });

        node.append("circle")
            .attr("r", function(d) { return d.r; })
            .style("fill", function(d) { return color(d.packageName); });

        node.append("text")
            .attr("dy", ".3em")
            .style("text-anchor", "middle")
            .text(function(d) { return d.className; });

        node.on("click", function(bubble) {
            console.log(bubble.id);
        });

        // Returns a flattened hierarchy containing all leaf nodes under the root.
        function classes(root) {
          var classes = [];

          function recurse(name, node) {
            if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
            else classes.push({packageName: name, className: node.name, value: node.size, id: node._id});
          }

          recurse(null, root);
          return {children: classes};
        }

        d3.select(self.frameElement).style("height", diameter + "px");
    }

    $.getJSON("/action/get/people", function(data) {
        var skills = [];
        data.result.forEach(function(value) {
            skills.push(value.skills);
        });
        skills = [].concat.apply([], skills);

        for (var i = 0, j = skills.length; i < j; i++) {
            for(var j = 0; j < skills.length; j++) {
                if(skills[j].name == skills[i].name) {
                    skills[j].size = (skills[j].size || 0) + 1;
                }
            }
        }

        displayBubbles(skills);
    });
});
