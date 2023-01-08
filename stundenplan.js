$(document).ready(function () {

    // Get the current date
    var now = moment();

    // Get the week number of the year
    var weekNumber = now.week();

    // Get the year
    var year = now.year();

    // Format the week number as a two-digit string (e.g. "01", "02", etc.)
    var weekNumberString = ('0' + weekNumber).slice(-2);

    // Concatenate the week number and year in the format "ww-yyyy"
    var woche = weekNumberString + '-' + year;

    // Add the "woche" value to the local storage
    localStorage.setItem('woche', woche);

    updateTable();

    // Get the "woche" value from the local storage
    var woche = localStorage.getItem('woche');

    // If the "woche" value is not null, set the text of the element with the ID "aktuelle"
    if (woche) {
        $('#aktuelle').text(woche);
    }

    $.getJSON('http://sandbox.gibm.ch/berufe.php', function (data) {
        $.each(data, function (i, item) {
            $('#select1').append($('<option>', {
                value: item.beruf_id,
                text: item.beruf_name
            }));
            // Get the "klasseId" value from the local storage
            var berufId = localStorage.getItem('berufId');
            // If the "klasseId" value is not null, select the corresponding option in the dropdown menu
            if (berufId) {
                $('#select1').val(berufId);
            }
        });
    }).fail(function(error) {
        // Display an alert
        alert('Could not reach the API! Error: ' + error);
    });

    var url = 'http://sandbox.gibm.ch/klassen.php';
    $.getJSON(url, function (data) {
        data.forEach(function (item) {
            $('#select2').append($('<option>', {
                value: item.klasse_id,
                text: item.klasse_longname
            }));
        });
        klasseID = localStorage.getItem('klasseId');
        if (klasseID) {
            console.log(klasseID);
            $('#select2').val(klasseID);
        }
    }).fail(function(error) {
        // Display an alert
        alert('Could not reach the API ! Error: ' + error);
    });

    $('#select1').change(function () {
        // Update the "klasseId" value in the local storage
        localStorage.setItem('berufId', $(this).val());
        var berufId = $(this).val();
        var data = {};
        if (berufId) {
            data.beruf_id = berufId;
        }
        $.getJSON(url, data, function (data) {
            $('#select2').empty(); // clear the previous options
            data.forEach(function (item) {
                console.log(item)
                $('#select2').append($('<option>', {
                    value: item.klasse_id,
                    text: item.klasse_longname
                }));
            });
        });
    }).fail(function(error) {
        // Display an alert
        alert('Could not reach the API! Error: ' + error);
    });

    $('#select2').change(function () {
        localStorage.setItem("klasseId", $(this).val());
        updateTable();
    });

    $('#naechste').click(function () {
        // Increment the week number
        weekNumber++;
        // Check if the year has changed
        if (weekNumber > 52) {
            year++;
            weekNumber = 1;
        }

        // Format the week number as a two-digit string
        weekNumberString = ('0' + weekNumber).slice(-2);

        // Concatenate the week number and year in the format "ww-yyyy"
        woche = weekNumberString + '-' + year;
        $('#aktuelle').html(woche);
        // Update the "woche" value in the local storage
        localStorage.setItem('woche', woche);

        // Update the table
        updateTable();
    });
    $('#letzte').click(function () {
        // Decrement the week number
        weekNumber--;

        // Check if the year has changed
        if (weekNumber < 1) {
            year--;
            weekNumber = 52;
        }

        // Format the week number as a two-digit string
        weekNumberString = ('0' + weekNumber).slice(-2);

        // Concatenate the week number and year in the format "ww-yyyy"
        woche = weekNumberString + '-' + year;

        $('#aktuelle').html(woche);
        // Update the "woche" value in the local storage
        localStorage.setItem('woche', woche);

        // Update the table
        updateTable();
    });
});







function updateTable() {
    // Get the "klasseId" and "woche" values from the local storage
    var klasseId = localStorage.getItem('klasseId');
    var woche = localStorage.getItem('woche');

    var apiUrl = 'http://sandbox.gibm.ch/tafel.php?klasse_id=' + encodeURIComponent(klasseId) + '&woche=' + encodeURIComponent(woche);
    console.log(apiUrl)

    // Make the API call
    $.get(apiUrl, function (data) {
        // Clear the table
        $('#kalender tbody').empty();

        // Iterate over the data and append a table row for each item
        data.forEach(function (item) {
            var datum = item.tafel_datum;
            //Konvertiert die Nummer des Wochentag zu einem Integer
            var wochentag = parseInt(item.tafel_wochentag);
            var von = item.tafel_von;
            var bis = item.tafel_bis;
            var lehrer = item.tafel_lehrer;
            var fach = item.tafel_fach;
            var raum = item.tafel_raum;

            // Convert the wochentag number to the corresponding weekday name
            switch (wochentag) {
                case 0:
                    wochentag = 'Sonntag';
                    break;
                case 1:
                    wochentag = 'Montag';
                    break;
                case 2:
                    wochentag = 'Dienstag';
                    break;
                case 3:
                    wochentag = 'Mittwoch';
                    break;
                case 4:
                    wochentag = 'Donnerstag';
                    break;
                case 5:
                    wochentag = 'Freitag';
                    break;
                case 6:
                    wochentag = 'Samstag';
                    break;
                default:
                    wochentag = 'Unbekannt';
            }

            $('#kalender tbody').append(
                '<tr>' +
                '<td>' + datum + '</td>' +
                '<td>' + wochentag + '</td>' +
                '<td>' + von + '</td>' +
                '<td>' + bis + '</td>' +
                '<td>' + lehrer + '</td>' +
                '<td>' + fach + '</td>' +
                '<td>' + raum + '</td>' +
                '</tr>'
            );
        });
    });
}
