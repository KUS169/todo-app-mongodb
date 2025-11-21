$(function () {
  // Register
  $('#registerBtn').on('click', function () {
    const username = $('#regUser').val();
    const password = $('#regPass').val();

    $.ajax({
      url: '/register',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ username, password }),
      success: function (res) {
        $('#regMsg').text(res.message || (res.success ? 'Registered!' : 'Error'));
      },
      error: function () {
        $('#regMsg').text('Request error');
      }
    });
  });

  // Login
  $('#loginBtn').on('click', function () {
    const username = $('#logUser').val();
    const password = $('#logPass').val();

    $.ajax({
      url: '/login',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ username, password }),
      success: function (res) {
        $('#logMsg').text(res.message || '');
        if (res.success) {
          // Go to todo page
          window.location.href = '/todo';
        }
      },
      error: function () {
        $('#logMsg').text('Request error');
      }
    });
  });
});
