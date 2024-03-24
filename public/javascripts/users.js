'use strict';

// List users
function users() {
  var div = $("#users");
  if (div.length) {
    $.get('api/list', function(data) {
      const table = $('<table></table>').addClass('table-style');
      const headerRow = $('<tr></tr>');
      headerRow.append('<th>ID</th>');
      headerRow.append('<th>Email</th>');
      headerRow.append('<th>Login</th>');
      table.append(headerRow);
      $.each(data, function(index, rowData) {
        const row = $('<tr></tr>');
        row.append($('<td></td>').text(rowData.id));
        row.append($('<td></td>').text(rowData.username));
        row.append($('<td></td>').text(rowData.login));
        table.append(row);
      });
      div.append(table);
    });
  }
}

// Run
$(function() {
  users();
});
