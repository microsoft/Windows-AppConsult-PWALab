(function($) {
  "use strict"; // Start of use strict

  $(document).ready(function() {

    var baseUrl = 'https://ready2019-pwa.azurewebsites.net';

    fetch(baseUrl + '/api/messages')
    .then(json)
    .then(function (data) {
        $('#messages').html(data.count + " New Messages!");
      });
        
    fetch(baseUrl + '/api/tasks')
    .then(json)
    .then(function (data) {
      $('#tasks').html(data.count + " New Tasks!");
    });

    fetch(baseUrl + '/api/orders')
    .then(json)
    .then(function (data) {
      $('#orders').html(data.count + " New Orders!");
    });

    fetch(baseUrl + '/api/tickets')
    .then(json)
    .then(function (data) {
      $('#tickets').html(data.count + " New Tickets!");
    });        

    var urlParams = new URLSearchParams(window.location.search);
    var title = urlParams.get('title');
    var message = urlParams.get('message');

    $('#notificationTitle').html(title);
    $('#notificationMessage').html(message);

  });

  function json(response) {
    return response.json();
  }

  // Toggle the side navigation
  $("#sidebarToggle").on('click',function(e) {
    e.preventDefault();
    $("body").toggleClass("sidebar-toggled");
    $(".sidebar").toggleClass("toggled");
  });

  // Prevent the content wrapper from scrolling when the fixed side navigation hovered over
  $('body.fixed-nav .sidebar').on('mousewheel DOMMouseScroll wheel', function(e) {
    if ($(window).width() > 768) {
      var e0 = e.originalEvent,
        delta = e0.wheelDelta || -e0.detail;
      this.scrollTop += (delta < 0 ? 1 : -1) * 30;
      e.preventDefault();
    }
  });

  // Scroll to top button appear
  $(document).on('scroll',function() {
    var scrollDistance = $(this).scrollTop();
    if (scrollDistance > 100) {
      $('.scroll-to-top').fadeIn();
    } else {
      $('.scroll-to-top').fadeOut();
    }
  });

  // Smooth scrolling using jQuery easing
  $(document).on('click', 'a.scroll-to-top', function(event) {
    var $anchor = $(this);
    $('html, body').stop().animate({
      scrollTop: ($($anchor.attr('href')).offset().top)
    }, 1000, 'easeInOutExpo');
    event.preventDefault();
  });

})(jQuery); // End of use strict