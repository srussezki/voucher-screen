var context = {
  idBuffer: [],
  userId: null,
  discounts: [],
  dicountPointer: null,
  userHistory: {}
}


$('html').on('keydown', function(e) {
  if(e.key === 'Enter') {
    context.userId = context.idBuffer.join('');
    processUser(context.userId);
    toggleMediaContainers();
  } else {
    context.idBuffer.push(e.key);
  }
  setTimeout(resetBuffer, 1200);
})

function isInt(value) {
  return !isNaN(value) &&
         parseInt(Number(value)) == value &&
         !isNaN(parseInt(value, 10));
}

function resetBuffer() {
  context.idBuffer = [];
}

function processUser(userId) {
  console.log("processing user="+context.userId);
  $('#userField').html(context.userId);

  showDiscount(userId);
}


fetchFromSpreadsheet('1XY_qp9C9Qjazm635E-Bad_8kW0foA1SeET0CN2QLP8k');


function showDiscount (userId) {
  var pointer = context.userHistory[userId];

  if(pointer == undefined && (context.dicountPointer == null || context.dicountPointer++ >= context.discounts.length - 1)) {
    context.dicountPointer = 0;
  }

  if(pointer == undefined) {
    pointer = context.dicountPointer;
    context.userHistory[userId] = pointer;
  }

  $(`.discount[data-discount]`).addClass('hidden');
  $(`.discount[data-discount="${pointer}"]`).removeClass('hidden');

  if(isInt(userId)) {
    $('.user-message').removeClass('hidden');
    $('.user-error').addClass('hidden');
    $('.user-id').html(userId);
  } else {
    $('.user-message').addClass('hidden');
    $('.user-error').removeClass('hidden');
  }
}

function renderAllDiscounts () {
  context.discounts.forEach( (discount, i) => {
    console.log(discount);
    $('.discounts').append(`<div data-discount="${i}" class="discount hidden">
      <h2>${discount.description}</h2>
      <div class="discount-img-box"><img src="${discount.imagelink}"  /></div>
      <div class="price-box">
        <div class="regular-price">
          <span>${splitPrice(discount.regularprice, 0)}</span>
          <span class="cents">${splitPrice(discount.regularprice, 1)}</span>
          <div class="line"></div>
        </div>
        <div class="promo-price">
          <span>${splitPrice(discount.promoprice, 0)}</span>
          <span class="cents">${splitPrice(discount.promoprice, 1)}</span>
        </div>
      </div>
    </div>`);
  })
}


function prettifyGoogleSheetsJSON(data) {
    for (var i = 0; i < data.feed.entry.length; i++) {
        for (var key in data.feed.entry[i]) {
            if (data.feed.entry[i].hasOwnProperty(key) && key.substr(0,4) === 'gsx$') {
                // copy the value in the key up a level and delete the original key
                data.feed.entry[i][key.substr(4)] = data.feed.entry[i][key].$t;
                delete data.feed.entry[i][key];
            }
        }
    }
    return data.feed.entry;
}


function fetchFromSpreadsheet(spreadsheetKey, sheetNumber){
    var number = sheetNumber ? sheetNumber : 'od6',
        spreadsheetUrl = "https://spreadsheets.google.com/feeds/list/"+spreadsheetKey+"/"+number+"/public/values?alt=json";

    $.get(spreadsheetUrl)
        .then( (resp) => {
            return prettifyGoogleSheetsJSON(resp);
        })
        .then( data => {
          context.discounts = JSPath.apply('. {.isonline === "yes"}', data);
          renderAllDiscounts();
// showDiscount(22)
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

    setTimeout(toggleMediaContainers, 3000);
  }
}


function splitPrice(price, position) {
  var decimal = price.indexOf(',', price) > -1 ? ',' : '.';
  return price.split(decimal)[position];
}

// setTimeout(() => {toggleMediaContainers();}, 10)
