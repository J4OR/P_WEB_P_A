import { initializeProfile } from "../utils/Profile.js";
import { InicioView } from "../views/InicioView.js";

window.initializeMenu();
initializeProfile();
new InicioView().initialize();