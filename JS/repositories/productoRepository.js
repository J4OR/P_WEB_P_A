import { BaseRepository } from "./BaseRepository.js";

export class ProductoRepository extends BaseRepository {
  constructor(storage) {
    super("productos", storage);
  }
}