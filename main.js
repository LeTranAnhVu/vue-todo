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
        newTodoBind: null,
        filtertype: 'all',
        undoTask: [],
        redoTask: [],
        isUndoOrRedo: false,
        currentTaskIndex: -1,
        lastTaskIndex: -1,
        lastAction: null,
        isNoMoreUndoFunc: true,
        isNoMoreRedoFunc: true,
    },


    // methods
    methods: {
        // ADD
        addTodo: function (rawNewTodo, index) {
            // verify the new todo
            if (typeof rawNewTodo == 'string') {

                const newTodoContent = rawNewTodo.trim();
                console.log('addTodo', rawNewTodo);
                // let newTodo = 'tested';
                let newTodo = {};
                if (newTodoContent) {
                    // add new todo
                    let fakeId = this.todos.length + 200;
                     newTodo = {
                        id: fakeId,
                        content: newTodoContent,
                        isDone: false
                    };
                    this.todos.push(newTodo);
                }
                // clear the input
                this.newTodoBind = '';

                // TODO: add to task tracking

                let positionOfNewTodo = this.todos.length-1;
                console.log('position of new todo', positionOfNewTodo);

                let undoTask = {
                    action: this.undo_addTodo.bind(this),
                    params: [newTodo.id]
                };

                let currentTask = {
                    action: this.addTodo.bind(this),
                    params: [newTodo, positionOfNewTodo]
                }

                this.addToTaskTracking(undoTask, currentTask);


                // TODO-end

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
                if (todo.id !== deletedId) {
                    // for those todo which not match we return them
                    return true
                } else {
                    // this is the todo need to delete
                    // and not return this todo
                    // TODO:
                    // add the action into undoTask
                    let undoTask = {
                        action: this.undo_deleteTodo.bind(this),
                        params: [todo, index],
                    }
                    let currentTask = {
                        action: this.deleteTodo.bind(this),
                        params: [$event],
                    }

                    this.addToTaskTracking(undoTask, currentTask);

                }
            });
        },

        deleteDoneTodos: function (todos) {
            // deletetodo = {t odo , index }
            let deletedTodos = [];
            this.todos = todos.filter((todo, index) => {
                // keep those todos that have not done yet
                if(todo.isDone === false){
                    return true;
                }else {
                    // those item will be remove
                    // TODO store those item before they re removed
                    deletedTodos.push({
                        todo: todo,
                        index: index
                    });
                    return false;
                }

            });


            // TODO: add to task tracking
            let undoTask = {
                action: this.undo_deletedDoneTodos.bind(this),
                params: [deletedTodos]
            };

            let currentTask = {
                action: this.deleteDoneTodos.bind(this),
                params: [todos]
            }
            this.addToTaskTracking(undoTask, currentTask);

        },
        // change status
        toggleTodo: function (updatedId) {
            this.todos = this.todos.map(todo => {
                if (todo.id === updatedId) {
                    todo.isDone = !todo.isDone;
                    // TODO: add the task tracking

                    let undoTask = {
                        action: this.undo_toggleTodo.bind(this),
                        params: [updatedId]
                    };

                    let currentTask = {
                        action: this.toggleTodo.bind(this),
                        params: [updatedId]
                    }
                    this.addToTaskTracking(undoTask, currentTask);

                }
                return todo;
            });
        },



        addToTaskTracking: function(undoTask, currentTask){
            if(this.isUndoOrRedo === false) {
                if(this.isNoMoreRedoFunc === false){
                    // mean: the task is not up to date
                    // TODO: remove all the state in the top
                    // this.currentTaskIndex
                    console.log('hey remove all', this.undoTask);
                    let currPos = this.currentTaskIndex;
                    this.undoTask.splice(currPos + 1,this.topTaskIndex) ; // remove the action later than the current action
                    this.redoTask.splice(currPos + 1,this.topTaskIndex) ; // remove the action later than the current action
                }

                this.undoTask.push(undoTask);
                this.redoTask.push(currentTask);
                // update the current pointer
                this.currentTaskIndex = this.topTaskIndex;

                // update flags
                this.isNoMoreUndoFunc = false;
                this.isNoMoreRedoFunc = false;
            }
        },



        // undo functions
        undo_deleteTodo: function (todo, index) {
            this.addTodo.call(this,todo, index);
        },

        undo_addTodo: function (todoId){
            console.log('todoId', todoId);
            this.deleteTodo.call(this, todoId);
        },
        undo_deletedDoneTodos: function (restoredTodos) {

            //note : objTodo = {todo: todo, index: index}
            let _that = this;
            restoredTodos.forEach(objTodo => {
                // restore all the deleted todo
                _that.addTodo(objTodo.todo, objTodo.index);
            })
        },
        undo_toggleTodo: function(updatedId) {
            this.toggleTodo.call(this,updatedId);
        },

        // undo process
        undo: function() {
            // check the undotask
            console.log('current', this.currentTaskIndex);
            console.log('last', this.lastTaskIndex);

            if(this.undoTask && this.undoTask.length !== 0 && (this.undoTask.length - 1)  >= this.currentTaskIndex){
                // go to previous task
                if(this.currentTaskIndex > 0 || (this.currentTaskIndex === 0 && (this.currentTaskIndex !== this.lastTaskIndex || this.lastAction !== 'undo'))){
                    const task = this.undoTask[this.currentTaskIndex];
                    if(task && typeof task === 'object'){
                        console.log("call undo in here");
                        // excecute the last action
                        this.isUndoOrRedo = true;
                        task.action.apply(this, task.params);
                        this.isUndoOrRedo = false;
                        this.lastAction = 'undo';
                    }
                    if (this.currentTaskIndex === 0){
                        // set the pointer is in the bottom and no more undo function
                        this.isNoMoreUndoFunc = true;
                    }
                    this.lastTaskIndex = this.currentTaskIndex;
                    if(this.currentTaskIndex > 0) {
                        // TODO: decrease the current until it hit the bottom
                        this.currentTaskIndex--;
                    }
                }

            }
        },

        redo: function(){
            console.log('current', this.currentTaskIndex);
            console.log('last', this.lastTaskIndex);
            if(this.redoTask && this.redoTask.length !==0 && (this.redoTask.length -1) >= this.currentTaskIndex ){
                if(this.currentTaskIndex < this.topTaskIndex || (this.currentTaskIndex === this.topTaskIndex && (this.currentTaskIndex !== this.lastTaskIndex || this.lastAction !== 'redo'))){
                    const task = this.redoTask[this.currentTaskIndex];
                    if(task && typeof task === 'object'){
                        this.isUndoOrRedo = true;
                        task.action.apply(this, task.params);
                        this.isUndoOrRedo = false;
                        this.lastAction = 'redo';
                    }
                    if (this.currentTaskIndex === this.topTaskIndex){
                        // set the pointer is in the top and no more redo function
                        this.isNoMoreRedoFunc = true;
                    }
                    this.lastTaskIndex = this.currentTaskIndex;
                    if(this.currentTaskIndex < this.topTaskIndex){
                        // TODO: increase the current until it hit the top
                        this.currentTaskIndex++;
                    }
                }

            }
        }

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
        topTaskIndex: function () {
            // observer the tasks length
            return this.undoTask.length -1;
        }
    },

    // watch
    watch: {
        undoTask: function(){
            console.log('undoTask updated', this.undoTask);
        },
        isNoMoreRedoFunc: function(){
            // check whether the app is uptodate
            if(this.isNoMoreRedoFunc){

            }
        },
        isNoMoreUndoFunc: function(){

            console.log('Undo up to date', this.isNoMoreUndoFunc);
        }
    }
});


 // TODO: error when update the state in the redo undo
