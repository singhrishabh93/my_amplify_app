import 'package:amplify_api/amplify_api.dart';
import 'package:amplify_flutter/amplify_flutter.dart';
import 'package:flutter/material.dart';
import 'package:my_amplify_app/models/Todo.dart';

class TodoScreen extends StatefulWidget {
  const TodoScreen({super.key});

  @override
  State<TodoScreen> createState() => _TodoScreenState();
}

class _TodoScreenState extends State<TodoScreen> {
  List<Todo> _todos = [];

  @override
  void initState() {
    super.initState();
    _refreshTodos();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Todos'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              // Sign-out logic goes here (if implemented)
              safePrint('Sign-out pressed');
            },
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        label: const Text('Add Random Todo'),
        icon: const Icon(Icons.add),
        onPressed: () async {
          final newTodo = Todo(
            id: uuid(),
            content: "Random Todo ${DateTime.now().toIso8601String()}",
            isDone: false,
          );
          final request = ModelMutations.create(newTodo);
          final response = await Amplify.API.mutate(request: request).response;
          if (response.hasErrors) {
            safePrint('Creating Todo failed.');
          } else {
            safePrint('Creating Todo successful.');
          }
          _refreshTodos();
        },
      ),
      body: _todos.isEmpty
          ? const Center(
              child: Text(
                "The list is empty.\nAdd some items by clicking the floating action button.",
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 18, color: Colors.grey),
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(8),
              itemCount: _todos.length,
              itemBuilder: (context, index) {
                final todo = _todos[index];
                return Card(
                  margin: const EdgeInsets.symmetric(vertical: 8),
                  elevation: 4,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Dismissible(
                    key: UniqueKey(),
                    confirmDismiss: (direction) async {
                      if (direction == DismissDirection.endToStart) {
                        final request = ModelMutations.delete(todo);
                        final response =
                            await Amplify.API.mutate(request: request).response;
                        if (response.hasErrors) {
                          safePrint('Deleting Todo failed. ${response.errors}');
                        } else {
                          safePrint('Deleting Todo successful.');
                          await _refreshTodos();
                          return true;
                        }
                      }
                      return false;
                    },
                    child: ListTile(
                      contentPadding: const EdgeInsets.all(16),
                      leading: Icon(
                        todo.isDone ?? false ? Icons.check_circle : Icons.radio_button_unchecked,
                        color: todo.isDone ?? false ? Colors.green : Colors.grey,
                      ),
                      title: Text(
                        todo.content!,
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          decoration: todo.isDone ?? false ? TextDecoration.lineThrough : null,
                          color: todo.isDone ?? false ? Colors.grey : Colors.black,
                        ),
                      ),
                      trailing: IconButton(
                        icon: const Icon(Icons.delete, color: Colors.red),
                        onPressed: () async {
                          final request = ModelMutations.delete(todo);
                          final response = await Amplify.API.mutate(request: request).response;
                          if (response.hasErrors) {
                            safePrint('Deleting Todo failed. ${response.errors}');
                          } else {
                            safePrint('Deleting Todo successful.');
                            await _refreshTodos();
                          }
                        },
                      ),
                      onTap: () async {
                        final request = ModelMutations.update(
                          todo.copyWith(isDone: !(todo.isDone ?? false)),
                        );
                        final response =
                            await Amplify.API.mutate(request: request).response;
                        if (response.hasErrors) {
                          safePrint('Updating Todo failed. ${response.errors}');
                        } else {
                          safePrint('Updating Todo successful.');
                          await _refreshTodos();
                        }
                      },
                    ),
                  ),
                );
              },
            ),
    );
  }

  Future<void> _refreshTodos() async {
    try {
      final request = ModelQueries.list(Todo.classType);
      final response = await Amplify.API.query(request: request).response;

      final todos = response.data?.items;
      if (response.hasErrors) {
        safePrint('errors: ${response.errors}');
        return;
      }
      setState(() {
        _todos = todos!.whereType<Todo>().toList();
      });
    } on ApiException catch (e) {
      safePrint('Query failed: $e');
    }
  }
}
