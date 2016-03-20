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

    function queryPeople(query, callback) {
        $.getJSON("/action/get/people", function(data) {
            data.result = data.result.filter(function (person) {
                for(var queryField in query) {
                    if(queryField == 'happiness' || queryField == 'workload' || queryField == 'comments' ||
                       queryField == 'commentDate' || queryField == 'likes' || queryField == 'dislikes') {
                        for(var i = 0; i < person[queryField].length; i++) {
                            if(person[queryField][i].indexOf(query[queryField]) > -1) {
                                return true;
                            }
                        }
                        return false;
                    } else if (queryField == 'skills') {
                        for(var i = 0; i < person[queryField].length; i++) {
                            if(person[queryField][i].name.indexOf(query[queryField]) > -1) {
                                return true;
                            }
                        }
                        return false;
                    } else if (queryField == 'location' || queryField == 'department') {
                        return person[queryField].name.indexOf(query[queryField]) > -1;
                    } else {
                        return person[queryField].indexOf(query[queryField]) > -1;
                    }
                }

                return true;
            });

            callback(data);
        });
    }

    //queryPeople({ skills: 'Prog' }, function(data) {
    //    console.log(data.result);
    //});

});
