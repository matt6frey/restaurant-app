// $(() => {
//   $.ajax({
//     method: "GET",
//     url: "/api/users"
//   }).done((users) => {
//     for(user of users) {
//       $("<div>").text(user.name).appendTo($("body"));
//     }
//   });;
// });
//$('body').CSS('background-color', 'red');
$('.checkbox').click(function(event) {
   $(".test").toggle(this.checked);
});
