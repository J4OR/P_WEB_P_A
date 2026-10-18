import { BaseRepository } from "./BaseRepository.js";

export class ClienteRepository extends BaseRepository {
  constructor(storage) {
    super("clientes", storage);
  }
}