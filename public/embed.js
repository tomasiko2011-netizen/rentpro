// RentPro Booking Widget
// Usage: <script src="https://booking.truest.kz/embed.js" data-rentpro></script>
(function() {
  var script = document.querySelector('script[data-rentpro]');
  var host = script ? script.src.replace('/embed.js', '') : 'https://rentpro-nu.vercel.app';
  var container = document.createElement('div');
  container.id = 'rentpro-widget';
  container.innerHTML = '<iframe src="' + host + '/widget" style="width:100%;min-height:500px;border:none;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.1);" allowtransparency="true"></iframe>';
  script.parentNode.insertBefore(container, script.nextSibling);
})();
