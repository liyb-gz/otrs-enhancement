// ==UserScript==
// @name         OTRS Enhanced
// @namespace    http://tampermonkey.net/
// @version      1.01
// @description  Enhance OTRS with keyboard shortcuts and prefilled contents
// @author       Felix Li
// @match        https://support.cle.ust.hk/otrs/index.pl*
// @grant        none
// ==/UserScript==


(function($) {
    'use strict';

    var CLASSIFIED_QUEUE_PAGE = 'https://support.cle.ust.hk/otrs/index.pl?Action=AgentTicketQueue;QueueID=28;View=;Filter=Unlocked';
    var RAW_QUEUE_PAGE = 'https://support.cle.ust.hk/otrs/index.pl?Action=AgentTicketQueue;QueueID=2;View=;Filter=Unlocked';
    var CLASSIFIED_QUEUE_NUMBER = 28;

    var action = getUrlParameter('Action');

    // Default tip text
    var tip_text = "OTRS-E Activated. ";

    if (!$('body').is('.Popup, .LoginScreen')) {
        tip_text += "<span class='keytips'>d</span> - Go to <b>d</b>ashboard. ";
        tip_text += "<span class='keytips'>q</span> - Go to classified <b>q</b>ueue. ";
        tip_text += "<span class='keytips'>w</span> - Go to ra<b>w</b> queue. ";
    }

    // General Tricks for every page:
    $(document).keydown(function (event) {
        if ($(event.target).is('body:not(.Popup):not(.LoginScreen)') && !event.ctrlKey && !event.altKey && !event.shiftKey) {
            switch (event.key) {
                    // press 'q' and go to the clssified queue
                case 'q':
                    window.location.href = CLASSIFIED_QUEUE_PAGE;
                    break;

                    // press 'd' and go to dashboard
                case 'd':
                    window.location.href =  $('#nav-Dashboard a').attr('href');
                    break;

                case 'w':
                    window.location.href = RAW_QUEUE_PAGE;
                    break;
            }
        }
    });

    switch (action) {
        case "AgentTicketOwner":
            changeOwner();
            break;

        case "AgentTicketNote":
            createNote();
            break;

        case "AgentTicketClose":
            closeTicket();
            break;

        case "AgentTicketZoom":
            showTicket();
            break;

        case "AgentDashboard":
            showDashboard();
            break;

        case "AgentTicketQueue":
            showQueue();
            break;
    }

    // Functions for action switch
    function changeOwner () {
        // Alt + g is a original shortcut provided by OTRS
        tip_text += "<span class='keytips'>Alt + g</span> - Submit. ";

        $('#NewOwnerID').change(function () {
            var TEXT = 'Change owner to ' + $(this).find('option:selected').text();
            $('#Subject').val(TEXT);
            $('#cke_RichText iframe').contents().find('body').html(TEXT);
            $('#TimeUnits').val(0);
        });

        // Get focus on the owner selector
        $('#NewOwnerID_Search').trigger('focus');
    }

    function createNote() {
        // Alt + g is a original shortcut provided by OTRS
        tip_text += "<span class='keytips'>Alt + g</span> - Submit. ";
        var TEXT = 'Time count';

        // Default subject line
        $('#Subject').val(TEXT);
        $('#Subject').select();
        $('#Subject').trigger('focus');

        $('#Subject').blur(function (){
            // If creating a new note but not for counting time, set the time unit to 0
            if ($(this).val() !== TEXT) {
                $('#TimeUnits').val(0);

                if ($(this).val() === '') {
                    // Defalut name of a note
                    $(this).val('Note');
                }
            } else {
                $('#TimeUnits').val('');
                $('#cke_RichText iframe').contents().find('body').html(TEXT);
            }
        });
    }

    function closeTicket() {
        // Alt + g is a original shortcut provided by OTRS
        tip_text += "<span class='keytips'>Alt + g</span> - Submit. ";
        var TEXT = "Request done, case closed";

        $('#Subject').val(TEXT);
        $('#TimeUnits').val(0);
        $('#RichText').val(TEXT);
    }

    function showTicket() {
        tip_text += "<span class='keytips'>p</span> <span class='keytips'>o</span> - Change <b>o</b>wner. ";
        tip_text += "<span class='keytips'>n</span> - Create <b>n</b>ote. ";
        tip_text += "<span class='keytips'>c</span> - <b>C</b>lose ticket. ";
        tip_text += "<span class='keytips'>r</span> - <b>R</b>eply. ";
        tip_text += "<span class='keytips'>l</span> - <b>L</b>ock ticket. ";
        tip_text += "<span class='keytips'>m</span> - Toggle '<b>M</b>ove' dropdown. ";
        tip_text += "<span class='keytips'>Ctrl + UP</span> - Prev article. ";
        tip_text += "<span class='keytips'>Ctrl + DOWN</span> - Next Article. ";

        $(document).keydown(function (event) {
            console.log(event.key);
            if (!event.ctrlKey && !event.altKey && !event.shiftKey) {
                switch (event.key) {
                    case 'p':
                    case 'o':
                        // Change owner
                        $('#nav-Owner a').trigger('click');
                        break;

                    case 'n':
                        // Create new note
                        $('#nav-Note a').trigger('click');
                        break;

                    case 'c':
                        // Close ticket
                        $('#nav-Close a').trigger('click');
                        break;

                    case 'm':
                        // Move to queue
                        if ($('#DestQueueID').is('[size]')) {
                            $('#DestQueueID').removeAttr('size');
                        } else {
                            $('#DestQueueID').attr('size', $('#DestQueueID').find('option').length);
                            $('#DestQueueID').trigger('focus');
                        }
                        break;

                    case 'l':
                        // Lock ticket
                        if ($('#nav-Lock a').length) {
                            $('#nav-Lock a')[0].click();
                        }
                        break;

                    case 'r':
                        // Reply, in the "ResponseID" select tag, option valued '1' is standard reply.
                        if( $('#ResponseID').length) {
                            $('#ResponseID').val('1').change();
                        }
                        break;
                }
            } else if (event.ctrlKey && !event.altKey && !event.shiftKey) {
                // For ctrl + arrow up/down
                var activeArticle = $('#ArticleTable tbody tr.Active');

                switch (event.key) {
                    case 'ArrowUp':
                        if ($('#ArticleTable tbody tr.Active').prev().length) {
                            $('#ArticleTable tbody tr.Active').prev()[0].click();
                        }
                        break;

                    case 'ArrowDown':
                        if ($('#ArticleTable tbody tr.Active').next().length) {
                            $('#ArticleTable tbody tr.Active').next()[0].click();
                        }
                        break;
                }
            }
        });
    }

    function showDashboard() {
        // Get the index of title
        // Currently all paenls are showing tickets in exactly the same way, so I just get the index once, instead of getting the index for each panel.
        // +1, because CSS selector starts from 1, but jQuer1y starts from 0.
        var titleIndex = $('#Dashboard0120-TicketNew-box .DataTable .DashboardHeader').index($('#Dashboard0120-TicketNew-box .DataTable .DashboardHeader.Title')) + 1;

        // Do the tricks on the first 10 elements
        $('#Dashboard0120-TicketNew-box .DataTable .MasterAction, #Dashboard0130-TicketOpen-box .DataTable .MasterAction').slice(0, 10).each(function (index) {
            var realIndex = (index + 1) % 10;

            var $ticket = $(this);
            $ticket.find('td:nth-child(' + titleIndex + ') div').prepend("<span class='keytips'>" + realIndex + "</span> ");

            // bind number 1-0 to the first 10 tickets
            $(document).keydown(function (event) {
                if (!event.ctrlKey && !event.altKey) {
                    if (event.key === realIndex.toString()) {
                        $ticket.trigger('click');
                    }
                }
            });
        });
    }

    function showQueue() {
        // Get the index of title
        // +1, because CSS selector starts from 1, but jQuery starts from 0.
        var ticketIndex = $('#OverviewBody table>thead>tr>th').index($('#OverviewBody table>thead>tr>th.TicketNumber')) + 1;

        // Do the tricks on the first 10 elements
        $('#OverviewBody table .MasterAction').slice(0, 10).each(function (index) {
            var realIndex = (index + 1) % 10;

            var $ticket = $(this);
            $ticket.find('td:nth-child(' + ticketIndex + ')').prepend("<span class='keytips'>" + realIndex + "</span> ");

            // bind number 1-0 to the first 10 tickets
            $(document).keydown(function (event) {
                if (!event.ctrlKey && !event.altKey) {
                    if (event.key === realIndex.toString()) {
                        $ticket.trigger('click');
                    }
                }
            });
        });
    }

    // Insert Style
    $('head').append('<style>.keytips{background: #ffc;padding: .25rem;border-radius: .25rem;font-weight: bold;border: solid thin darkgray;} </style>');

    // Insert Tips
    $('[role="main"]').first().prepend('<div id="OTRS-E" style="background: #eee;padding: .75rem; margin-top: .5rem">' + tip_text + '</div>');


    // External helper functions
    function getUrlParameter(sParam) {
        var sPageURL = decodeURIComponent(window.location.search.substring(1)),
            sURLVariables = sPageURL.split(';'),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : sParameterName[1];
            }
        }
    }

    function wait(condition, method) {
        if (condition) {
            method();
        } else {
            setTimeout( function() {
                wait(condition, method);
            }, 50);
        }
    }
})(jQuery);