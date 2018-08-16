(function () {
  'use strict';

  var app = {
    isLoading: true,
    visibleCards: {},
    selectedTimetables: [],
    spinner: document.querySelector('.loader'),
    cardTemplate: document.querySelector('.cardTemplate'),
    container: document.querySelector('.main'),
    addDialog: document.querySelector('.dialog-container')
  };

  /*****************************************************************************
   *
   * Event listeners for UI elements
   *
   ****************************************************************************/
  document.getElementById('butRefresh').addEventListener('click', function () {
    // Refresh all of the metro stations
    app.updateSchedules();
  });

  document.getElementById('butAdd').addEventListener('click', function () {
    // Open/show the add new station dialog
    app.toggleAddDialog(true);
  });

  document.getElementById('butAddTimetable').addEventListener('click', function () {
    var select = document.getElementById('selectTimetableToAdd');
    var selected = select.options[select.selectedIndex];
    var key = selected.value;
    var label = selected.textContent;
    if (!app.selectedTimetables) {
      app.selectedTimetables = [];
    }
    app.getSchedule(key, label);
    app.selectedTimetables.push({key: key, label: label});
    app.saveSelectedTimetables(); 
    app.toggleAddDialog(false);
  });

  document.getElementById('butAddCancel').addEventListener('click', function () {
    // Close the add new station dialog
    app.toggleAddDialog(false);
  });


  /*****************************************************************************
   *
   * Methods to update/refresh the UI
   *
   ****************************************************************************/

  // Toggles the visibility of the add new station dialog.
  app.toggleAddDialog = function (visible) {
    if (visible) {
      app.addDialog.classList.add('dialog-container--visible');
    } else {
      app.addDialog.classList.remove('dialog-container--visible');
    }
  };

  // Updates a timestation card with the latest weather forecast. If the card
  // doesn't already exist, it's cloned from the template.

  app.updateTimetableCard = function (data) {
    var key = data.key;
    var dataLastUpdated = new Date(data.created);
    var schedules = data.schedules;

    var card = app.visibleCards[key];
    if (!card) {
      var label = data.label.split(', ');
      var title = label[0];
      var subtitle = label[1];
      card = app.cardTemplate.cloneNode(true);
      card.classList.remove('cardTemplate');
      card.querySelector('.label').textContent = title;
      card.querySelector('.subtitle').textContent = subtitle;
      card.removeAttribute('hidden');
      app.container.appendChild(card);
      app.visibleCards[key] = card;
    }

    var cardLastUpdatedElem = card.querySelector('.card-last-updated');
    var cardLastUpdated = cardLastUpdatedElem.textContent;
    if (cardLastUpdated) {
      cardLastUpdated = new Date(cardLastUpdated);
      if (dataLastUpdated.getTime() < cardLastUpdated.getTime()) {
        return;
      }
    }
    cardLastUpdatedElem.textContent = data.created;

    var scheduleUIs = card.querySelectorAll('.schedule');
    for(var i = 0; i<4; i++) {
      var schedule = schedules[i];
      var scheduleUI = scheduleUIs[i];
      if(schedule && scheduleUI) {
        scheduleUI.querySelector('.message').textContent = schedule.message;
      }
    }

    if (app.isLoading) {
      app.spinner.setAttribute('hidden', true);
      app.container.removeAttribute('hidden');
      app.isLoading = false;
    }
  };

  /*****************************************************************************
   *
   * Methods for dealing with the model
   *
   ****************************************************************************/
  app.getSchedule = function (key, label) {
    var url = 'https://api-ratp.pierre-grimaud.fr/v3/schedules/' + key;

    if ('caches' in window) {
      caches.match(url).then(function(response) {
        if (response) {
          response.json().then(function updateFromCache(json) {
            var results = json.result;
            results.key = key;
            results.label = label;
            results.created = json._metadata.date;
            app.updateTimetableCard(results);
          });
        }
      });
    }

    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          var response = JSON.parse(request.response);
          var result = {};
          result.key = key;
          result.label = label;
          result.created = response._metadata.date;
          result.schedules = response.result.schedules;
          app.updateTimetableCard(result);
        }
      } else {
        app.updateTimetableCard(initialStationTimetable);
      }
    };
    request.open('GET', url);
    request.send();
  };

  // Iterate all of the cards and attempt to get the latest timetable data
  app.updateSchedules = function () {
    var keys = Object.keys(app.visibleCards);
    keys.forEach(function (key) {
      app.getSchedule(key);
    });
  };

  app.saveSelectedTimetables = function() {
    var selectedTimetables = JSON.stringify(app.selectedTimetables);
    localStorage.selectedTimetables = selectedTimetables;
  };

  /*
    * Fake timetable data that is presented when the user first uses the app,
    * or when the user has not saved any stations. See startup code for more
    * discussion.
    */
  var initialStationTimetable = {
    key: 'metros/1/bastille/A',
    label: 'Bastille, Direction La Défense',
    created: '2017-07-18T17:08:42+02:00',
    schedules: [
      {
        message: '0 mn'
      },
      {
        message: '2 mn'
      },
      {
        message: '5 mn'
      }
    ]
  };

  /************************************************************************
   *
   * Code required to start the app
   *
   * NOTE: To simplify this codelab, we've used localStorage.
   *   localStorage is a synchronous API and has serious performance
   *   implications. It should not be used in production applications!
   *   Instead, check out IDB (https://www.npmjs.com/package/idb) or
   *   SimpleDB (https://gist.github.com/inexorabletash/c8069c042b734519680c)
   ************************************************************************/
  app.selectedTimetables = localStorage.selectedTimetables;
  if (app.selectedTimetables) {
    app.selectedTimetables = JSON.parse(app.selectedTimetables);
    app.selectedTimetables.forEach(function(timetable) {
      app.getSchedule(timetable.key, timetable.label);
    });
  } else {
    app.getSchedule(initialStationTimetable.key, initialStationTimetable.label);
    app.selectedTimetables = [
      {key: initialStationTimetable.key, label: initialStationTimetable.label}
    ];
    app.saveSelectedTimetables();
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
             .register('./service-worker.js')
             .then(function() { console.log('Service Worker Registered'); });
  }
})();
