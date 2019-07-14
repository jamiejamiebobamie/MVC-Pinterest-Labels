require.config({
  baseUrl: '/',
  paths: {
    backbone: 'bower_components/backbone/backbone-min',
    bootstrap: 'bower_components/bootstrap/dist/js/bootstrap.min',
    colorpicker: 'bower_components/bootstrap-colorpicker/dist/js/bootstrap-colorpicker.min',
    d3: 'bower_components/d3/d3.v2.min',
    jquery: 'bower_components/jquery/dist/jquery.min',
    underscore: 'bower_components/underscore/underscore-min',

    forceView: 'force-view',
    myView: 'my-backbone-view',
    myModel: 'my-backbone-model',
    dbaas: 'dbaas',
    io: '/socket.io/socket.io'
  },
  shim: {
    bootstrap: {
      deps: ['jquery']
    },
    d3: {
      exports: 'd3'
    },
    colorpicker: ['jquery']
  }
});

require( [ 'myView', 'bootstrap', 'colorpicker' ], function( MyView ) {
  new MyView();
} );

//
// // Logic inside of function
// function addRemoveDiv() {
//   // Window Width pointer
//   var wW = $(window).width();
//   // If window width is greater than or equal to 980 and div not created.
//   if (wW < 1400) {
//       $('#chart').css("visibility", "visible");
//     // $('#chart').append('<div id="chart"></div>');
//     console.log("hello!")
//   // else if window is less than 980 and #newbox has been created.
// } else if (wW >= 1400) {
//      $('#chart').css("visibility", "hidden");
//     // $('#chart').remove();
//   }
// }
//
// // Initial function call.
// addRemoveDiv();
//
// // On resize, call the function again
// $(window).on('resize', function() {
//   addRemoveDiv();
// })
