document.addEventListener("DOMContentLoaded", () => {
  const listsContainer = document.querySelector(".lists-container");
  const addListForm = document.querySelector("#addListForm");
  const listTitleInput = document.querySelector("#listTitleInput");

  // Henter lister fra localStorage
  let lists = loadLists();

  showLists();

  //Eventlistener til at oprette en ny liste
  addListForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const title = listTitleInput.value.trim() || "Ny to do liste"; // Standard titel, hvis input er tomt

    //laver unikt ID til listen
    const newList = {
      id: crypto.randomUUID(),
      title: title,
      tasks: [],
    };

    lists.push(newList); //tilføjer ny liste til arrayet
    updateLocalStorage();
    showLists();
    addListForm.reset(); // Rydder formularen
  });

  // Vis lister
  function showLists() {
    listsContainer.innerHTML = ""; //så der ikke er dobbelt op

    if (lists.length === 0) {
      const noListsMessage = document.createElement("div");
      noListsMessage.textContent = "Der er ingen to do lister endnu.";
      listsContainer.appendChild(noListsMessage);
      return;
    }

    //reverse() nyeste liste vises først
    [...lists].reverse().forEach((list) => {
      const listElement = document.createElement("div");
      listElement.classList.add("list");
      listElement.innerHTML = `
                    <div class="list-header">
                      <input type="text" class="list-title" value="${list.title}" data-id="${list.id}"> 
                      <button class="delete-list-btn" data-id="${list.id}">✖</button>
                    </div> 
                    <h3>To do</h3>
                    <ul class="task-list"></ul>
                    <form class="add-task-form" data-id="${list.id}">
                      <input type="text" class="task-input" placeholder="Tilføj en opgave">
                      <input type="number" class="quantity-input" placeholder="Antal" min="1" value="1">
                      <button type="submit">Tilføj</button>
                    </form>
                    <h3>Done</h3>
                    <ul class="completed-task-list"></ul>
                  `;

      //value gør at titlen vises automatisk
      //data-id gemmer det unikke ID

      //ændrer titlen i to do listen
      const titleInput = listElement.querySelector(".list-title");
      titleInput.addEventListener("change", (event) => {
        list.title = event.target.value;
        updateLocalStorage();
      });

      //Sletter en to do liste
      const deleteListBtn = listElement.querySelector(".delete-list-btn");
      deleteListBtn.addEventListener("click", () => {
        lists = lists.filter((l) => l.id !== list.id); //Fjerner listen
        updateLocalStorage();
        showLists();
      });

      const taskList = listElement.querySelector(".task-list");
      const completedTaskList = listElement.querySelector(
        ".completed-task-list"
      );
      // Gennemgår alle opgaverne i listen og viser dem
      list.tasks.forEach((task, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
                        <input type="checkbox" class="task-checkbox" data-list-id="${
                          list.id
                        }" data-task-id="${index}" ${
          task.done ? "checked" : ""
        }>
                        <span class="${task.done ? "done" : ""}">${
          task.text
        } (x${task.quantity})</span>
                        <button class="delete-task-btn" data-list-id="${
                          list.id
                        }" data-task-id="${index}">Slet</button>
                      `;

        //Placerer opgaven i den rigtige "kategori": "To do" eller "Done"
        if (task.done) {
          completedTaskList.appendChild(li);
        } else {
          taskList.appendChild(li);
        }

        // Slet en to do opgave
        const deleteTaskBtn = li.querySelector(".delete-task-btn");
        deleteTaskBtn.addEventListener("click", () => {
          list.tasks.splice(index, 1); // Fjern to do opgaven
          updateLocalStorage();
          showLists();
        });

        // Tjek opgave som er udført med checkbox
        const taskCheckbox = li.querySelector(".task-checkbox");
        taskCheckbox.addEventListener("change", (event) => {
          task.done = event.target.checked;
          //flytter opgaven
          if (task.done) {
            // Hvis opgaven er markeret som færdig, skal den flyttes til den færdige liste (done)
            completedTaskList.appendChild(li);
          } else {
            // Hvis opgaven ikke er færdig, skal den flyttes tilbage til to do listen
            taskList.appendChild(li);
          }
          updateLocalStorage();
          showLists();
        });
      });

      //tilføjer eventlistener og finder den rigtige formular
      const addTaskForm = listElement.querySelector(".add-task-form");
      addTaskForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const taskInput = addTaskForm.querySelector(".task-input");
        const quantityInput = addTaskForm.querySelector(".quantity-input");
        const taskText = taskInput.value.trim();
        const quantity = parseInt(quantityInput.value) || 1;

        if (taskText === "") return;

        // Tilføj ny opgave med done: false (dvs. den vises under "To do")
        const newTask = { text: taskText, quantity: quantity, done: false };
        list.tasks.push(newTask);
        updateLocalStorage();
        showLists();
      });

      listsContainer.appendChild(listElement); //tilføjer listen
    });
  }

  //henter lister fra localStorage
  function updateLocalStorage() {
    localStorage.setItem("toDoLists", JSON.stringify(lists));
  }

  function loadLists() {
    const storedLists = localStorage.getItem("toDoLists");
    if (storedLists) {
      try {
        const parsedLists = JSON.parse(storedLists);
        return parsedLists;
      } catch (error) {
        console.error("Error parsing localStorage data:", error);
        return [];
      }
    }
    return [];
  }
});
