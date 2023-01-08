$(document).ready(function () {

    //Hier hole ich mit moment.js das aktuelle Datum und berechne die Jahreswoche
    //Danach setze ich die Woche im Navigator 
    var now = moment();
    var weekNumber = now.week();
    var year = now.year();
    var weekNumberString = ('0' + weekNumber).slice(-2);

    var woche = localStorage.getItem('woche');
    if (woche) {
        console.log(woche);
    } else {

        var woche = weekNumberString + '-' + year;

        localStorage.setItem('woche', woche);
    }



    updateTable();
    $('#aktuelle').text(woche);

    //Hier rufe ich mit einem API Call alle Berufe ab und füge diese als Auswahlmölichkeiten in das #select1 Formular
    //Wenn bereits ein Wert im LocalStorage gespeichert ist, wird dieser Wert ausgewählt

    $.getJSON('http://sandbox.gibm.ch/berufe.php', function (data) {
        if (!$.isEmptyObject(Array)) {
            window.alert('Error: No data was returned.');
        } else {
            $.each(data, function (i, item) {
                $('#select1').append($('<option>', {
                    value: item.beruf_id,
                    text: item.beruf_name
                }));
                var berufId = localStorage.getItem('berufId');
                if (berufId) {
                    $('#select1').val(berufId);
                }
            });
        }
    }).fail(function () {
        window.alert('Error: The request could not be completed.');
    });

    //Zuerst prüfe ich ob ein Wert im LocalStorage existiert.
    //Ist dies der Fall, wird die Auswahl auf die, zu den Berufen passenden Klassen, reduziert.
    //Auch wird , wenn bereits ein Wert im LocalStorage gespeichert ist, dieser Wert ausgewählt.
    //Ist dies nicht der Fall, werden alle Klassen als Auswahlmöglichkeit aufgelistet.

    berufId = localStorage.getItem('berufId')
    if (berufId) {
        url = "http://sandbox.gibm.ch/klassen.php";
        var data = {};
        data.beruf_id = berufId;
        //Hier rufe ich mit einem API Call alle Klassen ab, welche zu dem Parameter berufId passen und füge diese als Auswahlmöglichkeiten in das #select2 Formular
        $.getJSON(url, data, function (data) {
            if (!$.isEmptyObject(Array)) {
                window.alert('Error: No data was returned.');
            } else {
                $('#select2').empty();
                data.forEach(function (item) {
                    console.log(item)
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
            }
        }).fail(function () {
            window.alert('Error: The request could not be completed.');
        });
    } else {
        var url = 'http://sandbox.gibm.ch/klassen.php';
        //Hier rufe ich mit einem API Call alle Klassen ab und füge diese als Auswahlmöglichkeiten in das #select2 Formular
        $.getJSON(url, function (data) {
            if (!$.isEmptyObject(Array)) {
                window.alert('Error: No data was returned.');
            } else {
                data.forEach(function (item) {
                    $('#select2').append($('<option>', {
                        value: item.klasse_id,
                        text: item.klasse_longname
                    }));
                });
            }
        }).fail(function () {
            window.alert('Error: The request could not be completed.');
        });
    }

    //Hier wird bei einer Änderung in dem #select1 Formular der berufId Wert im Local Storage eingetragen.
    //Daraufhin werden die Auswahlmöglichkeiten des #select2 Formular entfernt und durch einen API Call alle Klassen abgerufen, welche zu dem Parameter berufId passen und füge diese als Auswahlmöglichkeiten in das #select2 Formular

    $('#select1').change(function () {
        localStorage.setItem('berufId', $(this).val());
        var berufId = $(this).val();
        var data = {};
        if (berufId) {
            data.beruf_id = berufId;
        }
        $.getJSON(url, data, function (data) {
            if (!$.isEmptyObject(Array)) {
                window.alert('Error: No data was returned.');
            } else {
                $('#select2').empty();
                data.forEach(function (item) {
                    console.log(item)
                    $('#select2').append($('<option>', {
                        value: item.klasse_id,
                        text: item.klasse_longname
                    }));
                });
            }
        }).fail(function () {
            window.alert('Error: The request could not be completed.');
        });
    });

    //Hier wird bei einer Änderung im #select2 Formular, der neue wert ins Local Storage geschrieben
    //Danach wird die Funktion updateTable() verwendet.

    $('#select2').change(function () {
        localStorage.setItem("klasseId", $(this).val());
        updateTable();
    });

    //Hier wird die Wochenzahl um eins Addiert und die validateWeek() Funktion verwendet, wessen Werte in dem wocheArray gespeichert werden.
    //Danach wird der Text im Navigator #aktuelle an die derzeitig ausgewählt Woche angepasst und der Wert woche im Local Storage gespeichert.
    //Dann wird die funktion updateTable() aufgerufen.
    $('#naechste').click(function () {
        weekNumber++;
        console.log(weekNumber)
        var wocheArray = validateWeek(weekNumber, year);
        woche = wocheArray[0];
        weekNumber = wocheArray[1];
        year = wocheArray[2];
        $('#aktuelle').html(woche);
        localStorage.setItem('woche', woche);
        updateTable();
    });

    //Hier wird die Wochenzahl um eins Subtrahiert und die validateWeek() Funktion verwendet, wessen Werte in dem wocheArray gespeichert werden.
    //Danach wird der Text im Navigator #aktuelle an die derzeitig ausgewählt Woche angepasst und der Wert woche im Local Storage gespeichert.
    //Dann wird die funktion updateTable() aufgerufen.
    $('#letzte').click(function () {
        weekNumber--;
        console.log(weekNumber)
        var wocheArray = validateWeek(weekNumber, year);
        woche = wocheArray[0];
        weekNumber = wocheArray[1];
        year = wocheArray[2];
        $('#aktuelle').html(woche);
        localStorage.setItem('woche', woche);
        updateTable();
    });
});

//Hier wird eine Wochenänderung validiert.
//Zuerst wird ein Jahreswechsel überprüft, danach wird die Woche zu einem zweistelligen String gemacht.
//Folgend wird das Format ww-yyyy erstellt und dieser Wert dann zurückgegeben.
function validateWeek(weekNumber, year) {

    // Check if the year has changed forwards
    if (weekNumber > 52) {
        year++;
        weekNumber = 1;
    }
    // Check if the year has changed backwards
    else if (weekNumber < 1) {
        year--;
        weekNumber = 52;
    }

    var weekNumberString = ('0' + weekNumber).slice(-2);

    var woche = weekNumberString + '-' + year;

    return [woche, weekNumber, year]
    woche;
}

//Hier wird die Tabelle auf die aktuellen Daten angepasst.
//Zuerst wird die klasseId und die woche aus dem LocalStorage genommen.
//Danach wird mit diesen Daten ein API Call gemacht, welcher den benötigten Stundenplan abfragt.
//Der tbody der Tabelle wird geleert und mit einer forEach Schlaufe jede Nummer eines Wochentags zu einem Text verändert, welcher den Tag beschreibt.
//Weiter in der Schlaufe werden die Elemente dann in die Tabelle eingefügt.

function updateTable() {
    var klasseId = localStorage.getItem('klasseId');
    var woche = localStorage.getItem('woche');

    var apiUrl = 'http://sandbox.gibm.ch/tafel.php?klasse_id=' + encodeURIComponent(klasseId) + '&woche=' + encodeURIComponent(woche);
    console.log(apiUrl)

    $.get(apiUrl, function (data) {
        $('#kalender tbody').empty();

        data.forEach(function (item) {
            var datum = item.tafel_datum;
            //Konvertiert die Nummer des Wochentag zu einem Integer
            var wochentag = parseInt(item.tafel_wochentag);
            var von = item.tafel_von;
            var bis = item.tafel_bis;
            var lehrer = item.tafel_lehrer;
            var fach = item.tafel_fach;
            var raum = item.tafel_raum;

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
