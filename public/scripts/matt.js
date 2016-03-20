$(document).ready(function() {

    function filterSkills(skillName, categoryName, callback) {
        var query = "";
        query += skillName ? "name=" + skillName : "";
        query += categoryName ? (query.length == 0 ? "" : "&") + "category=" + categoryName : "";
        $.getJSON("/action/get/skills" + ((query.length != 0) ? "?" + query : ""), function(data) {
            var skills = [];
            for(var i = 0; i < data.result.length; i++) {
                var found = false;
                for(var j = 0; j < skills.length; j++) {
                    if(skills[j].name == data.result[i].name) {
                        found = true;
                    }
                }

                if(!found) {
                    skills.push(data.result[i]);
                }
            }

            callback(skills);
        });
    }

    filterSkills("Programming", 'Technical', function(data) {
        console.log(data);
    });


    }

    //queryPeople({ skills: 'Prog' }, function(data) {
    //    console.log(data.result);
    //});

});
