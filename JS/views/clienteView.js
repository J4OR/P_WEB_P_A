import { BaseEntityView } from "./BaseEntityView.js";

export class ClienteView extends BaseEntityView {
  render(records = this.repository.getAll()) {
    super.render(records);
  }
}