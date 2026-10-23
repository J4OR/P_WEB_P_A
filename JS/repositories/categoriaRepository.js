import { BaseRepository } from "./BaseRepository.js";
import { CategoriaModel } from "../models/categoriaModel.js";

export class CategoriaRepository extends BaseRepository {
  constructor(storage) {
    super(CategoriaModel, storage);
  }
}
