
$(document).ready(function() {
let menuDisplay = false;
let menuCreated = false;
//to delete from dashboard
$('button.delete').on('click', (event) => {
  event.preventDefault();
  let obj = {};
  obj['id'] = $(this).closest('form').find('.hidden-order-id').val();
  console.log(obj);

 $.ajax({
      type: "POST",
      url: `/delete/${obj}`,
      data: JSON.stringify(obj),
      contentType: "application/json",
      success: function(msg) {
          // console.log(msg);
      },
      error: function(msg) {
      console.log('error');
      }
    });
  });

$('.rwd-menu').on('click', () => {
  const menuBtn = $('.menu.btn.btn-primary');
  const homeBtn = $('.home.btn.btn-primary');
  const checkOrderBtn = $('.check_order.btn.btn-primary');
  const sectionInfo = $('.info');
  const location = $('.location');
  const menuBG = $('<div></div>').attr({ class: "menuBG", style: "position: fixed; z-index:9; top:0; left: 0; background-color: #fff; height: 100vh; width: 100vh; display:none;"});

  if(menuDisplay === false) {
    menuDisplay = true;
    if(menuCreated === false) {
      menuCreated = true;
      $('body').prepend(menuBG.insertAfter(menuBtn.css('display', 'block'), homeBtn.css('display', 'block'), checkOrderBtn.css('display', 'block'), sectionInfo.css('display', 'block'), location.css('display', 'block')));
    }
    $('.menuBG, .menu.btn.btn-primary, .home.btn.btn-primary, .check_order.btn.btn-primary, .info, .location').fadeIn( 'slow', 'linear' );

  } else {
    console.log('fired');
    menuDisplay = false;
    $('.menuBG, .menu.btn.btn-primary, .home.btn.btn-primary, .check_order.btn.btn-primary, .info, .location').fadeToggle( 'slow', 'linear' );
  }




});

//to update from dashboard
$( "button.update" ).on( "click", function( event ) {
  event.preventDefault();
  let obj = {};
  obj['eta'] = $(this).closest('form').find('.notify_text').val();
  obj['id'] = $(this).closest('form').find('.hidden-order-id').val();
  console.log(obj);
    $.ajax({
      type: "POST",
      url: "/new-notify",
      data: JSON.stringify(obj),
      contentType: "application/json",
      success: function(msg) {
          // console.log(msg);
      },
      error: function(msg) {
      console.log('error');
      }
    });
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
      },
      error: function(msg) {
      console.log('error');
      }
    });
    let input = $(this).closest('.notify_form').find('input.notify_text');
    $(this).closest('.notify_form').fadeOut( 'slow', 'linear');
    setTimeout(()=> {
      $(this).closest('.order_container').find('.notified_form').fadeIn( 'slow', 'linear' );
      input.val('');
      $(this).closest('.order_container').find('.notified_form > .notifed_text').append(input.attr({ placeholder: 'ETA', type: 'number', name: 'eta', required: true, style: 'margin-left: 1rem; margin-right: 0.5rem;' })).fadeIn('slow', 'linear');


    }, 800);
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
