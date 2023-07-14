//USED FOR TESTING PURPOSES


// For our purposes, we can keep the current month in a variable in the global scope
//CHANGE THIS TO AUTOMATICALLY GET CURRENT MONTH
var currentMonth = new Month(2023, 1); // October 2023
//generateCalendar(1, 2023);
document.addEventListener("DOMContentLoaded", updateCalendar);
// Change the month when the "next" or "prev" button is pressed
document.getElementById("next_month_btn").addEventListener("click", function(event){
	currentMonth = currentMonth.nextMonth(); // Previous month would be currentMonth.prevMonth()
	updateCalendar(); // Whenever the month is updated, we'll need to re-render the calendar in HTML
	//alert("The new month is "+currentMonth.month+" "+currentMonth.year);
}, false);

document.getElementById("prev_month_btn").addEventListener("click", function(event){
	currentMonth = currentMonth.prevMonth(); // Previous month would be currentMonth.prevMonth()
	updateCalendar(); // Whenever the month is updated, we'll need to re-render the calendar in HTML
	//alert("The new month is "+currentMonth.month+" "+currentMonth.year);
}, false);


// This updateCalendar() function only alerts the dates in the currently specified month.  You need to write
// it to modify the DOM (optionally using jQuery) to display the days and weeks in the current month.
function updateCalendar(){
    const month = currentMonth.month;
    const year = currentMonth.year;
    const calendarContainer = document.getElementById('calendar');
    if(calendarContainer.hasChildNodes()) {
        calendarContainer.innerHTML = '';
    }

    //display month and year
    var monthAndYear = document.createElement("h2");
    monthAndYear.textContent = numberToMonth(currentMonth.month)+" "+ currentMonth.year;
    calendarContainer.appendChild(monthAndYear);

    //gettint total days in the month and creating the calendar table
    const totalDays = new Date(year, month + 1, 0).getDate();
    const table = document.createElement('table');
    table.className = 'calendar';

    //getting numner of weeks (rows), which will be added to table
	var weeks = currentMonth.getWeeks();
    const row = document.createElement('tr');

    //days of the week at top of calendar
    for(var i=0; i<7; i++) {
        const cell = document.createElement('td');
        cell.textContent = numberToDay(i);
        row.appendChild(cell);
    }
    table.appendChild(row);

	for(var w in weeks){
		var days = weeks[w].getDates();
		// days contains normal JavaScript Date objects.
		const row = document.createElement('tr');
		//alert("Week starting on "+days[0]);
		
		for(var d in days){
			// You can see console.log() output in your JavaScript debugging tool, like Firebug,
			// WebWit Inspector, or Dragonfly.
            const cell = document.createElement('td');
            //creating a unique id for the cell so that it can be accessed when displaying events
            //must be in the format MMDDYYYY
            let monthID = month;
            let dayID = days[d].getDate();
            if(monthID<10) {
                monthID = 0+''+monthID;
            }
            if(dayID<10) {
                dayID = 0+''+dayID;
            }
            var cellId = monthID+''+dayID+''+year;
            cell.id = cellId;
            if (weeks[w] === 0 && days[d] < startDay) {
                // Empty cell before the start day of the month
            } else if (days[d].getDate() > totalDays || days[d].getMonth() !== month) {
                // Empty cell after the last day of the month
            } else {
                var dayOfMonth = document.createElement("strong");
                dayOfMonth.textContent = days[d].getDate();
                cell.appendChild(dayOfMonth);

                //sql query for events in that cell
                
                checkEvents(cell);
                

                //method to handle use of the event creator form
                cell.addEventListener("click", function() {
                    openEventForm(this);
                });
                
            }
            
            row.appendChild(cell);
		}
        table.appendChild(row);
	}
    calendarContainer.appendChild(table);

}





function openEventForm(cell) {
    let cellId = cell.id;
    console.log("clicked on "+cell.id);
    document.getElementById("eventForm").style.display = "block";
    var createEventButton = document.getElementById("createEvent");
    var closeFormButton = document.getElementById("closeEventForm");
    var amButton = document.getElementById("am");
    var pmButton = document.getElementById("pm");
    closeFormButton.addEventListener("click", closeEventForm);
    createEventButton.addEventListener("click", function() {
        createEventFunctionality(cell);
    });
}

function createEventFunctionality(cell) {
    let cellId = cell.id;
    const eventName = document.getElementById("eventName").value;
    const eventDesc = document.getElementById("eventDesc").value;
    var pmButton = document.getElementById("pm");
    let eventTime = document.getElementById("eventTime").value;
    let amOrPm = "am";
    if(pmButton.checked) {
        amOrPm = "pm";
        //converting to military time
        let firstTwoDigits = parseInt(eventTime.slice(0,2));
        firstTwoDigits += 12;
        eventTime = firstTwoDigits + eventTime.slice(2);
    } else {
        amOrPm = "am";
    }

    if(!checkTimeFormat(eventTime)) {
        eventForm = document.getElementById("eventForm");
        const wrongFormatMessage = document.createElement("p");
        wrongFormatMessage.textContent = "Time must be of format XX:XX";
        eventForm.appendChild(wrongFormatMessage);
        return;
    }

    if(cell.id == cellId) {
        console.log("running because "+cellId+" = "+ cell.id);
        saveEvent(cellId, eventName, eventDesc, eventTime);
        console.log("create event button clicked for:"+ cellId);
    }
}


function saveEvent(cellId, eventName, eventDesc, eventTime) {
    document.getElementById("eventForm").style.display = "none";
    //save event with sql
    const data = {'cellId': cellId, 'eventName': eventName, 'eventDesc': eventDesc, 'eventTime': eventTime};

    fetch("process-new-event.php", {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'content-type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => console.log("event #"+data.eventId+" for "+data.cellId))
    .catch(err => console.error(err));

    updateCalendar();
}



function closeEventForm() {
    const eventForm = document.getElementById("eventForm");
    eventForm.dataset.cellId=cellId;
    document.getElementById("eventForm").style.display = "none";
}

function checkEvents(cell) {
    let cellId = cell.id;
    const data = {'cellId': cellId};

    fetch("check-events.php", {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'content-type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
        // Response data is available here as `data`
         // Print the JSON array to the console
        
        // Process the JSON data as needed
        let results = new Array();
        for (let i = 0; i < data.length; i++) {
            let resultRow = new Array();
            const event = data[i];
            // Access individual properties of each event
            resultRow.push(event.event_id);
            resultRow.push(event.title);
            resultRow.push(event.description);
            resultRow.push(event.time);

            results.push(resultRow);
        }

        //updates DOM with new event
        if(Array.isArray(results) && results.length>0) {
            for(let i=0; i<results.length; i++) {
                let curEvent = results[i];
                let title = curEvent[1];
                let time = dateTimeToNormalFormat(curEvent[3]);
                var titleElement = document.createElement("p");
                titleElement.textContent = time+" "+title;
                cell.appendChild(titleElement);
            }
        }
    })
    .catch(err => console.error(err));
}







//converts month number into name of month for display purpsoes
function numberToMonth(month) {
    if(month == 0) {
        return "January";
    } else if(month==1) {
        return "February";
    } else if(month==2) {
        return "March";
    } else if(month==3) {
        return "April";
    } else if(month==4) {
        return "May";
    } else if(month==5) {
        return "June";
    } else if(month==6) {
        return "July";
    } else if(month==7) {
        return "August";
    } else if(month==8) {
        return "September";
    } else if(month==9) {
        return "October";
    } else if(month==10) {
        return "November";
    } else if(month==11) {
        return "December";
    }
}

//converts day number into day of the week for display purposes
function numberToDay(number) {
    if (number == 0) {
        return "Sunday";
    } else if (number == 1) {
        return "Monday";
    } else if (number == 2) {
        return "Tuesday";
    } else if (number == 3) {
        return "Wednesday";
    } else if (number == 4) {
        return "Thursday";
    } else if (number == 5) {
        return "Friday";
    } else if (number == 6) {
        return "Saturday";
    }
}

function checkTimeFormat(time) {
    // Regular expression pattern to match the format XX:XX
    var regex = /^\d{2}:\d{2}$/;
    
    // Check if the input text matches the pattern
    if (regex.test(time)) {
        return true;
    } else {
        return false;
    }
}

function dateTimeToNormalFormat(dateTime) {
    const dateObj = new Date(dateTime);

    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();

    // Pad single-digit hours and minutes with leading zeros if necessary
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');

    // Construct the time string in XX:XX format
    const timeString = `${formattedHours}:${formattedMinutes}`;

    return timeString;
}