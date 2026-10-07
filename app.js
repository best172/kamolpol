import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import {
  getFirestore, collection, addDoc, deleteDoc, doc, updateDoc,
  query, where, orderBy, onSnapshot, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// 1) Replace these values with your Firebase Web App config.
// Firebase Console -> Project settings -> Your apps -> Web app
const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY",
  authDomain: "PASTE_YOUR_PROJECT.firebaseapp.com",
  projectId: "PASTE_YOUR_PROJECT_ID",
  storageBucket: "PASTE_YOUR_STORAGE_BUCKET",
  messagingSenderId: "PASTE_YOUR_SENDER_ID",
  appId: "PASTE_YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const authView = document.querySelector("#authView");
const todoView = document.querySelector("#todoView");
const authForm = document.querySelector("#authForm");
const email = document.querySelector("#email");
const password = document.querySelector("#password");
const authButton = document.querySelector("#authButton");
const authMessage = document.querySelector("#authMessage");
const loginTab = document.querySelector("#loginTab");
const registerTab = document.querySelector("#registerTab");
const logoutButton = document.querySelector("#logoutButton");
const userEmail = document.querySelector("#userEmail");
const taskForm = document.querySelector("#taskForm");
const taskInput = document.querySelector("#taskInput");
const taskList = document.querySelector("#taskList");
const count = document.querySelector("#count");
const clearCompleted = document.querySelector("#clearCompleted");
const todoMessage = document.querySelector("#todoMessage");

let mode = "login";
let filter = "all";
let unsubscribeTasks = null;
let tasks = [];

loginTab.onclick = () => setMode("login");
registerTab.onclick = () => setMode("register");

function setMode(next) {
  mode = next;
  loginTab.classList.toggle("active", mode === "login");
  registerTab.classList.toggle("active", mode === "register");
  authButton.textContent = mode === "login" ? "Login" : "Register";
  authMessage.textContent = "";
}

authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  authMessage.textContent = "";
  try {
    if (mode === "login") {
      await signInWithEmailAndPassword(auth, email.value.trim(), password.value);
    } else {
      await createUserWithEmailAndPassword(auth, email.value.trim(), password.value);
    }
    authForm.reset();
  } catch (err) {
    authMessage.textContent = friendlyError(err);
  }
});

logoutButton.onclick = () => signOut(auth);

onAuthStateChanged(auth, (user) => {
  if (unsubscribeTasks) unsubscribeTasks();
  if (!user) {
    authView.classList.remove("hidden");
    todoView.classList.add("hidden");
    return;
  }
  authView.classList.add("hidden");
  todoView.classList.remove("hidden");
  userEmail.textContent = user.email;
  subscribeTasks(user.uid);
});

function subscribeTasks(uid) {
  const q = query(collection(db, "tasks"), where("uid", "==", uid), orderBy("createdAt", "desc"));
  unsubscribeTasks = onSnapshot(q, (snapshot) => {
    tasks = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    render();
  }, (err) => {
    todoMessage.textContent = "Database error: " + err.message;
  });
}

taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  const user = auth.currentUser;
  if (!text || !user) return;
  try {
    await addDoc(collection(db, "tasks"), {
      uid: user.uid, text, completed: false, createdAt: serverTimestamp()
    });
    taskInput.value = "";
  } catch (err) {
    todoMessage.textContent = friendlyError(err);
  }
});

document.querySelectorAll(".filter").forEach(btn => {
  btn.onclick = () => {
    filter = btn.dataset.filter;
    document.querySelectorAll(".filter").forEach(x => x.classList.remove("active"));
    btn.classList.add("active");
    render();
  };
});

async function toggleTask(id, completed) {
  await updateDoc(doc(db, "tasks", id), { completed: !completed });
}

async function removeTask(id) {
  await deleteDoc(doc(db, "tasks", id));
}

clearCompleted.onclick = async () => {
  await Promise.all(tasks.filter(t => t.completed).map(t => deleteDoc(doc(db, "tasks", t.id))));
};

function render() {
  const shown = tasks.filter(t =>
    filter === "all" || (filter === "active" && !t.completed) || (filter === "completed" && t.completed)
  );
  taskList.innerHTML = "";
  shown.forEach(t => {
    const li = document.createElement("li");
    li.className = "task" + (t.completed ? " done" : "");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = !!t.completed;
    checkbox.onchange = () => toggleTask(t.id, t.completed);

    const span = document.createElement("span");
    span.textContent = t.text;

    const del = document.createElement("button");
    del.className = "delete";
    del.textContent = "Delete";
    del.onclick = () => removeTask(t.id);

    li.append(checkbox, span, del);
    taskList.appendChild(li);
  });

  const active = tasks.filter(t => !t.completed).length;
  count.textContent = `${active} ${active === 1 ? "task" : "tasks"} left`;
}

function friendlyError(err) {
  const code = err?.code || "";
  const map = {
    "auth/invalid-credential": "Email or password is incorrect.",
    "auth/email-already-in-use": "This email is already registered.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/invalid-email": "Please enter a valid email.",
    "auth/operation-not-allowed": "Enable Email/Password sign-in in Firebase Authentication."
  };
  return map[code] || err.message || "Something went wrong.";
}
