import { BaseRepository } from "./BaseRepository.js";
import { ProductoModel } from "../models/productoModel.js";

export class ProductoRepository extends BaseRepository {
  constructor(storage) {
    super(ProductoModel, storage);
  }
}