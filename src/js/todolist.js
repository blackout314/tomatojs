var Todo = Backbone.Model.extend({
    initialize: function (spec) {
        this.htmlId = 'todo-' + this.cid;
    },

    defaults: {
        completed: false,
        usedTomato: 0
    },

    activate: function () {
        if (!this.get('completed')) {
            this.trigger('activate', this);
        }
    },

    toggleCompleted: function () {
        this.trigger('activate', null);
        this.save({completed: !this.get('completed')});
    },

    remove: function () {
        this.trigger('activate', null);
        this.destroy();
    }
});

var TodoView = Backbone.View.extend({
    initialize: function () {
        _.bindAll(this, 'activateTodo', 'completeTodo', 'removeTodo');
        this.model.bind('activate', this.activateTodo);
        this.model.bind('change:completed', this.completeTodo);
        this.model.bind('remove', this.removeTodo);
    },

    render: function () {
        this.el = ich.todoItem(this.model.toJSON());
        this.el.dblclick(this.onItemDoubleClick.bind(this));
        this.$('.complete-todo').click(this.onCompleteButtonClick.bind(this));
        this.$('.remove-todo').click(this.onRemoveButtonClick.bind(this));

        return this;
    },

    activateTodo: function () {
        $('#todo-list > li.active').removeClass('active');
        this.el.addClass('active');
    },

    completeTodo: function () {
        if (this.model.get('completed')) {
            this.$('.todo-description').addClass('completed');
        } else {
            this.$('.todo-description').removeClass('completed');
        }
    },

    removeTodo: function () {
        $(this.el).remove();
    },

    onItemDoubleClick: function () {
        this.model.activate();
    },

    onCompleteButtonClick: function () {
        this.model.toggleCompleted();
    },

    onRemoveButtonClick: function () {
        this.model.remove();
    }
});

var TodoList = Backbone.Collection.extend({
    model: Todo,
    localStorage: new Store("todos"),

    initialize: function (spec) {
        this.tomatoModel = spec.tomatoModel;
    }
});

var TodoListView = Backbone.View.extend({

    events: {
        'click #add-todo': 'onAddTodoButtonClick'
    },

    initialize: function () {
        _.bindAll(this, 'addTodo', 'addTodos', 'switchTodo');
        this.model.bind('add', this.addTodo);
        this.model.bind('refresh', this.addTodos);

        this.todoList = this.$('#todo-list');
        this.descriptionInput = this.$('#todo-description');
        this.estimatedTomatoInput = this.$('#estimated-tomato');

        this.model.fetch();
    },

    render: function () {
        return this;
    },

    addTodo: function (todo) {
        var view = new TodoView({model: todo})
        this.todoList.append(view.render().el);
        this.descriptionInput.val('');
        this.estimatedTomatoInput.val('');
        todo.bind('activate', this.switchTodo);
    },

    addTodos: function () {
        this.model.each(this.addTodo);
    },

    switchTodo: function (todo) {
        this.model.tomatoModel.setCurrentTask(todo);
    },

    onAddTodoButtonClick: function () {
        this.model.create({
            description: this.descriptionInput.val(),
            estimatedTomato: this.estimatedTomatoInput.val()
        });
    }
});

