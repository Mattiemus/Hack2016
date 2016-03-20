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
});
