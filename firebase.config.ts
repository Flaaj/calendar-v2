// const configTemplate = {
//     apiKey: "",
//     authDomain: "",
//     databaseURL: "",
//     projectId: "",
//     storageBucket: "",
//     messagingSenderId: "",
//     appId: "",
// };

import prodConfig from "./firebase.config.prod";
import devConfig from "./firebase.config.dev";

export default process.env.NODE_ENV === "production" ? prodConfig : devConfig;
