(function($) {
  "use strict"; // Start of use strict

  var baseUrl = 'https://ready2019-pwa.azurewebsites.net';
    
  async function updateMessages() {
    var url = baseUrl + '/api/messages';

    let httpResult = await fetch(url);
    let jsonResult = await httpResult.json();
    $('#messages').html(jsonResult.count + ' New messages!');
  }

  async function updateTasks() {
    var url = baseUrl + '/api/tasks';

    let httpResult = await fetch(url);
    let jsonResult = await httpResult.json();
    $('#tasks').html(jsonResult.count + ' New tasks!');
  }

  async function updateOrders() {
    var url = baseUrl + '/api/orders';

    let httpResult = await fetch(url);
    let jsonResult = await httpResult.json();
    $('#orders').html(jsonResult.count + ' New orders!');
  }

  async function updateTickets() {
    var url = baseUrl + '/api/tickets';

    let httpResult = await fetch(url);
    let jsonResult = await httpResult.json();
    $('#tickets').html(jsonResult.count + ' New tickets!');
  }

  document.addEventListener('DOMContentLoaded', async function() {
    await Promise.all([updateMessages(), updateTasks(), updateOrders(), updateTickets()]);
   
    var urlParams = new URLSearchParams(window.location.search);
    var title = urlParams.get('title');
    var message = urlParams.get('message');

    $('#notificationTitle').html(title);
    $('#notificationMessage').html(message);
  });

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