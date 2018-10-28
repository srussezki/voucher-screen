var SPLASHSCREEN_TIMEOUT = 10000;

var spreadsheetUrl = 'https://script.google.com/macros/s/AKfycbzgkPo7XEECsH4xaqMB0cqxV9BKd5G7-eNyubC5KAjazgozxJU/exec';
var storesUrl = 'https://script.google.com/macros/s/AKfycbz_x_LtmRjTvSE98oomKQ8nFybvd9_L7p8fwKsQDmgHuipG_X8/exec';
var discountsUrl = 'https://script.google.com/macros/s/AKfycbw5FyGeGuV7JDHng-NhlSpASUyUOHn1QshrRKFW_ic1kIR7RYo/exec';

var context = {
  idBuffer: [],
  userId: null,
  discounts: [],
  dicountPointer: null,
  userHistory: {},
  storeKey: localStorage.getItem('storeKey')
}



$(document).ready(function () {

  if(!context.storeKey) {
    return handleInitState();
  }

  $('html').on('keydown', function(e) {
    if(e.key === 'Enter') {
      context.userId = context.idBuffer.join('');
      processUser(context.userId);
      toggleMediaContainers();
    } else {
      context.idBuffer.push(e.key);
    }
    setTimeout(resetBuffer, 500);
  })

  preloadDiscounts();

  // --- DEBUG ---
  // context.userId = 233;
  // setTimeout(() => {
  //   var event = $.Event('keydown');
  //       event.key = 7;
  //       $('html').trigger(event);
  //   var event = $.Event('keydown');
  //       event.key = 'Enter';
  //       $('html').trigger(event);
  // }, 800)
  // setTimeout(() => {processUser.bind(null, 123)}, 1000)

});



// --- FUNCTIONS ---

function resetBuffer() {
  context.idBuffer = [];
}

function processUser() {
  console.log("processing user="+context.userId);
  $('#user-id').html(context.userId);

  showDiscount();

  if(context.userId) {
    $.get(spreadsheetUrl, {
      'UserId': context.userId,
      'Store': context.storeKey
    });
  }
}


function showDiscount () {
  var userId = context.userId,
      pointer = context.userHistory[userId];

  if(pointer == undefined && (context.dicountPointer == null || context.dicountPointer++ >= context.discounts.length - 1)) {
    context.dicountPointer = 0;
  }

  if(pointer == undefined) {
    pointer = context.dicountPointer;
    context.userHistory[userId] = pointer;
  }

  $(`[data-discount]`).addClass('hidden');
  $(`[data-discount="${pointer}"]`).removeClass('hidden');

  if(isInt(userId)) {
    $('.message-box').removeClass('message-box__error');
    $('.user-id').html(userId);
  } else {
    $('.message-box').addClass('message-box__error');
  }
}

function preloadDiscounts() {
  $.get(discountsUrl).then(function(response) {

    context.discounts = response.data;

    context.discounts.forEach( (discount, i) => {
      $('.discounts_picture').append(`<img src="${discount.imageLink}" data-discount="${i}" class="hidden" />`);

      $('.discounts_prices').append(`<div data-discount="${i}" class="price-box hidden">
          <div class="regular-price-container">
            <div class="regular-price">
              <span>${splitPrice(discount.regularPrice, 0)}</span>
              <span class="cents">${splitPrice(discount.regularPrice, 1)}</span>
              <div class="line"></div>
            </div>
          </div>
          <div class="promo-price">
            <span>${splitPrice(discount.promoPrice, 0)}</span>
            <span class="cents">${splitPrice(discount.promoPrice, 1)}</span>
          </div>
        </div>`);
    })

  });
}


function toggleMediaContainers() {
  var $video = $('.video-container'),
      $discounts = $('.discounts-container'),
      video = document.getElementById('video');

  if(!$discounts.hasClass('hidden')) {
    $video.removeClass('hidden');
    $discounts.addClass('hidden');

    video.play();
  } else {
    $discounts.removeClass('hidden');
    // $video.addClass('hidden');
    video.pause();
    // video.currentTime = 0;

    setTimeout(toggleMediaContainers, SPLASHSCREEN_TIMEOUT);
  }
}
