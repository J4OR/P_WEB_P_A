import { BaseRepository } from "./BaseRepository.js";

export class CategoriaRepository extends BaseRepository {
  constructor(storage) {
    super("categorias", storage);
  }
}
