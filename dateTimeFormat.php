<?php

//converts an inputted date and time into sql ready format
function dateTimeFormat($date, $time) {
    $month = intval(substr($date, 0, 2));
    $day = intval(substr($date, 2, 2));
    $year = intval(substr($date, 4, 4));

    $hour = intval(substr($time, 0, 2));
    $minute = intval(substr($time, 3, 2));

    $datetime = new DateTime();
    $datetime->setDate($year, $month, $day);
    $datetime->setTime($hour, $minute);

    //sql datetime formatting
    $sqlDateTime = $datetime->format('Y-m-d H:i:s');

    return $sqlDateTime;

}

?>