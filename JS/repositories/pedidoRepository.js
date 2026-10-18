import { BaseRepository } from "./BaseRepository.js";

export class PedidoRepository extends BaseRepository {
  constructor(storage) {
    super("pedidos", storage);
  }
}