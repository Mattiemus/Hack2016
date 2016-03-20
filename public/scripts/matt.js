$(document).ready(function() {

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

    queryPeople({ location: 'Londin' }, function(data) {
        console.log(data.result);
    });

});
