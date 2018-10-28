function isInt(value) {
  return !isNaN(value) &&
    parseInt(Number(value)) == value &&
    !isNaN(parseInt(value, 10));
}

function splitPrice(price, position) {
  var decimal = String(price).indexOf(',', price) > -1 ? ',' : '.';
  return String(price).split(decimal)[position];
}


function handleInitState() {
  console.log("no store key defined");
  document.getElementById('video').pause();

  var stores = $.get(storesUrl).then(render);



  function render(response) {
    var stores = response.data;

    $('body').html(`
    <div style="z-index: 100; margin: 50px;">
      <h1>Bitte geben Sie den Standort ein</h1>
      <div style="margin-top: 50px;">
        <form id="store-confirmation">
          ${stores.map(renderOption).join('<br/>')}
          <input type="submit" style="float:right;" value="Bestätigen" />
        </form>
      </div>
    </div>
    `);

    $('#store-confirmation').submit(function(e) {
      e.preventDefault();

      var storeKey = $('#store-confirmation input:checked').val();

      if (storeKey) {
        localStorage.setItem('storeKey', storeKey);
        window.location.href = window.location.href;
      }
    })

  }


  function renderOption(store, i) {
    return `
      <label style="font-size: x-large; margin: 5px 0; border-bottom: solid 1px silver; width: 100%;">
        <input type="radio" name="store" value="${store.Key}">
        ${store.Key} - ${store.Location}
      </label>`
  }
}
