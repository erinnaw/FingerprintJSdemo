"use-strict";

const API_token = API_TOKEN;
const browser_token = BROWSER_TOKEN;
const Auth_header = { token: API_token };
const Base_URL = "https://api.fpjs.io/visitors/";
const DEFAULT_LIMIT = 20;
let API_endpoint;
let before = "";
let visitor_id;
let limit = DEFAULT_LIMIT;
let linked_id = 1;
let request_type = "send message";
let request = "send-message";
let fp;
let previous_timestamps = [];
let prev_timestamp = 0;
let previous_timestamps_msg = [];
let prev_timestamp_msg = 0;
let subdomain_header = { token: browser_token, endpoint: 'https://fp.erinnawidjaja.com' };
let header = { token: browser_token };
let fp_header = subdomain_header;
let hasSI = true;
let hasResponded = false;

/*
function initFingerprintJS() {
// Initialize the agent at application startup.
const fpPromise = FingerprintJS.load({ token: browser_token });

// Get the visitor identifier when you need it.
fpPromise
    .then(fp => fp.get())
    .then(result => console.log(result.visitorId));
}

initFingerprintJS();
*/

document.addEventListener('keyup', function (event) {
    if (event.key === '`' && hasSI && hasResponded) {
        hasSI = false;
        fp_header = header;
        console.log("Toggling: Subdomain integration OFF.");
        $('#visitorid-text').html("Fetching...");
        $('#confidence-text').html("Fetching...");
        $('#bot-text').html("Fetching...");
        $('#visitor-info-container').html("");
        initFingerprintJS();
    }
    else if (event.key === '`' && !hasSI && hasResponded) {
        hasSI = true;
        fp_header = subdomain_header;
        console.log("Toggling: Subdomain integration ON.");
        $('#visitorid-text').html("Fetching...");
        $('#confidence-text').html("Fetching...");
        $('#bot-text').html("Fetching...");
        $('#visitor-info-container').html("");
        initFingerprintJS(); 
    }
});

//add { token: browser_token, endpoint: 'https://fp.erinnawidjaja.com'} if integrating subdomain
async function initFingerprintJS() {
    if (fp_header === header) {
        $('#subdomain-text').html("OFF");
    }
    else if (fp_header === subdomain_header) {
        $('#subdomain-text').html("ON");
    }

    console.log("<----FingerprintJS.load()------>");
    console.log(fp_header);
    console.log("-------------------------------");
    const fpPromise = FingerprintJS.load(fp_header);
    
    //fpPromise
    //.then(fp => fp.get({ extendedResult: true }))
    hasResponded = false;
    fp = await fpPromise;
    fp.get({ tag: {"requestType": "view page"}, linkedId: 0, extendedResult: true })
    .then(result => { console.log(result.visitorId);
                        if (result.visitorFound) {
                            $('#visitorid-text').html(result.visitorId);
                            $('#confidence-text').html(result.confidence.score);
                        }
                        else {
                            $('#visitorid-text').html("No Visitor ID Found");
                            $('#confidence-text').html("-");
                        }

                        if (!result.visitorId && result.bot && result.bot.safe) {
                            $('#bot-text').html("Search bot");
                        }
                        else if (!result.visitorId && result.bot && !result.bot.safe) {
                            $('#bot-text').html("None-Search bot");
                        }
                        else {
                            $('#bot-text').html("Not a bot");
                        }

                        hasResponded = true;
                        $('#subdomain-text').append(" [Press '`' to Toggle]");
                        visitor_id = result.visitorId;
                        API_endpoint = visitor_id + "?token=" + API_token + "&limit=" + limit;
    })
    .catch(error => { console.log(error);
                        $('#visitorid-text').html(error);
                        $('#bot-text').html(error);
                        switch (error.message) {
                            case FingerprintJS.ERROR_GENERAL_SERVER_FAILURE:
                                console.log("unknown server error. Request id:", error.requestId);
                                break;
                            case FingerprintJS.ERROR_GENERAL_SERVER_TIMEOUT:
                                console.log("Identification time limit of 10 seconds is exceeded");
                                break;
                            default:
                                console.log('Other error');
                        }

                        hasResponded = true;
                        $('#subdomain-text').append(" [Press '`' to Toggle]");
    });
};

initFingerprintJS();

const print_result = (idx, request_id, request_type, browser_name, os, version, incognito, ip, time, country, city , postal, url) => {
    $(`#visitorid-info-text-result-${idx}`).html(`<div class=\"result-header\" id=\"request-id-${idx}\">Request ID: ${request_id}</div>`);
    $(`#visitorid-info-text-result-${idx}`).append(`<div class=\"visitor-info-text-col\" id=\"visitorid-info-${idx}\"></div>`);
    
    $(`#visitorid-info-${idx}`).html(`<span>Request Type:</span><span class=\"result-text\" id=\"type-${idx}\">${request_type}</span>
                                        <span>Browser Name:</span><span class=\"result-text\" id=\"browser-${idx}\">${browser_name}</span>
                                        <span>OS + Version:</span><span class=\"result-text\" id=\"os-${idx}\">${os + " " + version}</span>`);

    $(`#visitorid-info-${idx}`).append(`<span>Incognito:</span><span class=\"result-text\" id=\"incognito-${idx}\">${incognito}</span>
                                        <span>IP:</span><span class=\"result-text\" id=\"ip-${idx}\">${ip}</span>
                                        <span>Time:</span><span class=\"result-text\" id=\"time-${idx}\">${time}</span>`);

    $(`#visitorid-info-${idx}`).append(`<span>Country:</span><span class=\"result-text\" id=\"country-${idx}\">${country}</span>
                                        <span>City:</span><span class=\"result-text\" id=\"city-${idx}\">${city}</span>
                                        <span>Postal:</span><span class=\"result-text\" id=\"postal-${idx}\">${postal}</span>`);
    $(`#visitorid-info-text-result-${idx}`).append(`<span id=\"url-${idx}\">URL: ${url}</span`);
}

$('#history-button').on('click', () => {
    API_endpoint = visitor_id + "?token=" + API_token + "&limit=" + limit;

    $.get(Base_URL + API_endpoint + before, (response, status) => {
        console.log(response);
        console.log(status);
        before = "";

        $('#visitor-info-container').html(`<div class=\"max-result-col\" id=\"max-result\">
                                                <span>Show</span>
                                                <select name=\"max_page\" id=\"max_page\" onchange=\"onKeyUp_page()\"></select>
                                                <span>per page</span>
                                            </div>`);
        $('#max_page').html(`<option value=\"10\">10</option>
                            <option value=\"20\">20</option>
                            <option value=\"50\">50</option>
                            <option value=\"100\">100</option>`);
        $('#max_page').val(limit);
        $('#max-result').append(`<span><b>Visitor ID History</b></span>`);
        $('#max-result').append(`<span></span><span>Results on page: ${response.visits.length}</span></div>`);
        $('#visitor-info-container').append(`<div class=\"visitor-info-text-row\" id=\"visitor-info-text-row\">`);                        
        $('#visitor-info-text-row').html("");

        if (status === "success") {
            arr = response.visits;

            for (let i = 0; i < arr.length; i++) {
                $('#visitor-info-text-row').append(`<div class=\"visitor-info-text-row-result\" id=\"visitorid-info-text-result-${i}\">`);
                
                print_result(i, arr[i].requestId, arr[i].tag.requestType, arr[i].browserDetails.browserName, arr[i].browserDetails.os, 
                                arr[i].browserDetails.osVersion, arr[i].incognito, arr[i].ip, arr[i].time, 
                                arr[i].ipLocation.country.name, arr[i].ipLocation.city.name, arr[i].ipLocation.postalCode,
                                arr[i].url);
            }

            if (response.lastTimestamp != undefined) {
                if (prev_timestamp === 0) {
                    previous_timestamps = [0];
                }

                $('#visitor-info-container').append(`<div class=\"pagination\" id=\"pagination-1\"></div>`);

                if (previous_timestamps.length > 0) {
                    if (prev_timestamp !== 0) {
                        $('#pagination-1').append(`<span></span><span class=\"page-number\" id=\"previous-1\"><< Previous</span><span></span>`);
                    }
                    else {
                        $('#pagination-1').append(`<span></span><span></span>`);
                    }

                    $('#previous-1').on('click', () => {
                        if (previous_timestamps[previous_timestamps.length - 1] == prev_timestamp) {
                            console.log("popped:");
                            console.log(previous_timestamps.pop());

                            if (prev_timestamp === 0) {
                                previous_timestamps = [0];
                            }
                        }

                        prev_timestamp = previous_timestamps.pop();
                        before = "&before=" + prev_timestamp;
                        console.log("--------Previous---------");
                        console.log(previous_timestamps);
                        console.log(Base_URL + API_endpoint + before);
                        console.log("--------------------------");
                        $('#history-button').trigger('click');
                    });
                }
                else {
                    $('#pagination-1').append(`<span></span><span></span>`);
                }

                $('#pagination-1').append(`<span class=\"page-number\" id=\"next-1\">Next >></span>`);

                $('#next-1').on('click', () => {
                    prev_timestamp = response.lastTimestamp;
                    before = "&before=" + response.lastTimestamp;
                    previous_timestamps.push(response.lastTimestamp);

                    console.log("------------Next-----------");
                    console.log(previous_timestamps);
                    console.log(Base_URL + API_endpoint + before);
                    console.log("---------------------------");
                    $('#history-button').trigger('click');
                });
            }  
            else {
                $('#visitor-info-container').append(`<div class=\"pagination\" id=\"pagination-1\"></div>`);

                if (previous_timestamps.length > 0) {
                    $('#pagination-1').append(`<span></span><span class=\"page-number\" id=\"previous-1\"><< Previous</span>`);
                    $('#pagination-1').append(`<span class=\"page-number\" id=\"next-1\">End of Page</span>`);

                    $('#previous-1').on('click', () => {
                        if (previous_timestamps[previous_timestamps.length - 1] == prev_timestamp) {
                            console.log("popped:");
                            console.log(previous_timestamps.pop());
                        }

                        prev_timestamp = previous_timestamps.pop();
                        before = "&before=" + prev_timestamp;
                        console.log("--------Previous---------");
                        console.log(previous_timestamps);
                        console.log(Base_URL + API_endpoint + before);
                        console.log("--------------------------");
                        $('#history-button').trigger('click');
                    });               
                }
                else {
                    $('#pagination-1').append(`<span></span><span></span><span class=\"page-number\" id=\"next-1\">End of Page</span>`);
                }
            }
        }
        else {
            $('#visitor-info-container').html(`<span class=\"error-msg\">No visitor information<span>`);
        }
    });
});

function onKeyUp_page() {
    previous_timestamps = [];
    prev_timestamp = 0;

    limit = $('#max_page').val();
    $('#max_page').val(limit);
    $('#history-button').trigger('click');
}

const sanitizeHTML = function (str) {
    return str.replace(/[^\w. ]/gi, function (c) {
        return '&#' + c.charCodeAt(0) + ';';
    });
};

$('#message-form').on('submit', (evt) => {
   evt.preventDefault();

   if ($('#message').val() === "") {
        $('#flash-msg').html("Message cannot be empty!");
   }
   else {
        const custom_tags = { "message": sanitizeHTML($('#message').val()),
                                "requestType": "send message" };
            
        fp.get({tag: custom_tags, linkedId: 1})
            .then(result => { console.log(result.tag);
                                $('#flash-msg').html("Message sent!");
                                $('#message').val("");})
            .catch(error => { console.log(error);
                    $('#flash-msg').html(error);
                    switch (error.message) {
                        case FingerprintJS.ERROR_GENERAL_SERVER_FAILURE:
                            console.log("unknown server error. Request id:", error.requestId);
                            break;
                        case FingerprintJS.ERROR_GENERAL_SERVER_TIMEOUT:
                            console.log("Identification time limit of 10 seconds is exceeded");
                            break;
                        default:
                            console.log('Other error');
                    }
            });
   }
});

function onKeyUp_viewmsg() {
    previous_timestamps_msg = [];
    prev_timestamp_msg = 0;

    limit = $('#max_page').val();
    $('#max_page').val(limit);
    $('#mesage-button').trigger('click');
}

function onKeyUp_requesttype() {
    previous_timestamps_msg = [];
    prev_timestamp_msg = 0;

    request = $('#request-type').val();

    if (request === "send-message") {
        request_type = "send message";
        linked_id = 1;
    }
    else if (request === "view-page") {
        request_type = "view page";
        linked_id = 0;
    }

    $('#request-type').val(request);
    $('#message-button').trigger('click');
}

$('#message-button').on('click', () => {
    API_endpoint = visitor_id + "?token=" + API_token + "&limit=" + limit;
    
    /*
    const requestMetadata = { requestType: request_type }
    
    fp.get({ tag: requestMetadata, extendedResult: true })
        .then(result => { console.log(result); })
        .catch(error => console.error(error));
    */

    $.get(Base_URL + API_endpoint + before + "&linked_id=" + linked_id, (response, status) => {
        console.log(response);
        before = "";

        $('#visitor-info-container').html(`<div class=\"max-result-col\" id=\"max-result\">
                                                <span>Show</span>
                                                <select name=\"max_page\" id=\"max_page\" onchange=\"onKeyUp_viewmsg()\"></select>
                                                <span>per page</span>
                                            </div>`);
        $('#max_page').html(`<option value=\"10\">10</option>
                            <option value=\"20\">20</option>
                            <option value=\"50\">50</option>
                            <option value=\"100\">100</option>`);
        $('#max_page').val(limit);
        $('#max-result').append(`<span><b>Message History</b></span>`);
        $('#max-result').append(`<span>Filter by</span>
                                <select name=\"request-type\" id=\"request-type\" onchange=\"onKeyUp_requesttype()\"></select></div>`);
        $('#visitor-info-container').append(`<div class=\"visitor-info-text-row\" id=\"visitor-info-text-row\">`);                        
        $('#request-type').html(`<option value=\"send-message\">Sent Messages</option>
                            <option value=\"view-page\">View Pages</option>`);
        $('#visitor-info-text-row').html("");
        $('#max_page').val(limit);
        $('#request-type').val(request);

        if (status === "success") {
            arr = response.visits;

            for (let i = 0; i < arr.length; i++) {
                $('#visitor-info-text-row').append(`<div class=\"visitor-info-text-row-result\" id=\"visitorid-info-text-result-2-${i}\">`);

                if (linked_id === 1) {
                    print_result_sent(i, arr[i].requestId, arr[i].tag.requestType, arr[i].tag.message, arr[i].time, arr[i].ip);
                }
                else if (linked_id === 0) {
                    print_result_view(i, arr[i].requestId, arr[i].tag.requestType, arr[i].time, arr[i].ip, 
                                        arr[i].ipLocation.country.name, arr[i].ipLocation.city.name, arr[i].ipLocation.postalCode);
                }
            }

            if (response.lastTimestamp != undefined) {
                if (prev_timestamp_msg === 0) {
                    previous_timestamps_msg = [0];
                }

                $('#visitor-info-container').append(`<div class=\"pagination\" id=\"pagination-2\"></div>`);

                if (previous_timestamps_msg.length > 0) {
                    if (prev_timestamp_msg !== 0) {
                        $('#pagination-2').append(`<span></span><span class=\"page-number\" id=\"previous-2\"><< Previous</span><span></span>`);
                    }
                    else {
                        $('#pagination-2').append(`<span></span><span></span>`);
                    }

                    $('#previous-2').on('click', () => {
                        if (previous_timestamps_msg[previous_timestamps_msg.length - 1] == prev_timestamp_msg) {
                            console.log("popped:");
                            console.log(previous_timestamps_msg.pop());

                            if (prev_timestamp_msg === 0) {
                                previous_timestamps_msg = [0];
                            }
                        }

                        prev_timestamp_msg = previous_timestamps_msg.pop();
                        before = "&before=" + prev_timestamp_msg;
                        console.log("--------Previous---------");
                        console.log(previous_timestamps_msg);
                        console.log(Base_URL + API_endpoint + before);
                        console.log("--------------------------");
                        $('#message-button').trigger('click');
                    });
                }
                else {
                    $('#pagination-2').append(`<span></span><span></span>`);
                }

                $('#pagination-2').append(`<span class=\"page-number\" id=\"next-2\">Next >></span>`);

                $('#next-2').on('click', () => {
                    prev_timestamp_msg = response.lastTimestamp;
                    before = "&before=" + response.lastTimestamp;
                    previous_timestamps_msg.push(response.lastTimestamp);

                    console.log("------------Next-----------");
                    console.log(previous_timestamps_msg);
                    console.log(Base_URL + API_endpoint + before);
                    console.log("---------------------------");
                    $('#message-button').trigger('click');
                });
            }  
            else {
                $('#visitor-info-container').append(`<div class=\"pagination\" id=\"pagination-2\"></div>`);

                if (previous_timestamps_msg.length > 0) {
                    $('#pagination-2').append(`<span></span><span class=\"page-number\" id=\"previous-2\"><< Previous</span>`);
                    $('#pagination-2').append(`<span class=\"page-number\" id=\"next-2\">End of Page</span>`);

                    $('#previous-2').on('click', () => {
                        if (previous_timestamps_msg[previous_timestamps_msg.length - 1] == prev_timestamp_msg) {
                            console.log("popped:");
                            console.log(previous_timestamps_msg.pop());
                        }

                        prev_timestamp_msg = previous_timestamps_msg.pop();
                        before = "&before=" + prev_timestamp_msg;
                        console.log("--------Previous---------");
                        console.log(previous_timestamps_msg);
                        console.log(Base_URL + API_endpoint + before);
                        console.log("--------------------------");
                        $('#message-button').trigger('click');
                    });               
                }
                else {
                    $('#pagination-2').append(`<span></span><span></span><span class=\"page-number\" id=\"next-2\">End of Page</span>`);
                }
            }
        }
        else {
            $('#visitor-info-container').html(`<span class=\"error-msg\">No visitor information<span>`);
        }
    });
});

const print_result_sent = (idx, request_id, request_type, msg, timestamp, ip) => {
    $(`#visitorid-info-text-result-2-${idx}`).html(`<div class=\"result-header\" id=\"request-id-${idx}\">Request ID: ${request_id}</div>`);
    $(`#visitorid-info-text-result-2-${idx}`).append(`<div class=\"visitor-info-text-col\" id=\"visitorid-info-${idx}\"></div>`);

    $(`#visitorid-info-${idx}`).html(`<span>Request Type:</span><span class=\"result-text\" id=\"type-${idx}\">${request_type}</span>
                                    <span>Time:</span><span class=\"result-text\" id=\"time-${idx}\">${timestamp}</span>
                                    <span>IP:</span><span class=\"result-text\" id=\"ip-${idx}\">${ip}</span>`);

    $(`#visitorid-info-text-result-2-${idx}`).append(`<span id=\"msg-${idx}\">Message: ${msg}</span>`);
}

const print_result_view = (idx, request_id, request_type, timestamp, ip, country, city, postal) => {
    $(`#visitorid-info-text-result-2-${idx}`).html(`<div class=\"result-header\" id=\"request-id-${idx}\">Request ID: ${request_id}</div>`);
    $(`#visitorid-info-text-result-2-${idx}`).append(`<div class=\"visitor-info-text-col\" id=\"visitorid-info-${idx}\"></div>`);

    $(`#visitorid-info-${idx}`).html(`<span>Request Type:</span><span class=\"result-text\" id=\"type-${idx}\">${request_type}</span>
                                    <span>Time:</span><span class=\"result-text\" id=\"time-${idx}\">${timestamp}</span>
                                    <span>IP:</span><span class=\"result-text\" id=\"ip-${idx}\">${ip}</span>`);

    $(`#visitorid-info-${idx}`).append(`<span>Country:</span><span class=\"result-text\" id=\"country-${idx}\">${country}</span>
                                    <span>City:</span><span class=\"result-text\" id=\"city-${idx}\">${city}</span>
                                    <span>Postal:</span><span class=\"result-text\" id=\"postal-${idx}\">${postal}</span>`);
}