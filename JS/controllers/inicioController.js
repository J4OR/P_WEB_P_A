import { initializeMenu } from "../utils/Menu.js";
import { initializeProfile } from "../utils/Profile.js";
import { InicioView } from "../views/InicioView.js";

initializeMenu();
initializeProfile();
new InicioView().initialize();