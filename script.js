document.addEventListener('DOMContentLoaded', function() {
    if (!window.openDatabase) {
      alert('Web SQL Database is not supported in this browser.');
      return;
    }
  
    var db = openDatabase('todo', '1.0', 'todolist', 2 * 1024 * 1024);
  
    createTable();
  
    var todoForm = document.getElementById('todoForm');
    todoForm.addEventListener('submit', addTodo);
  
    fetchTodo();
  
    function createTable() {
      db.transaction(function(tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS todo (id INTEGER PRIMARY KEY, todo)');
      });
    }

    function addTodo(event) {
      event.preventDefault();
    
      var todoInput = document.getElementById('list');
      var todo = todoInput.value.trim();
    
      if (todo === '') {
        alert('Please enter a todo item.');
        return;
      }
    
      var isUpdate = !!todoForm.getAttribute('data-id'); // Check if the form has a data-id attribute
    
      db.transaction(function(tx) {
        if (isUpdate) {
          var id = parseInt(todoForm.getAttribute('data-id'));
          tx.executeSql('UPDATE todo SET todo = ? WHERE id = ?', [todo, id], function() {
            todoInput.value = '';
            todoForm.removeAttribute('data-id'); // Remove the data-id attribute after update
            fetchTodo();
          });
        } else {
          tx.executeSql('INSERT INTO todo (todo) VALUES (?)', [todo], function() {
            todoInput.value = '';
            fetchTodo();
          });
        }
      });
    }
    

    function fetchTodo() {
      db.transaction(function(tx) {
        tx.executeSql('SELECT * FROM todo', [], function(tx, result) {
          var todoList = document.getElementById('todolist');
          todoList.innerHTML = '';
  
          var rows = result.rows;
          for (var i = 0; i < rows.length; i++) {
            var user = rows.item(i);
            var row = document.createElement('tr');
            row.innerHTML = '<td>' + user.todo + '</td>' +
            '<td><button onclick="deleteTodo(' + user.id + ')" class="delete">Delete</button></td>' +
            '<td><button onclick="editTodo(' + user.id + ')" class="edit">Update</button></td>';
          
          
            todoList.appendChild(row);
          }
        });
      });
    }

    window.editTodo = function(id) {
      db.transaction(function(tx) {
        tx.executeSql('SELECT * FROM todo WHERE id = ?', [id], function(tx, result) {
          var todo = result.rows.item(0);
          var todoInput = document.getElementById('list');
          todoInput.value = todo.todo;
          todoForm.setAttribute('data-id', id); // Set the data-id attribute on the form
        });
      });
    }
    
  
    window.deleteTodo = function(id) {
      db.transaction(function(tx) {
        tx.executeSql('DELETE FROM todo WHERE id = ?', [id], function() {
          fetchTodo();
        });
});
}
  });