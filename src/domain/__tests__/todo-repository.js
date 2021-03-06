const { expect } = require('chai')

const { Todo } = require('..')
const Const = require('../../const')

let todoRepository

describe('TodoRepository', () => {
  beforeEach(() => {
    todoRepository = new Todo.Repository()

    todoRepository.saveAll(
      new Todo.Collection([
        new Todo('a0', 'foo', true),
        new Todo('a1', 'bar', false),
        new Todo('a2', 'baz', true)
      ])
    )
  })

  describe('saveAll', () => {
    it('saves the all of todos in the collection', () => {
      todoRepository.saveAll(
        new Todo.Collection([
          new Todo('b0', 'foo', true),
          new Todo('b1', 'bar', false)
        ])
      )

      const collection = todoRepository.getAll()

      expect(collection).to.be.instanceof(Todo.Collection)
      expect(collection.toArray()).to.have.length(2)
      expect(collection.toArray()[0].id).to.equal('b0')
      expect(collection.toArray()[1].id).to.equal('b1')
    })
  })

  describe('getAll', () => {
    it('gets the all of saved todos', () => {
      const collection = todoRepository.getAll()

      expect(collection).to.be.instanceof(Todo.Collection)
      expect(collection.toArray()).to.have.length(3)
    })

    it('gets an empty todo collection when nothing stored', () => {
      window.localStorage.clear()

      const collection = todoRepository.getAll()

      expect(collection).to.be.instanceof(Todo.Collection)
      expect(collection.toArray()).to.have.length(0)
    })

    it('gets an empty todo collection when the stored json is broken', () => {
      window.localStorage[Const.STORAGE_KEY.TODO_LIST] = '['

      const collection = todoRepository.getAll()

      expect(collection).to.be.instanceof(Todo.Collection)
      expect(collection.toArray()).to.have.length(0)
    })
  })
})
