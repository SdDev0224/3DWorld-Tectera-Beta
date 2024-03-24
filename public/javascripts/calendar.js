// calendar.js: Create a scrolling calendar

// Set status
var setCalendarStatus = (day, time, statusSpan, status, column) => {
  // Find span, set
  var daysDiv = $("#days");
  if (daysDiv) {
    if (day) {
      var dayDiv = daysDiv.find("#day_" + day);
      var timeDiv = dayDiv.find("#time_" + time);
      statusSpan = timeDiv.find(".status_" + column);
    }
    if (status) {
      statusSpan.addClass('selected').html("Free");
    } else {
      statusSpan.removeClass('selected').html("&nbsp;");
    }
  }
};

// Create a day
var createDay = (daysDiv, day, times) => {
  // Get day
  var startDay = moment().add(day, 'days');
  var dayName = startDay.format("dddd D MMM");
  var dayid = startDay.format("DD_MM");

  // Create times rows
  var timesDiv = $("<div>");
  times.forEach((time, id) => {
    let timeid = time;
    let timeDiv = $("<div id='time_" + timeid + "' class='time'>");
    let timeSpan = "<span class='timename'>" + (time-12) + ":00<font size='1'>PM EST</font></span>";
    let statusSpan1 = "<span class='timestatus status_1'>&nbsp;</span>";
    let statusSpan2 = "<span class='timestatus status_2'>&nbsp;</span>";
    let statusSpan3 = "<span class='timestatus status_3'>&nbsp;</span>";
    let statusSpan4 = "<span class='timestatus status_4'>&nbsp;</span>";
    timeDiv.html(timeSpan + statusSpan1 +  statusSpan2 +  statusSpan3 + statusSpan4);
    timesDiv.append(timeDiv);
  });

  // Create day div
  let dayDiv = $("<div id='day_" + dayid + "' class='day'>");
  dayDiv.html("<div><b>" + dayName + "</b></div>" + timesDiv.html() + "");

  // Add
  daysDiv.append(dayDiv);
}

// Create calendar
var createCalendar = (days) => {
  var daysDiv = $("#days");
  if (daysDiv) {
    // Create columns
    let time = 1;
    let dayName = "";
    var timesDiv = $("<div>");
    let timeDiv = $("<div class='time'>");
    let timeSpan = "<span class='timename'>________</span>";
    let statusSpan1 = "<span id='user_1' class='timestatus'>Me</span>";
    let statusSpan2 = "<span id='user_2' class='timestatus'>User 2</span>";
    let statusSpan3 = "<span id='user_3' class='timestatus'>User 3</span>";
    let statusSpan4 = "<span id='user_4' class='timestatus'>User 4</span>";
    let dayDiv = $("<div id='' class='day'>");
    timeDiv.html(timeSpan + statusSpan1 +  statusSpan2 +  statusSpan3 + statusSpan4);
    timesDiv.append(timeDiv);
    dayDiv.html("<div><b>" + dayName + "</b></div>" + timesDiv.html());
    daysDiv.append(dayDiv);

    // Create days
    for (let day = 0; day < days; day++) createDay(daysDiv, day, [19, 21]);
  }
}

// Create calendar
createCalendar(7);
