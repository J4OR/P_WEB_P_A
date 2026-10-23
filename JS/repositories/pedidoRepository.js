import { BaseRepository } from "./BaseRepository.js";
import { PedidoModel } from "../models/pedidoModel.js";

export class PedidoRepository extends BaseRepository {
  constructor(storage) {
    super(PedidoModel, storage);
  }
}