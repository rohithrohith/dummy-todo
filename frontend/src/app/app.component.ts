import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

type Todo = {
    todo_task: string;
    is_completed?: boolean;
    id?: number;
};

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
    title: string = 'frontend';
    taskName: string = '';
    loading: boolean = true;
    adding: boolean = false;
    todos: Todo[] = [];

    constructor(private http: HttpClient) {}

    ngOnInit(): void {
        this.http.get<any>('http://localhost:3000/todos').subscribe({
            next: (data) => {
                console.log(data);

                this.todos = data;
                this.loading = false;
            },
            error: (err) => {
                console.log('ERROR', err);
                this.loading = false;
            },
        });
    }

    addTask(event: Event) {
        event.preventDefault();
        if (this.taskName && this.taskName.trim() !== '') {
            const todo: Todo = {
                todo_task: this.taskName,
            };
            this.adding = true;
            this.http
                .post<Todo>('http://localhost:3000/todos', todo)
                .subscribe({
                    next: () => {
                        this.taskName = '';
                        this.loading = true;
                        this.http
                            .get<any>('http://localhost:3000/todos')
                            .subscribe({
                                next: (data) => {
                                    this.todos = data;
                                    this.loading = false;
                                },
                                error: (err) => {
                                    console.log('ERROR', err);
                                    this.loading = false;
                                },
                            });
                    },
                    error: (err) => {
                        console.log('ERROR', err);
                        this.adding = false;
                    },
                });
        }
    }

    toggleTaskComplete(todo: Todo) {
        this.http
            .put<Todo>(`http://localhost:3000/todos/${todo.id}`, todo)
            .subscribe({
                next: () => {
                    this.http
                        .get<any>('http://localhost:3000/todos')
                        .subscribe({
                            next: (data) => {
                                this.todos = data;
                                this.loading = false;
                            },
                            error: (err) => {
                                console.log('ERROR', err);
                                this.loading = false;
                            },
                        });
                },
                error: (err) => {
                    console.log('ERROR', err);
                    this.adding = false;
                },
            });
    }

    deleteTodo(id: number) {
        this.http.delete<Todo>(`http://localhost:3000/todos/${id}`).subscribe({
            next: () => {
                this.http.get<any>('http://localhost:3000/todos').subscribe({
                    next: (data) => {
                        this.todos = data;
                        this.loading = false;
                    },
                    error: (err) => {
                        console.log('ERROR', err);
                        this.loading = false;
                    },
                });
            },
            error: (err) => {
                console.log('ERROR', err);
                this.adding = false;
            },
        });
    }
}
