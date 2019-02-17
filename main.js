let seedTodos = [{
        id: 1,
        content: 'fix bug',
        isDone: false
    },
    {
        id: 2,
        content: 'uong cafe',
        isDone: false
    },
    {
        id: 3,
        content: 'an com trua',
        isDone: false
    },
    {
        id: 4,
        content: 'ngu trua',
        isDone: false
    },
    {
        id: 5,
        content: 'fix bug tiep :))',
        isDone: false
    },
    {
        id: 6,
        content: 'an xe chieu',
        isDone: false

    }
];





// components



// todo


Vue.component('Todo', {

    props: ['todo', 'filtertype'],

    template: `
        <div 
            class="todo-item" 
            v-on:click="$emit('on-toggle-status', todo.id)" 
            v-bind:class="{done: todo.isDone}"
            v-if="todo" 
            v-show="isShow"
            >
            <p>{{todo.content}}</p>
            <button v-on:click.stop="$emit('on-delete', todo.id)">delete</button>
        </div>
    `,
    computed: {
        isShow: function () {
            const type = this.filtertype;
            if (type === 'all') {
                isShow = true;
            } else if (type === 'doned' && this.todo.isDone) {
                isShow = true;
            } else if (type === 'active' && !this.todo.isDone) {
                isShow = true;
            } else {
                isShow = false;
            }
            return isShow;
        }
    }
});


// root

const app = new Vue({
    el: '#todo-app',

    // data
    data: {
        title: 'To Do App Vuejs',
        todos: Array(...seedTodos),
        newTodo: null,
        filtertype: 'all',
        tasks: [],
        redoTask: [],
    },


    // methods
    methods: {
        // ADD
        addTodo: function (rawNewTodo, index) {
            // verify the new todo
            if (typeof rawNewTodo == 'string') {

                const newTodo = rawNewTodo.trim();
                console.log('addTodo', rawNewTodo);
                // let newTodo = 'tested';
                if (newTodo) {
                    // add new todo
                    let fakeId = this.todos.length + 200;
                    this.todos.push({
                        id: fakeId,
                        content: newTodo,
                        isDone: false
                    });
                }
                // clear the input
                this.newTodo = '';

            } else if (typeof rawNewTodo == 'object' && Number.isInteger(index)) {

                // insert the rawNewTodo into the given position
                this.todos.splice(index, 0, rawNewTodo);

            } else {

                throw ('error in addTodo');
            }
        },
        // DELETE
        deleteTodo: function ($event) {
            console.log('call deleted');

            let deletedId = $event;
            this.todos = this.todos.filter((todo, index) => {
                if (todo.id === deletedId) {
                    // this is the todo need to delete
                    // and not return this todo
                    // TODO: 
                    // add the action into undoTask
                    let undoTask = {
                        action: this.addTodo.bind(this),
                        params: [todo, index],
                    }
                    let currentTask = {
                        action: this.deleteTodo.bind(this),
                        params: [$event]
                    }
                    // TODO
                    // this.tasks.push(undoTask);
                    // this.tasks.push(currentTask);

                } else {
                    // for those todo which not match we return them
                    return true;
                }
            });
        },

        deleteDoneTodos: function () {
            this.todos = this.todos.filter(todo => {
                // keep those todos that have not done yet
                return todo.isDone === false;
            });
        },
        // change status
        toggleTodo: function (updatedId) {
            this.todos = this.todos.map(todo => {
                if (todo.id === updatedId) {
                    todo.isDone = !todo.isDone;
                }
                return todo;
            });
        },


        // undo process
        undo: function() {
            // check the undotask
            if(this.tasks && this.tasks.length !== 0){
                // go to previous task
                const task = this.undoTask.pop();
                if(task && typeof task === 'object'){
                    // excecute the last action
                    task.action.apply(this, task.params);
                }
            }
        },

        redo_deleteTodo(todo, index) {
            addTodo(todo, index);
        },

    },


    // computed
    computed: {
        doneTodos: function () {
            /*
                collection of done todos
            */
            return this.todos.filter(todo => {
                return todo.isDone === true;
            })
        },
        activeTodos: function () {
            /*
                collection of undone todos
            */
            return this.todos.filter(todo => {
                return todo.isDone === false;
            })
        },
        showDeleteAllBtn: function () {
            return (this.doneTodos.length !== 0) ? true : false;
        },
        currentTaskIndex: function () {
            // observer the tasks length
            return this.tasks.length -1;
        }
    },

    // watch
    watch: {
        undoTask: function(){
            console.log('undoTask updated', this.undoTask);
        }
    }
});