let baseUrl = 'http://localhost:3001'
let apiUrl = 'https://zenquotes.io/api/random'

function getQuotes() {
  let author = ''
  let quote = ''
  $.ajax({
    method: 'GET',
    url: `${baseUrl}/api`
  })
    .done((quotes) => {
      author = quotes[0].a
      quote = quotes[0].q
      $('.image-side').append(`
      <h5 style="font-weight: bold;color: #ddeaf0;">${quote}</h5>
      <h6 style="width: 100%; display: flex; justify-content: flex-end; color: #ddeaf0;">- ${author}</h6>
      `)
    })
    .fail((err) => {
      console.log(err);
    })
}

function monthConverter(month) {
  switch (month) {
    case '01':
      month = 'Jan';
      break;
    case '02':
      month = 'Feb';
      break;
    case '03':
      month = 'Mar';
      break;
    case '04':
      month = 'Apr';
      break;
    case '05':
      month = 'May';
      break;
    case '06':
      month = 'Jun';
      break;
    case '07':
      month = 'Jul';
      break;
    case '08':
      month = 'Aug';
      break;
    case '09':
      month = 'Sep';
      break;
    case '10':
      month = 'Oct';
      break;
    case '11':
      month = 'Nov';
      break;
    case '12':
      month = 'Dec';
      break;
  }
  return month;
}

function fetchTodo() {
  $.ajax({
    method: 'GET',
    url: `${baseUrl}/todos`,
    headers: {
      token: localStorage.getItem('todo-token')
    }
  })
    .done((todos) => {
      $('#todo-side').empty()
      for (const todo of todos) {
        let today = new Date().toISOString().substring(0, 10)
        let date = new Date(todo.dueDate).toISOString().substring(0, 10)
        let year = date.substring(0, 4)
        let month = monthConverter(date.substring(5, 7))
        let day = date.substring(8, 10)

        let newDate = `${month} ${day}, ${year}`
        let status = ''

        if (!todo.status && todo.dueDate.substring(0, 10) < today) {
          status = `<span class="material-icons" style="color: #687687;">priority_high</span>`
        } else if (todo.status) {
          status = `<span class="material-icons" style="color: #63d7c4;">done</span>`
        } else {
          status = `<span class="material-icons" style="color: #e55c8a;">clear</span>`
        }
        $('#todo-side').append(`
        <div class="card" style="margin-left: 15px;" id="todo-${todo.id}">
            <div class="card-body">
              <div class="todo-status">
                ${status}
              </div>
              <div class="todo-detail">
                <h5 class="card-title" style="color: #ddeaf0;">${todo.task}</h5>
                <h6 class="card-subtitle mb-2 text-muted">Deadline: ${newDate}</h6>
              </div>
              <div class="todo-ops">
                <span class="material-icons" data-bs-toggle="collapse" href="#more-options-${todo.id}" role="button"
                  aria-expanded="false" aria-controls="more-options-${todo.id}" style="color: #ddeaf0;">expand_more</span>
              </div>
            </div>
            <div class="collapse row" id="more-options-${todo.id}" style="padding: .5rem 1rem; background-color: #3b424a; border-bottom: 1px solid #687687;">
              <p class="col" style="margin: 0; color: #ddeaf0;">${todo.desc}</p>
              <div class="card-ops row col" style="display: flex; justify-content: flex-end;">
                <input onclick="editTodo(${todo.id})" type="button" class="edit-btn" value="Edit">
                <input onclick="deleteTodo(${todo.id})" type="button" class="delete-btn" value="Delete">
              </div>
            </div>
          </div>
        `)
      }
    })
    .fail((err) => {
      console.log(err);
    })
}

function editTodo(id) {
  $.ajax({
    method: 'GET',
    url: `${baseUrl}/todos/${id}`,
    headers: {
      token: localStorage.getItem('todo-token')
    }
  })
    .done((todo) => {
      let date = new Date(todo.dueDate).toISOString().substring(0, 10)
      localStorage.setItem('todo-id', id)
      $('#edit-task').val(todo.task)
      $('#edit-desc').val(todo.desc)
      $('#edit-dueDate').val(date)
      $('#landing-page').hide()
      $('#user-input').hide()
      $('#dashboard').show()
      $('#add-page').hide()
      $('#edit-page').show()
      fetchTodo()
    })
    .fail((err) => {
      console.log(err);
    })
}

function deleteTodo(id) {
  $.ajax({
    method: 'DELETE',
    url: `${baseUrl}/todos/${id}`,
    headers: {
      token: localStorage.getItem('todo-token')
    }
  })
    .done((deletedTodo) => {
      $(`#todo-${deletedTodo.id}`).remove()
      $('#landing-page').hide()
      $('#user-input').hide()
      $('#dashboard').show()
    })
    .fail((err) => {
      console.log(err);
    })
}


$(document).ready(function () {
  let token = localStorage.getItem('todo-token')

  if (token) {
    $('#landing-page').hide()
    $('#user-input').hide()
    $('#dashboard').show()
    $('#edit-page').hide()
    $('#add-page').show()
    fetchTodo()
  } else {
    getQuotes()
    $('#landing-page').hide()
    $('#user-input').show()
    $('#signup-page').hide()
    $('#signin-page').show()
    $('.btn-in').addClass('active')
    $('#dashboard').hide()
  }

  $('#signup-form').on('submit', function (event) {
    event.preventDefault()
    let name = $('#signup-name').val()
    let email = $('#signup-email').val()
    let password = $('#signup-password').val()
    let token;
    $.ajax({
      method: 'POST',
      url: `${baseUrl}/signup`,
      data: {
        name,
        email,
        password
      }
    })
      .done((data) => {
        token = data.token
        localStorage.setItem('todo-token', token)
        $('#landing-page').hide()
        $('#user-input').hide()
        $('#dashboard').show()
        $('#edit-page').hide()
        $('#add-page').show()
        name = $('#signup-name').val('')
        email = $('#signup-email').val('')
        password = $('#signup-password').val('')
        fetchTodo()
      })
      .fail(err => {
        console.log(err);
      })
  })

  $('#signin-form').on('submit', function (event) {
    event.preventDefault()
    let email = $('#signin-email').val()
    let password = $('#signin-password').val()
    let token;
    $.ajax({
      method: 'POST',
      url: `${baseUrl}/signin`,
      data: {
        email,
        password
      }
    })
      .done((data) => {
        token = data.token
        localStorage.setItem('todo-token', token)
        $('#landing-page').hide()
        $('#user-input').hide()
        $('#dashboard').show()
        $('#edit-page').hide()
        $('#add-page').show()
        email = $('#signin-email').val('')
        password = $('#signin-password').val('')
        fetchTodo()
      })
      .fail(err => {
        console.log(err);
      })
  })

  $('#add-form').on('submit', function (event) {
    event.preventDefault()
    let task = $('#add-task').val()
    let desc = $('#add-desc').val()
    let dueDate = $('#add-dueDate').val()
    $.ajax({
      method: 'POST',
      url: `${baseUrl}/todos`,
      headers: {
        token: localStorage.getItem('todo-token')
      },
      data: {
        task,
        desc,
        dueDate,
        status: false
      }
    })
      .done(() => {
        $('#add-task').val('')
        $('#add-desc').val('')
        $('#add-dueDate').val('')
        fetchTodo()
      })
      .fail((err) => {
        console.log(err);
      })
  })

  $('#edit-form').on('submit', function (event) {
    let id = localStorage.getItem('todo-id')
    event.preventDefault()
    let task = $('#edit-task').val()
    let desc = $('#edit-desc').val()
    let dueDate = $('#edit-dueDate').val()
    let status = $('input[name="edit-status"]:checked').val();

    console.log(task, desc, dueDate);
    $.ajax({
      method: 'PUT',
      url: `${baseUrl}/todos/${id}`,
      headers: {
        token: localStorage.getItem('todo-token')
      },
      data: {
        task,
        desc,
        dueDate,
        status
      }
    })
      .done(() => {
        fetchTodo()
        $('#edit-page').hide()
        $('#add-page').show()
      })
      .fail((err) => {
        console.log(err);
      })
  })

  $('#display-all').on('click', function () {
    fetchTodo()
    // $('#edit-page').hide()
    // $('#add-page').show()
  })

  $('.signup-btn').on('click', function () {
    $('.btn-up').addClass('active')
    $('.btn-in').removeClass('active')
    $('#landing-page').hide()
    $('#user-input').show()
    $('#signup-page').show()
    $('#signin-page').hide()
    $('#dashboard').hide()
  })

  $('.signin-btn').on('click', function () {
    $('.btn-up').removeClass('active')
    $('.btn-in').addClass('active')
    $('#landing-page').hide()
    $('#user-input').show()
    $('#signup-page').hide()
    $('#signin-page').show()
    $('#dashboard').hide()
  })

  $('.signout-btn').on('click', function () {
    localStorage.removeItem('todo-token')
    $('#landing-page').hide()
    $('#user-input').show()
    $('#signup-page').hide()
    $('#signin-page').show()
    $('.btn-in').addClass('active')
    $('#dashboard').hide()
  })

  $('.back').on('click', function () {
    $('#edit-page').hide()
    $('#add-page').show()
  })

  $('.form-control').focus(function () {
    $(this).css('background-color', '#3b424a')
    $(this).css('border', 'hidden')
    $(this).css('box-shadow', 'none')
    $(this).css('color', '#ddeaf0')
  })
})