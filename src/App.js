import React from "react";
import "./styles/app.css";
import { db, storage } from "./firebase";
import {
  doc,
  setDoc,
  onSnapshot,
  deleteDoc,
  updateDoc,
  collection,
} from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

function App() {
  /** Стейт, в который помещаются todos */
  const [list, setList] = React.useState([]);
  /** Стейт, для определения текущей даты */
  const [currDate, setCurrDate] = React.useState("");
  /** Стейт для открытия параметров изменения заметки */
  const [edit, setEdit] = React.useState(false);
  /** Стейт для скрытия/показа создания заметки*/
  const [showCreate, setShowCreate] = React.useState(false);
  /** Стейт для связыния названия заметки из input */
  const [inpTitle, setInpTitle] = React.useState("");
  /** Стейт для связыния содержания заметки из input */
  const [inpText, setInpText] = React.useState("");
  /** Стейт для связыния даты заметки из input */
  const [inpDate, setInpDate] = React.useState("");
  /** Стейт для связыния файла заметки из input */
  const [file, setFile] = React.useState("");
  /** Функция,обрабатывающая открытие или закртытие окна создания заметки */
  const showModal = () => {
    setShowCreate(!showCreate);
  };
  /** Функция,обрабатывающая загрузку файла */
  function handleChange(event) {
    setFile(event.target.files[0]);
  }
  /** Функция,обрабатывающая  закртытие окна изменения заметки */
  const cancelChange = () => {
    setEdit(!edit);
    showModal();
    setInpTitle("");
    setInpText("");
    setInpDate("");
    setFile("");
  };
  /** Функция, загружающая изображение в Firebase Storage
   * @param {number} a - id заметки в storage,которое является  timestamp  в момент создания заметки
   * */
  const sendToFireb = (a) => {
    const storageRef = ref(storage, `/${a}/a`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTask.on(
      "state_changed",
      (snapshot) => {},
      (err) => console.log(err),
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          const img = document.getElementById(`${a}`);
          if (img) {
            img.setAttribute("src", url);
          }
        });
      }
    );
  };
  /** Функция, создающая заметку в Firebase Firestore */
  const addToDo = async () => {
    let a = Number(new Date());
    let files = "0";
    if (file !== "") {
      files = "1";
    }
    await setDoc(doc(db, "todos", `${a}`), {
      title: inpTitle,
      text: inpText,
      time: a,
      date: inpDate,
      done: "0",
      file: files,
    });
    await sendToFireb(a);
    showModal();
    setInpTitle("");
    setInpText("");
    setInpDate("");
    setFile("");
  };
  /** Функция, которая вызывается при нажатии изменить заметку
   * делает открытие окна изменения,вставляет данные заметки в инпуты
   * @param {object} item - объект заметки
   * */
  const redactTask = async (item) => {
    window.scrollTo(0, 0);
    showModal();
    setEdit(!edit);
    setInpTitle(item.title);
    setInpText(item.text);
    setInpDate(item.date);
  };
  /** Функция, которая вызывается при нажатии сохранить изменения
   * Изменяет заметку в Firebase Firestore
   * @param {object} item - объект заметки
   * */
  const editTask = async (item) => {
    if (file !== "") {
      await sendToFireb(item.time);
      const noteRef = doc(db, "todos", `${item.time}`);
      await updateDoc(noteRef, {
        title: inpTitle,
        text: inpText,
        date: inpDate,
        file: "1",
      });
    } else {
      const noteRef = doc(db, "todos", `${item.time}`);
      await updateDoc(noteRef, {
        title: inpTitle,
        text: inpText,
        date: inpDate,
      });
    }
    cancelChange();
  };
  /** Функция удаления заметки
   * @param {object} item - объект заметки
   * */
  const deleteTask = async (item) => {
    await deleteDoc(doc(db, "todos", `${item.time}`));
    if (item.file === "1") {
      const desertRef = ref(storage, `${item.time}/a`);
      await deleteObject(desertRef);
    }
  };

  /** useEffect для обновления списка заметок и Firestore в режиме realtime */
  React.useEffect(() => {
    onSnapshot(collection(db, "todos"), (snapshot) => {
      setList(snapshot.docs.map((doc) => doc.data()));
    });
  }, [showCreate]);
  /** useEffect для визуализации выполнения задачи или завершения ее срока годности
   * С помощью интервала, каждую секунду создается новый timestamp,который сравнивается с датой заметки
   * Для каждой заметки находится <span>,в котором меняется статус заметки
   * */
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrDate(Date.now());
      list.forEach((item, i) => {
        const el = document.getElementById(`${i}`);
        let text = document.getElementsByClassName(`class-${i}`);
        let a = Date.parse(item.date);
        if (currDate > a) {
          el.classList.add("over");
          text[0].innerHTML = "Истекло";
        } else {
          el.classList.remove("over");
          if (item.done === "1") {
            el.classList.add("done");
            text[0].innerHTML = "Выполнено";
          } else {
            el.classList.remove("done");
            text[0].innerHTML = "Невыполнено";
          }
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  });
  /** useEffect для для загрузки изображения к заметке при первом рендере */
  React.useEffect(() => {
    list.forEach((item) => {
      if (item.file === "1") {
        getDownloadURL(ref(storage, `/${item.time}/a`))
          .then((url) => {
            if (url) {
              const img = document.getElementById(`${item.time}`);
              if (img) {
                img.setAttribute("src", url);
              }
            }
          })
          .catch(() => {
            console.log("here");
          });
      }
    });
  });
  /** Функция обрабатыващая завершение заметки
   * Меняет цвет заметки в зависимости от статусы
   * @param {object} item - объект заметки
   * @param {number} i - индекс заметки в list
   * */
  const taskDone = async (item, i) => {
    const noteRef = doc(db, "todos", `${item.time}`);
    const el = document.getElementById(i);
    let a = Date.parse(item.date);
    console.log(a);
    if (currDate > a) {
      el.classList.add("over");
    }
    if (item.done === "0") {
      await updateDoc(noteRef, { done: "1" });
      el.classList.add("done");
    } else {
      await updateDoc(noteRef, { done: "0" });
      el.classList.remove("done");
    }
  };

  return (
    <div className="App">
      <h1>To Do</h1>
      <div className="wrap">
        <div className="left">
          <h2>Задачи</h2>
          {list.map((item, i) => (
            <div
              key={i}
              className={item.done === "1" ? "todo done" : "todo"}
              id={`${i}`}
            >
              <p>
                Название {item.title}
                <span className={`class-${i}`}> </span>
              </p>
              <p>Поле {item.text}</p>
              <p>Дата {item.date}</p>

              {item.file === "1" && (
                <>
                  <p>Файл</p>
                  <img className={"myimg"} id={`${item.time}`} />
                </>
              )}

              {!edit && (
                <button onClick={() => redactTask(item, i)}>Изменить</button>
              )}

              <button onClick={() => taskDone(item, i)}>
                {item.done === "1" ? "Невыполнено" : "Выполнить"}
              </button>

              <button onClick={() => deleteTask(item)}>Удалить</button>
              {edit && (
                <button
                  className={"create"}
                  type={"submit"}
                  onClick={() => editTask(item)}
                >
                  Cохранить изменения
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="right">
          <h2>{edit ? "Изменить" : "Создать"}</h2>
          {!edit && (
            <button onClick={showModal}>
              {showCreate ? "Отменить" : "Создать"}
            </button>
          )}
          {edit && (
            <button onClick={cancelChange}>{"Отменить изменение"}</button>
          )}
          {showCreate && (
            <div className="createTask">
              <p>Название</p>
              <input
                type="text"
                onChange={(event) => setInpTitle(event.target.value)}
                value={inpTitle}
              />
              <p>Поле</p>
              <input
                type="text"
                onChange={(event) => setInpText(event.target.value)}
                value={inpText}
              />
              <p>Дата завершения</p>
              <input
                type="datetime-local"
                onChange={(event) => setInpDate(event.target.value)}
                value={inpDate}
              />
              <p>Дата завершения</p>
              <input type="file" onChange={handleChange} accept="/image/*" />
              {!edit && (
                <button className={"create"} type={"submit"} onClick={addToDo}>
                  Создать задачу
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
