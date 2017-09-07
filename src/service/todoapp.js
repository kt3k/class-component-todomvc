const TodoFactory = require('../domain/todo-factory')
const TodoRepository = require('../domain/todo-repository')

const { ACTION: { MODEL_UPDATE, NEW_ITEM } } = require('../const')

const { pub, make, on, component, wire } = require('capsid')

/**
 * The todo application class.
 */
@component
class Todoapp {
  __init__ () {
    this.todoFactory = new TodoFactory()
    this.todoRepository = new TodoRepository()
    this.todoCollection = this.todoRepository.getAll()

    const router = make('router', this.el)

    setTimeout(() => router.onHashchange())

    $(window).on('hashchange', () => router.onHashchange())
  }

  @wire get 'todo-list' () {}
  @wire get 'toggle-all' () {}

  @pub(MODEL_UPDATE, '.is-model-observer')
  refreshControls () {
    // updates visibility of main and footer area
    this.elem
      .find('.main, .footer')
      .css('display', this.todoCollection.isEmpty() ? 'none' : 'block')

    // updates toggle-all button state
    this['toggle-all'].updateBtnState(
      !this.todoCollection.uncompleted().isEmpty()
    )

    return this
  }

  refreshAll () {
    this.refreshControls()

    this['todo-list'].onRefresh(this.todoCollection, this.filter)
  }

  @on('filterchange')
  onFilterchange (e) {
    this.filter = e.detail

    this.refreshAll()
  }

  /**
   * Adds new item by the given title.
   * @private
   * @param {Object} e The event object
   * @param {String} title The todo title
   */
  @on(NEW_ITEM)
  addTodo (e) {
    const title = e.detail
    const todo = this.todoFactory.createByTitle(title)

    this.todoCollection.push(todo)
    this.save()

    this.refreshAll()
  }

  /**
   * Saves the current todo collection state.
   */
  save () {
    this.todoRepository.saveAll(this.todoCollection)
  }

  /**
   * Toggles the todo state of the given id.
   * @param {object} e The event object
   * @param {String} id The todo id
   */
  @on('todo-item-toggle')
  toggle (e) {
    const id = e.detail
    this.todoCollection.toggleById(id)
    this.save()

    if (this.filter.isAll()) {
      this.refreshControls()
    } else {
      this.refreshAll()
    }
  }

  /**
   * Removes the todo of the given id.
   * @param {object} e The event object
   * @param {String} id The todo id
   */
  @on('todo-item-destroy')
  remove (e) {
    const id = e.detail

    this.todoCollection.removeById(id)
    this.save()

    this.refreshAll()
  }

  /**
   * Edits the todo item of the given id by the given title.
   * @param {object} e The event object
   * @param {string} id The todo id
   * @param {string} title The todo title
   */
  @on('todo-item-edited')
  editItem (e) {
    const { id, title } = e.detail

    this.todoCollection.getById(id).title = title
    this.save()
  }

  /**
   * Clears the completed todos.
   */
  @on('todo-clear-completed')
  clearCompleted () {
    this.todoCollection = this.todoCollection.uncompleted()
    this.save()

    this.refreshAll()
  }

  /**
   * Uncompletes all the todo items.
   * @private
   */
  @on('toggle-all-uncheck')
  uncompleteAll () {
    if (this.filter.isAll()) {
      this['todo-list'].toggleAll(this.todoCollection.completed())
    } else {
      this.todoCollection.uncompleteAll()
      this.save()

      this.refreshAll()
    }
  }

  /**
   * Completes all the todo items.
   * @private
   */
  @on('toggle-all-check')
  completeAll () {
    if (this.filter.isAll()) {
      this['todo-list'].toggleAll(this.todoCollection.uncompleted())
    } else {
      this.todoCollection.completeAll()
      this.save()

      this.refreshAll()
    }
  }
}

module.exports = Todoapp
