import { BaseRepository } from "./BaseRepository.js";
import { ClienteModel } from "../models/clienteModel.js";

export class ClienteRepository extends BaseRepository {
  constructor(storage) {
    super(ClienteModel, storage);
  }
}