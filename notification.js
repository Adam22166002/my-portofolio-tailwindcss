const TokenElem = document.getElementById("token");
const ErrElem = document.getElementById("err");
const notificationButton = document.getElementById("notificationButton");
let swRegistration = null;

const config = {
  apiKey: "AIzaSyC2k9VXe5qcNo-KuRqGHEQPtBufz6R0ZLI",
  authDomain: "portofolio-22be5.firebaseapp.com",
  projectId: "portofolio-22be5",
  storageBucket: "portofolio-22be5.firebasestorage.app",
  messagingSenderId: "878054235263",
  appId: "1:878054235263:web:9bd45030bd00901d9bf34a",
  measurementId: "G-L8BQKF6X2K",
};

firebase.initializeApp(config);
const messaging = firebase.messaging();

// IndexedDB
function initDB() {
  return new Promise((resolve, reject) => {
    const dbRequest = indexedDB.open("tokensDB", 1);

    dbRequest.onerror = () => {
      reject("Error membuka database");
    };

    dbRequest.onsuccess = () => {
      resolve(dbRequest.result);
    };

    dbRequest.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("tokens")) {
        db.createObjectStore("tokens", { keyPath: "id" });
      }
    };
  });
}

// Save token ke IndexedDB
async function saveTokenToIndexedDB(token) {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["tokens"], "readwrite");
      const store = transaction.objectStore("tokens");

      const request = store.put({ id: "fcmToken", token: token });

      request.onsuccess = () => {
        console.log("Token saved successfully");
        resolve();
      };
    });
  } catch (error) {
    console.error("Error di saveTokenToIndexedDB:", error);
    throw error;
  }
}

// ambil token ke IndexedDB
async function getTokenFromIndexedDB() {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["tokens"], "readonly");
      const store = transaction.objectStore("tokens");
      const request = store.get("fcmToken");

      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result.token);
        } else {
          reject("Token tidak ada");
        }
      };
    });
  } catch (error) {
    console.error("Error di getTokenFromIndexedDB:", error);
    throw error;
  }
}

// Initialize UI
function initializeUi() {
  notificationButton.addEventListener("click", async () => {
    try {
      await displayNotification();
      await requestToken();
    } catch (error) {
      console.error("Error inisialisasi notifications:", error);
    }
  });
}

// Display a notification
async function displayNotification() {
  if (Notification.permission === "granted") {
    // Show a sample notification
    const notificationOptions = {
      body: "Hello, Notifikasi Success selamat!",
      icon: "/dist/img/apk-192x192.png",
    };
    swRegistration.showNotification("Pemberitahuan Notifikasi", notificationOptions);
  } else if (Notification.permission !== "denied") {
    await Notification.requestPermission();
  }
}

// Request token and handle IndexedDB
async function requestToken() {
  try {
    const token = await messaging.getToken();
    if (token) {
      await saveTokenToIndexedDB(token);
      TokenElem.textContent = "Token FCM: " + token;
      console.log("Token FCM:", token);
    } else {
      console.warn("Tidak ada token");
    }
  } catch (error) {
    if (Notification.permission === "denied") {
      alert(
        "Izin notifikasi ditolak, silahkan cek kembali!"
      );
    } else {
      console.error("Error mengambil token:", error);
    }
  }
}

// Initialize FCM and UI
navigator.serviceWorker.register("/firebase-messaging-sw.js").then((registration) => {
    swRegistration = registration;
    initializeUi();
  })
  .catch((error) => {
    console.error("Service worker registration failed:", error);
  });
