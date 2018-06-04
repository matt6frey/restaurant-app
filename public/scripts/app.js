
$(document).ready(function() {

$('button.delete').on('click', (event) => {
  event.preventDefault();
  console.log($(this).closest('div.order_container').find('div.order_container'));
  $(this).closest('div.order_container').find('div.order_container').fadeOut('slow', 'linear');
});

$('button').on('click', (event) => {
  // Show only the correct menu items from click
  const target = $(event.target).attr('class');
  const menuBtns = ['all btn', 'breakfast btn', 'lunch btn', 'dinner btn'];
  if(menuBtns.indexOf(target) !== -1) {
    event.preventDefault();
    switch (menuBtns.indexOf(target)) {
      case 1:
        console.log("b");
        $('div.lunch, div.dinner').fadeOut( "slow", "linear" );
        $('div.breakfast').fadeIn( "slow", "linear" );
      break;
      case 2:
        $('div.breakfast, div.dinner').fadeOut( "slow", "linear" );
        $('div.lunch').fadeIn( "slow", "linear" );
      break;
      case 3:
        $('div.lunch, div.breakfast').fadeOut( "slow", "linear" );
        $('div.dinner').fadeIn( "slow", "linear" );
      break;
      default: // All
        $('div.breakfast, div.lunch, div.dinner').fadeIn( "slow", "linear" );
      break;
    }
  }
  const elem = $(this).attr('class');

});

//to check order
$( "#check_order_form" ).on( "submit", function( event ) {
  event.preventDefault();
  let order_id = $('.check_order_text.form-control.d-inline-block.my-3').val();
    $.ajax({
      type: "GET",
      url: `/order/${order_id}`,
      success: function(data) {
      window.location = `http://localhost:8080/order/${order_id}`;
      },
      error: function(msg) {
      console.log('error');
      console.log(msg);
      }
    });
  });

//to notify from dashboard
$( ".notify_form" ).on( "submit", function( event ) {
  event.preventDefault();
  let obj = {};
  obj['eta'] = $(this).closest('form').find('.notify_text').val();
  obj['id'] = $(this).closest('form').find('.hidden-order-id').val();
    $.ajax({
      type: "POST",
      url: "/notify",
      data: JSON.stringify(obj),
      contentType: "application/json",
      success: function(msg) {
          console.log(msg);
      },
      error: function(msg) {
      console.log('error');
      }
    });
  });

// Show check order form
$('.check_order').on('click', (event) => {
  $( "#check_order_form" ).fadeToggle( "slow", "linear" );
});


// Show order submit form
$('.order').on('click', (event) => {
  if($('#place_order_form').css('bottom') !== 0) {
    $('#place_order_form').css('bottom', '-15px');
  }
});

 $( "#place_order_form" ).on( "submit", function( event ) {
  event.preventDefault();
    let obj = {};
    let nameArr = [];
    let quantityArr = [];
    let name = $(".name").val();
    let number = $(".number").val();
    obj['name'] = name;
    obj['phone'] = number;
    obj['order'] = {};
        var classes = $("input[type='checkbox']:checked").map(function() {
            nameArr.push(this.className);
            let no_spaces = (this.className).replace(/[^0-9a-z]/gi, '');
            quantityArr.push($('.' + no_spaces).find(":selected").val());
        });
        for (let i = 0; i < nameArr.length; i ++) {
          for (let j = 0; j < quantityArr[i]; j ++) {
            if ($.isEmptyObject(obj.order)) {
              obj['order'][`${j+1}`] = nameArr[i];
            } else {
              let last_key = Number(Object.keys(obj['order'])[(Object.keys(obj['order']).length) - 1]);
              obj['order'][`${last_key+1}`] = nameArr[i];
            }
          }
        }
          $.ajax({
            type: "POST",
            url: "/order",
            data: JSON.stringify(obj),
            contentType: "application/json",
            success: function(msg) {
                console.log(msg);
            },
            error: function(msg) {
            console.log('error');
            }
        });
  });
});
