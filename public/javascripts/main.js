'use strict';

// Main
function main() {
  // Calendar page
  $.getJSON("api/load", {})
  .done(function(response) {
    $.each(response.data, function(id, row) {
      var date = moment(row.time, 'YYYY-MM-DD HH');
      var day = date.format("DD_MM");
      var time = date.format("HH");
      var column = 1;
      // If we are admin user, set column
      if (response.id == 1) column = row.owner_id;
      //console.log(row);
      //console.log("day_month time: " + day + " " + time + " status: " + row.status);
      setCalendarStatus(day, time, null, row.status == 1 ? true : false, column);
    });
  });
  var statusSpan = $(".status_1");
  statusSpan.click(function() {
    // Toggle available status
    var status = 0;
    statusSpan = $(this);
    if (statusSpan.hasClass("selected")) status = 0;
    else status = 1;
    setCalendarStatus(null, null, statusSpan, status, 1);

    // Get date and time clicked
    var date = statusSpan.parent().parent();
    var dateName = date.attr('id').substr(4);
    var time = statusSpan.parent();
    var timeName = time.attr('id').substr(5);

    // Save
    $.getJSON("api/save", {date: dateName, time: timeName, status: status})
    .done(function(data) {
      //console.log(data);
    });
  });

  // Chat page
  var chatDiv = $("#chat");
  if (chatDiv.length) {
    // Start chat
    var startChat = $("#startChat");
    startChat.click(function() {
      startChat.css("display", "none");
      startWebRTC();
    });
  }

  // Reset password page
  var tokenDiv = $("#token");
  var emailDiv = $("#username");
  if (tokenDiv.length) {
    tokenDiv.val(getUrlParameter("token"));
    emailDiv.val(getUrlParameter("email"));
  }
}

// Run
$(function() {
    main();
});

// URL params
var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
    return "";
};
