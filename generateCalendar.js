// For our purposes, we can keep the current month in a variable in the global scope
//CHANGE THIS TO AUTOMATICALLY GET CURRENT MONTH


var todayDate = new Date();
var todayMonth = todayDate.getMonth();
var todayYear = todayDate.getFullYear();
var todayDay = todayDate.getDate();
var currentMonth = new Month(todayYear, todayMonth);
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

//handles enabling/disabling of tags
let tagsOn = true;
const toggleTagsOff = document.getElementById("tags_off");
const toggleTagsOn = document.getElementById("tags_on");
toggleTagsOff.addEventListener("click", function() {
    tagsOn = false;
    toggleTagsOn.style.display='block';
    toggleTagsOff.style.display='none';
    updateCalendar();
});
toggleTagsOn.addEventListener("click", function() {
    tagsOn =true;
    toggleTagsOff.style.display='block';
    toggleTagsOn.style.display='none';
    updateCalendar();
});






//Main loop to display the calendar grid
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
                if(month==todayMonth && currentMonth.year==todayYear && days[d].getDate()==todayDay) {
                    cell.style.border = '3px solid blue';
                }
                
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


//variables to track clicks on event listeners to help with preventing unintended clicks
let createEventListener = null;
let deleteEventListener = null;
let editEventListener = null;
let isEventFormOpen = false;
let isEditFormOpen = false;

//handles functionality for opening event form, including removing necessary event listeners so that
//unintended clicks don't happen
function openEventForm(cell) {
    if (isEventFormOpen || isEditFormOpen) {
        return; // Ignore cell click when the event form is already open
    }

    document.getElementById("createEventErrorMessage").innerHTML = "";
    document.getElementById("eventName").value = '';
    document.getElementById("eventDesc").value = '';
    document.getElementById("eventTime").value = '';
    document.getElementById("eventTagName").value = '';
    document.getElementById("eventAddUsers").value = '';
    document.getElementById("am").checked = true;
    let cellId = cell.id;
    console.log("clicked on "+cell.id);
    document.getElementById("eventForm").style.display = "block";
    isEventFormOpen = true;

    var createEventButton = document.getElementById("createEvent");
    var closeFormButton = document.getElementById("closeEventForm");
    var amButton = document.getElementById("am");
    var pmButton = document.getElementById("pm");

    if (createEventListener) {
        createEventButton.removeEventListener("click", createEventListener);
    } else {
        //console.log("no create event listener");
    }

    createEventListener = function () {
        createEventFunctionality(cell);
    };

    createEventButton.addEventListener("click", createEventListener);

    closeFormButton.addEventListener("click", closeEventForm);
    
}

//handles functionality for opening edit form, including removing necessary event listeners so that
//unintended clicks don't happen
function openEditForm(cell, event_id, title, desc, time, tagName) {
    if (isEventFormOpen || isEditFormOpen) {
        return; // Ignore cell click when the event form is already open
    }

    document.getElementById("editEventErrorMessage").innerHTML = "";
    console.log("clicked on event "+event_id);
    document.getElementById("editForm").style.display = "block";
    isEditFormOpen = true;

    document.getElementById("editName").value = title;
    document.getElementById("editDesc").value = desc;
    document.getElementById("editTagName").value = tagName;
    var editIsAm = checkAmOrPm(time); //AM if true, PM if false
    if(editIsAm) {
        document.getElementById("editAm").checked=true;
    } else {
        document.getElementById("editPm").checked=true;
    }

    let date = extractDate(time);

    document.getElementById("editTime").value = dateTimeToNormalFormat(time);

    var editEventButton = document.getElementById("editEvent");
    var closeEditButton = document.getElementById("closeEditForm");
    var deleteEventButton = document.getElementById("deleteEvent");

    if (editEventListener) {
        editEventButton.removeEventListener("click", editEventListener);
    } else {
        //console.log("no edit event listener");
    }

    editEventListener = function () {
        editEventFunctionality(event_id, date);
    };

    if (deleteEventListener) {
        deleteEventButton.removeEventListener("click", deleteEventListener);
    } else {
        //console.log("no delete event listener");
    }

    deleteEventListener = function () {
        deleteEventFunctionality(event_id, token);
    };

    editEventButton.addEventListener("click", editEventListener);

    deleteEventButton.addEventListener("click", deleteEventListener);

    closeEditButton.addEventListener("click", closeEditForm);
}

//tracking if the user inputs the time wrong more than once, will make the text bold
let timeDNECount = 0; 
let incorrectFormatCount = 0;

//gathering values, checking formats, and calling saveEvent to initiate ajax request
function createEventFunctionality(cell) {
    let cellId = cell.id;
    const eventName = document.getElementById("eventName").value;
    const eventDesc = document.getElementById("eventDesc").value;
    const tag = document.getElementById("eventTagName").value;
    const addUsers = document.getElementById("eventAddUsers").value;
    var pmButton = document.getElementById("pm");
    let eventTime = document.getElementById("eventTime").value;
    let errorMessage = document.getElementById("createEventErrorMessage");

    var addUsersArray = extractUsers(addUsers);

    
    if(!checkTimeFormat(eventTime)) {
        const wrongFormatMessage = document.createElement("p");
        wrongFormatMessage.textContent = "Time must be of format XX:XX";
        incorrectFormatCount++;
        
        if (incorrectFormatCount >= 2) {
            wrongFormatMessage.style.fontWeight = "bold";
        } else {
            errorMessage.appendChild(wrongFormatMessage);
        }
        return;
    }

    if(!checkTimeExists(eventTime)) {
        const invalidTime = document.createElement("p");
        invalidTime.textContent = "Invalid time";
        timeDNECount++;
        if (timeDNECount >= 2) {
            invalidTime.style.fontWeight = "bold";
        } else {
            errorMessage.appendChild(invalidTime);
        }
        return;
    }

    
    
    let amOrPm = "am";
    let firstTwoDigits = parseInt(eventTime.slice(0,2));
    if(pmButton.checked && firstTwoDigits!=12) {
        amOrPm = "pm";
        //converting to military time
        
        firstTwoDigits += 12;
        eventTime = firstTwoDigits + eventTime.slice(2);
    } else if(!pmButton.checked && firstTwoDigits==12){
        firstTwoDigits -= 12;
        eventTime = firstTwoDigits + eventTime.slice(2);
    }
    saveEvent(cellId, eventName, eventDesc, eventTime, tag, addUsersArray, token);
}

//variables to track number of times error is thrown for incorrect format
let editTimeDNECount = 0; 
let editIncorrectFormatCount = 0;

function editEventFunctionality(event_id, date) {
    //gathers all necessary values
    const editName = document.getElementById("editName").value;
    const editDesc = document.getElementById("editDesc").value;
    const editTag = document.getElementById("editTagName").value;
    var pmButton = document.getElementById("editPm");
    let editTime = document.getElementById("editTime").value;
    let errorMessage = document.getElementById("editEventErrorMessage");

    //makes sure time is of correct format and exists
    if(!checkTimeFormat(editTime)) {
        const wrongFormatMessage = document.createElement("p");
        wrongFormatMessage.textContent = "Time must be of format XX:XX";
        editIncorrectFormatCount++;
        if (editIncorrectFormatCount >= 2) {
            wrongFormatMessage.style.fontWeight = "bold";
        } else {
            errorMessage.appendChild(wrongFormatMessage);
        }
        return;
    }

    if(!checkTimeExists(editTime)) {
        const invalidTime = document.createElement("p");
        invalidTime.textContent = "Invalid time";
        editTimeDNECount++;
        if (editTimeDNECount >= 2) {
            invalidTime.style.fontWeight = "bold";
        } else {
            errorMessage.appendChild(invalidTime);
        }
        return;
    }

    
    
    
    //more time formatting
    let firstTwoDigits = parseInt(editTime.slice(0,2));

    if(pmButton.checked && firstTwoDigits!=12) {
        amOrPm = "pm";
        //converting to military time
        
        firstTwoDigits += 12;
        editTime = firstTwoDigits + editTime.slice(2);
    } else if(!pmButton.checked && firstTwoDigits==12){
        firstTwoDigits -= 12;
        editTime = firstTwoDigits + editTime.slice(2);
    }
    saveEdit(event_id, editName, editDesc, editTime, date, editTag, token);
}

//ajax for deleting event
function deleteEventFunctionality(event_id, token) {
    //save event with sql
    const data = {'event_id': event_id, 'token': token};

    fetch("process-delete-event.php", {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'content-type': 'application/json' }
    })
    .then(response => response.json())
    .catch(err => console.error(err));

    closeEditForm();
    updateCalendar();
}

//closes event form
function closeEventForm() {
    const eventForm = document.getElementById("eventForm");
    eventForm.style.display = "none";
    isEventFormOpen = false;
    timeDNECount = 0; 
    incorrectFormatCount = 0;
}

//closes edit form
function closeEditForm() {
    const editForm = document.getElementById("editForm");
    editForm.style.display = "none";
    isEditFormOpen = false;
    editTimeDNECount = 0; 
    editIncorrectFormatCount = 0;
}

//FOR INITIAL CREATION OF EVENTS
function saveEvent(cellId, eventName, eventDesc, eventTime, tag, addUsersArray, token) {
    //save event with sql
    const data = {'cellId': cellId, 'eventName': eventName, 'eventDesc': eventDesc, 'eventTime': eventTime, 'tagName':tag, 'addUsersArray': addUsersArray, 'token': token};
    console.log(tag);
    fetch("process-new-event.php", {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'content-type': 'application/json' }
    })
    .then(response => response.json())
    //.then(data => console.log(data.success))
    .catch(err => console.error(err));

    closeEventForm();
    updateCalendar();
}


//FOR EDITING OF EVENTS
function saveEdit(event_id, editName, editDesc, editTime, date, tag, token) {
    console.log(tag);
    const data = {'event_id': event_id, 'eventName': editName, 'eventDesc': editDesc, 'eventTime': editTime, 'date': date, 'tagName': tag, 'token': token};

    fetch("process-edit-event.php", {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'content-type': 'application/json' }
    })
    .then(response => response.json())
    .catch(err => console.error(err));

    closeEditForm();
    updateCalendar();
}


//given a cellid, gathers all necessary info about the cell (used in updateCalendar loop)
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
            resultRow.push(event.tag_id);
            resultRow.push(event.color);
            resultRow.push(event.tagName);

            results.push(resultRow);
        }

        //updates DOM with new event
        if(Array.isArray(results) && results.length>0) {
            for(let i=0; i<results.length; i++) {
                //setting all the properties to dif vars
                let curEvent = results[i];
                let event_id = curEvent[0];
                let title = curEvent[1];
                let desc = curEvent[2];
                let time = curEvent[3];
                let tag_id = curEvent[4];
                let tagColor = curEvent[5];
                let tagName = curEvent[6];
                var isAm = checkAmOrPm(time); //AM if true, PM if false
                let amOrPm = "AM";
                if(!isAm) {
                    amOrPm = "PM"
                }
                let displayTime = dateTimeToNormalFormat(time, isAm);
                var titleElement = document.createElement("p");
                //applies tag if there is a tag and tags are enabled
                if(tagColor!= null && tagsOn==true) {
                    titleElement.style.border=`3px solid ${tagColor}`;
                } else {
                    titleElement.style.border='1px solid black';
                }
                
                titleElement.textContent = displayTime+" "+amOrPm+" "+title;
                
                
                titleElement.addEventListener("click", function(event) {
                    //because these are inside a clickable cell, need to stop propogation
                    event.stopPropagation();
                    openEditForm(this, event_id, title, desc, time, tagName);
                })

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

//makes sure user inputted time as XX:XX
function checkTimeFormat(time) {
    var regex = /^\d{2}:\d{2}$/;
        if (regex.test(time)) {
        return true;
    } else {
        return false;
    }
}

//makes sure inputted time exists
function checkTimeExists(time) {
    var hour = parseInt(time.slice(0,2));
    var minute = parseInt(time.slice(-2));

    if(hour>12 || hour<0 || minute>59 ) {
        return false;
    } else {
        return true;
    }

}


//takes datetime object and returns time as XX:XX
function dateTimeToNormalFormat(dateTime) {
    const dateObj = new Date(dateTime);

    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();

    let formattedHours = hours.toString().padStart(2, '0');
    let intFormattedHours = parseInt(formattedHours);
    if(intFormattedHours>12) {
        intFormattedHours = intFormattedHours -12;
        formattedHours = intFormattedHours.toString();
    } else if(intFormattedHours==0) {
        intFormattedHours = 12;
        formattedHours = intFormattedHours.toString();
    }
    
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const timeString = `${formattedHours}:${formattedMinutes}`;

    return timeString;
}

//used for getting cellid (unique reference to each calendar cell of format MMDDYYYY)
function extractDate(dateTime) {
    const dateObj = new Date(dateTime);
    const month = ('0' + (dateObj.getMonth()+1)).slice(-2);
    const day = ('0' + dateObj.getDate()).slice(-2);
    const year = String(dateObj.getFullYear());

    return month + day + year;
}


//returns true if time is AM, false if PM
function checkAmOrPm(dateTimeStr) {
    const dateTime = new Date(dateTimeStr);
    const hour = dateTime.getHours();
    let am = false;
    if (hour >= 0 && hour < 12) {
        am = true;
    } else {
        am = false;
    }
    return am;
}

//returns an array of usernames, given a string of users of format user1, user2
function extractUsers(userString) {
    if(userString==="") {
        return [];
    }
    const trimmedString = userString.replace(/\s/g, '');
    const usernameArray = trimmedString.split(',');
    const trimmedUsernames = usernameArray.map(username => username.trim());
  
    return trimmedUsernames;
  }

