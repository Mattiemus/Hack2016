$(document).ready(function() {
    function getPeopleById(personName) {
        var query = personName ? "?_id=" + personName : "";
        $.getJSON("/action/get/people" + query, function(data) {
            if(data.result.length != 1) {
                // Lots of peeps
                var container = $(document.body).empty();

                for(var i = 0; i < data.result.length; i++) {
                    ((iCpy) => {
                        var img = $('<img src="' + data.result[i].photoUrl + '" style="cursor: pointer;" height="200px" width="200px">')
                            .click(function() {
                                 getPeopleById(data.result[iCpy]._id);
                            });
                        container.append(img);
                    })(i);
                }
            } else {
                // Just the one peep
                var container = $(document.body).empty();

                console.log(data.result[0]);
            }
        });
    }

    getPeopleById();
});
