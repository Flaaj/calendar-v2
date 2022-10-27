// store:
import { store } from "./store";
const dispatch = store.dispatch;
// database:
const firebaseConfig = require("../firebase.config.json");
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
// Actions:
import { Actions } from "./actionCreators";
// helper functions:
import { getRefFromDateObject } from "./functions";

export const initializeApp = () => {
  firebase.initializeApp(firebaseConfig);
  dispatch(Actions.onAppInitialized());
  authStateListener();
};

export const authenticate = (login, password) => (e) => {
  e.preventDefault();
  dispatch(Actions.beforeLogin());
  firebase
    .auth()
    .signInWithEmailAndPassword(login, password)
    .then(({ user }) => {
      dispatch(Actions.loginSuccessful(user));
    })
    .catch(({ code, message }) => {
      console.log(code, message);
      dispatch(Actions.loginFailed());
    });
};

export const logOut = () => firebase.auth().signOut();

// export const createUser = (dispatch) => (login, password) => (e) => {
//     e.preventDefault();
//     if (
//         password.length < 8 ||
//         !password.split("").some((letter) => letter.charCodeAt(0) < 91 && letter.charCodeAt(0) > 64) ||
//         !password.split("").some((letter) => letter.charCodeAt(0) < 123 && letter.charCodeAt(0) > 96) ||
//         !password.split("").some((letter) => letter.charCodeAt(0) < 58 && letter.charCodeAt(0) > 47)
//     ) {
//         alert(
//             "hasło musi miec przynajmniej 8 znaków, zawierać przynajmniej " +
//                 "jedną duża literę, przynajmnij jedną małą literę i przynajmniej jedną cyfrę "
//         );
//     } else {
//         firebase
//             .auth()
//             .createUserWithEmailAndPassword(login, password)
//             .catch((err) => console.log(err));
//     }
// };

export const authStateListener = () => {
  firebase.auth().onAuthStateChanged((user) => {
    if (user)
      firebase
        .database()
        .ref(`users/${user.uid}`)
        .get()
        .then((snapshot) => {
          if (snapshot.exists()) {
            dispatch(Actions.getUserOptions(snapshot.val().options));
          } else {
            console.log("No user options data available");
          }
        });

    dispatch(Actions.authStateChange(user));
  });
};

export const queryMonthsToListen = (dispatch) => (month, year) => {
  const { data } = store.getState().database;
  const monthsToQuery =
    month === 1
      ? [
          [12, year - 1],
          [1, year],
          [2, year],
        ]
      : month === 12
      ? [
          [11, year],
          [12, year],
          [1, year + 1],
        ]
      : [
          [month - 1, year],
          [month, year],
          [month + 1, year],
        ];

  monthsToQuery.forEach(([month, year]) => {
    const target = `${year}/${month}`;
    if (!data[target]) {
      firebase
        .database()
        .ref(target)
        .on("value", (snapshot) => {
          if (snapshot.val()) {
            dispatch(Actions.updateData(target, snapshot.val()));
          } else {
            dispatch(Actions.updateData(target, true));
          }
        });
    }
  });
};

export const addNewAppointment = async (target, body) => {
  firebase
    .database()
    .ref(target)
    .push(body)
    .catch((err) => console.log(err));
};

export const updateAppointment = (appointment, body) => {
  const { date, id } = appointment;

  firebase
    .database()
    .ref(getRefFromDateObject(date, id))
    .update(body)
    .catch((err) => console.log(err));
};

export const moveAppointment = (appointment, newDate) => {
  const { date, id } = appointment;

  const oldRef = firebase.database().ref(getRefFromDateObject(date, id));
  const newRef = firebase.database().ref(getRefFromDateObject(new Date(newDate), id));

  oldRef
    .once("value", (snapshot) => {
      newRef.set(snapshot.val(), (error) => {
        if (!error) {
          oldRef.remove();
        }
      });
    })
    .catch((err) => console.log(err));
};

export const deleteAppointment = () => {
  const {
    date: {
      chosenAppointment: { date, id },
    },
  } = store.getState();

  firebase
    .database()
    .ref(getRefFromDateObject(date, id))
    .remove()
    .catch((err) => console.log(err));
};

export const messageListener = (dispatch) => () => {
  const { messages } = store.getState().database;
  if (messages.length === 0) {
    firebase
      .database()
      .ref("messages")
      .on("value", (snapshot) => {
        if (snapshot.val()) {
          const messagesData = Object.entries(snapshot.val());
          dispatch(Actions.updateMessages(messagesData));
        } else {
          const placeholderObject = { empty: true };
          dispatch(Actions.updateMessages(placeholderObject));
        }
      });
  }
};

export const sendMessage = (messageToSend, setMessageToSend) => (e) => {
  e.preventDefault();

  if (messageToSend) {
    const body = {
      user: firebase.auth().currentUser.email,
      date: new Date().getTime(),
      msg: messageToSend,
    };
    firebase
      .database()
      .ref("messages")
      .push(body)
      .then(() => {
        setMessageToSend("");
      });
  }
};

export const deleteMessage = (id) => (e) => {
  e.preventDefault();

  firebase
    .database()
    .ref(`messages/${id}`)
    .remove()
    .then(() => {
      console.log("deleted");
    });
};
