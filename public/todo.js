function loadTodos() {
  $.ajax({
    url: '/api/todos',
    method: 'GET',
    success: function (res) {
      if (!res.success) {
        $('#todoMsg').text(res.message || 'Error loading todos');
        return;
      }

      $('#todoList').empty();
      res.todos.forEach(todo => {
        const li = $('<li></li>').text(todo.text);

        const delBtn = $('<button>Delete</button>').on('click', function () {
          deleteTodo(todo._id);
        });

        li.append(' ');
        li.append(delBtn);
        $('#todoList').append(li);
      });
    },
    error: function () {
      $('#todoMsg').text('Request error');
    }
  });
}

function addTodo() {
  const text = $('#newTodoText').val();
  if (!text) return;

  $.ajax({
    url: '/api/todos/add',
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({ text }),
    success: function (res) {
      if (res.success) {
        $('#newTodoText').val('');
        loadTodos();
      } else {
        $('#todoMsg').text(res.message || 'Error adding todo');
      }
    },
    error: function () {
      $('#todoMsg').text('Request error');
    }
  });
}

function deleteTodo(id) {
  $.ajax({
    url: '/api/todos/delete',
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({ id }),
    success: function (res) {
      if (res.success) {
        loadTodos();
      } else {
        $('#todoMsg').text(res.message || 'Error deleting todo');
      }
    },
    error: function () {
      $('#todoMsg').text('Request error');
    }
  });
}

$(function () {
  // initial load
  loadTodos();

  $('#addTodoBtn').on('click', addTodo);

  $('#logoutBtn').on('click', function () {
    $.ajax({
      url: '/logout',
      method: 'POST',
      success: function (res) {
        if (res.success) {
          window.location.href = '/';
        } else {
          $('#todoMsg').text('Error logging out');
        }
      },
      error: function () {
        $('#todoMsg').text('Request error');
      }
    });
  });
});
